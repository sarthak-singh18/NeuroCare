# NeuraCare Privacy Notice

_Last updated: November 15, 2025_

NeuraCare is designed to run entirely on your machine. No reflective notes or telemetry leave localhost unless you explicitly modify the source code. This document explains what we store, why it is required for the experience, and how you can export or delete it.

## What We Collect

| Data Class | Details | Storage Location |
|------------|---------|------------------|
| **Text inputs** | The reflections you submit through the Input Panel, along with derived sentiment scores | `server/data/db.json` under `analyses` |
| **Timestamps & metadata** | Submission timestamps, optional mood sliders, and device-friendly identifiers | `analyses` entries |
| **Profiles & preferences** | Display name, timezone, personalization flags (breathing length, detox format), consent status, and the last analysis summary | `profiles[userId]` |
| **Consent ledger** | Every “accept” or “decline” recorded with a timestamp so you can audit changes | `consents` array |

No third-party analytics SDKs or remote APIs are invoked by default. Audio, video, biometric, and GPS data are **never** captured.

## Why We Store It

1. **Personalization** — Breathing timers, detox suggestions, and prompts need a local profile and the most recent analysis.
2. **Safety rails** — Consent decisions and retention markers ensure the app stops processing when you revoke permission.
3. **Offline continuity** — Keeping the JSON database on disk lets you resume work without re-entering all of your setup.

## Retention Policy

- When you grant consent, your profile stays active until you delete it.
- When you revoke consent, `profiles[userId].retentionUntil` is set to **now + 7 days**. During that window the app blocks new analysis and gives you time to export or delete the data yourself.
- After the retention window, manually delete the profile via the UI or by removing the entry from `server/data/db.json` (see below).

## Export & Delete Instructions

### Export

You can export data in two ways:

1. **UI:** Open the Privacy modal and click **“Export data”**. This calls `GET /api/export/:userId` and downloads a JSON bundle containing your profile, analyses, and consent history.
2. **API:** `curl http://localhost:5000/api/export/<userId> > export.json`

### Delete

1. Use the Privacy modal’s **“Delete data”** button (sends `DELETE /api/profile/:userId`).
2. Or run: `curl -X DELETE http://localhost:5000/api/profile/<userId>`
3. Optionally remove the entire `server/data/db.json` file to wipe all users.

## Operator Responsibilities

- Keep `server/data/db.json` readable only by the account running Node (e.g., `chmod 600 server/data/db.json`).
- When hosting beyond localhost, terminate TLS in front of the Express server and run on encrypted disks/volumes.
- Never check real data or API keys into version control. Use environment variables or a secrets manager for any production secrets.

## Contact

For questions or takedown requests, replace this placeholder with a real contact method, e.g., `privacy@yourdomain.com`.
