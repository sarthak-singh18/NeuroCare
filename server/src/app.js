const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { analyzeText } = require('../sentiment');
const { readDB, updateDB } = require('./lib/db');
const {
  validateAnalyzePayload,
  validateProfilePayload,
  validateConsentPayload
} = require('./lib/validators');

const RETENTION_DAYS = 7;

function computeRetentionUntil() {
  const date = new Date();
  date.setDate(date.getDate() + RETENTION_DAYS);
  return date.toISOString();
}

function isConsentRevoked(profile) {
  if (!profile) return false;
  const revoked = profile.consent && profile.consent.consentGiven === false;
  const withinRetention = profile.retentionUntil && new Date(profile.retentionUntil).getTime() > Date.now();
  return revoked || withinRetention;
}

function hasActiveConsent(profile) {
  if (!profile) return false;
  const consentGiven = profile.consent && profile.consent.consentGiven === true;
  const retentionExpired = !profile.retentionUntil;
  return consentGiven && retentionExpired;
}

function sanitizeProfileForExport(profile, analyses, consents) {
  return {
    profile,
    analyses: analyses.filter((entry) => entry.userId === profile.userId),
    consents: consents.filter((entry) => entry.userId === profile.userId)
  };
}

const FRONTEND_ORIGIN = process.env.NEURACARE_FRONTEND_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
    optionsSuccessStatus: 200
  })
);
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  const { valid, errors } = validateAnalyzePayload(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const { userId, text, timestamp } = req.body;
  const metadata = req.body.metadata || null;

  try {
    const dbSnapshot = await readDB();
    const profile = dbSnapshot.profiles[userId];

    if (isConsentRevoked(profile)) {
      return res.status(403).json({
        error: 'Consent has been revoked. Delete data or re-consent to continue analysis.'
      });
    }

    if (!hasActiveConsent(profile)) {
      return res.status(403).json({
        error: 'Consent is required before running burnout analysis.'
      });
    }

    const analysis = await analyzeText({
      text,
      metadata,
      profile
    });

    const record = { userId, text, timestamp, metadata, ...analysis };

    await updateDB((draft) => {
      draft.analyses.push(record);
      const existingProfile = draft.profiles[userId] || {
        userId,
        name: metadata?.name || profile?.name || 'Guest',
        timezone: profile?.timezone || 'UTC',
        preferences: profile?.preferences || {},
        consent: profile?.consent || null,
        retentionUntil: profile?.retentionUntil || null
      };

      draft.profiles[userId] = {
        ...existingProfile,
        lastAnalysis: {
          timestamp,
          sentimentScore: analysis.sentimentScore,
          sentimentLabel: analysis.sentimentLabel,
          burnoutRisk: analysis.burnoutRisk,
          suggestions: analysis.suggestions
        }
      };

      return draft;
    });

    return res.json({ userId, timestamp, ...analysis });
  } catch (error) {
    console.error('Failed to analyze text', error);
    return res.status(500).json({ error: 'Unable to process analysis request' });
  }
});

app.post('/api/profile', async (req, res) => {
  const { valid, errors } = validateProfilePayload(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const { userId, name, timezone, preferences = {} } = req.body;
  const profile = {
    userId,
    name,
    timezone,
    preferences
  };

  try {
    let previousLastAnalysis = null;
    let previousConsent = null;
    let previousRetention = null;
    await updateDB((db) => {
      previousLastAnalysis = db.profiles[userId]?.lastAnalysis || null;
      previousConsent = db.profiles[userId]?.consent || null;
      previousRetention = db.profiles[userId]?.retentionUntil || null;
      db.profiles[userId] = {
        ...profile,
        lastAnalysis: previousLastAnalysis,
        consent: previousConsent,
        retentionUntil: previousRetention
      };
      return db;
    });

    return res.status(200).json({
      ...profile,
      lastAnalysis: previousLastAnalysis,
      consent: previousConsent,
      retentionUntil: previousRetention
    });
  } catch (error) {
    console.error('Failed to upsert profile', error);
    return res.status(500).json({ error: 'Unable to save profile' });
  }
});

app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await readDB();
    const profile = db.profiles[userId];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    console.error('Failed to read profile', error);
    return res.status(500).json({ error: 'Unable to read profile' });
  }
});

app.get('/api/profile/:userId/export', async (req, res) => {
  const { userId } = req.params;
  try {
    const db = await readDB();
    const profile = db.profiles[userId];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const bundle = sanitizeProfileForExport(profile, db.analyses, db.consents);
    return res.json(bundle);
  } catch (error) {
    console.error('Failed to export profile', error);
    return res.status(500).json({ error: 'Unable to export profile' });
  }
});

app.get('/api/export/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const db = await readDB();
    const profile = db.profiles[userId];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const bundle = sanitizeProfileForExport(profile, db.analyses, db.consents);
    return res.json(bundle);
  } catch (error) {
    console.error('Failed to export profile', error);
    return res.status(500).json({ error: 'Unable to export profile' });
  }
});

app.delete('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    let removed = false;
    await updateDB((db) => {
      if (db.profiles[userId]) {
        delete db.profiles[userId];
        removed = true;
      }
      db.analyses = db.analyses.filter((entry) => entry.userId !== userId);
      db.consents = db.consents.filter((entry) => entry.userId !== userId);
      return db;
    });

    if (!removed) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete profile', error);
    return res.status(500).json({ error: 'Unable to delete profile' });
  }
});

app.post('/api/consent', async (req, res) => {
  const { valid, errors } = validateConsentPayload(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const record = {
    userId: req.body.userId,
    consentGiven: req.body.consentGiven,
    timestamp: req.body.timestamp
  };

  try {
    await updateDB((db) => {
      db.consents.push(record);

      const retentionUntil = record.consentGiven ? null : computeRetentionUntil();
      const existingProfile = db.profiles[record.userId] || {
        userId: record.userId,
        name: 'Guest',
        timezone: 'UTC',
        preferences: {}
      };

      db.profiles[record.userId] = {
        ...existingProfile,
        consent: {
          consentGiven: record.consentGiven,
          timestamp: record.timestamp
        },
        retentionUntil
      };

      return db;
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error('Failed to record consent', error);
    return res.status(500).json({ error: 'Unable to save consent' });
  }
});

module.exports = app;
