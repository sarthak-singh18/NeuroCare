let Sentiment;
const multiAI = require('./services/multiAI');

try {
  // Lazy require so Jest can stub if needed
  // eslint-disable-next-line global-require
  Sentiment = require('sentiment');
} catch (error) {
  console.warn('[sentiment] Package not available, using fallback lexicon-scoring.');
  Sentiment = null;
}

const CUSTOM_LEXICON = {
  calm: 2,
  balanced: 2,
  recharged: 2,
  energized: 2,
  supported: 1,
  grateful: 2,
  tired: -2,
  exhausted: -3,
  overwhelmed: -3,
  burned: -3,
  burnout: -4,
  stressed: -3,
  anxious: -3,
  panic: -4,
  insomnia: -3,
  drained: -3,
  hopeless: -4
};

const KEYWORDS = [
  'exhausted',
  "can't",
  'tired',
  'overwhelmed',
  'sleep',
  'insomnia',
  'drained',
  'burnout',
  'hopeless',
  'stressed',
  'anxious',
  'panic'
];

const FREQUENCY_PATTERNS = [
  /every\s+day/i,
  /each\s+day/i,
  /daily/i,
  /all\s+day/i,
  /every\s+night/i,
  /constantly/i
];

const SUGGESTIONS = {
  breathing: [
    '4-7-8 breathing technique for stress relief',
    'Box breathing: inhale 4s, hold 4s, exhale 4s for 5 rounds',
    'Alternate nostril breathing for 5 minutes',
    'Deep belly breathing with 6-second cycles'
  ],
  detox: [
    '2-hour phone-free evening routine before bed',
    'Schedule a 30-minute notification blackout after lunch',
    'Create a tech-free workspace for 1 hour',
    'Morning meditation without devices for 10 minutes'
  ],
  energy: [
    'Take a 10-minute energizing walk outside',
    'Do 5 minutes of light stretching or yoga',
    'Listen to upbeat music for a quick mood boost',
    'Practice gratitude by writing 3 positive things'
  ],
  sleep: [
    'Establish a consistent bedtime routine',
    'Avoid screens 1 hour before sleep',
    'Try progressive muscle relaxation',
    'Keep your bedroom cool and dark'
  ]
};

const analyzer = Sentiment ? new Sentiment({ extras: CUSTOM_LEXICON }) : null;

function fallbackScore(text = '') {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) return 0;

  const total = tokens.reduce((sum, token) => sum + (CUSTOM_LEXICON[token] || 0), 0);
  return total;
}

function computeSentimentScore(text) {
  if (!text || !text.trim()) return 0;

  // Enhanced sentiment scoring with more nuanced analysis
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  // Base sentiment analysis
  if (analyzer) {
    try {
      const { score: baseScore } = analyzer.analyze(text);
      if (Number.isFinite(baseScore)) {
        score = baseScore;
      }
    } catch (error) {
      console.error('[sentiment] Analyzer failed, falling back:', error.message);
      score = fallbackScore(text);
    }
  } else {
    score = fallbackScore(text);
  }

  // Apply mood-based adjustments (simulate more realistic sentiment)
  const positiveWords = ['excited', 'progress', 'good', 'well', 'happy', 'accomplished', 'successful'];
  const negativeWords = ['overwhelmed', 'tired', 'stressed', 'difficult', 'hard', 'struggling'];
  
  positiveWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 1.5;
  });
  
  negativeWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score -= 1.2;
  });

  // Add some randomness to make responses feel more dynamic
  score += (Math.random() - 0.5) * 0.8;

  return Math.max(-5, Math.min(5, score));
}

function mapScoreToLabel(score) {
  if (score > 1) return 'positive';
  if (score < -1) return 'negative';
  return 'neutral';
}

function countKeywords(text = '') {
  const lower = text.toLowerCase();
  return KEYWORDS.reduce((sum, keyword) => {
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function detectHighFrequency(text = '', metadata = {}) {
  const meta = metadata || {};
  const freqValue = (meta.frequency || meta.cadence || '').toString().toLowerCase();
  const metadataMatch = ['daily', 'everyday', 'nightly', 'constant', '24/7'].includes(freqValue);
  const textMatch = FREQUENCY_PATTERNS.some((pattern) => pattern.test(text));
  return metadataMatch || textMatch;
}

function determineBurnoutRisk({ negative, score, keywordsCount, highFrequency }) {
  const effectiveKeywords = keywordsCount + (highFrequency ? 1 : 0);

  if (negative && (effectiveKeywords >= 3 || score < -4)) {
    return 'high';
  }

  if (negative && (effectiveKeywords >= 1 || score <= -2)) {
    return 'medium';
  }

  return 'low';
}

function pickSuggestionType(risk, profile = {}) {
  const preferences = profile?.preferences || {};
  const prefersBreathing = preferences.preferredSupport === 'breathing'
    || preferences.prefersBreathing;
  const prefersDetox = preferences.preferredSupport === 'detox'
    || preferences.prefersDigitalDetox;

  if (prefersBreathing && !prefersDetox) return 'breathing';
  if (prefersDetox && !prefersBreathing) return 'detox';

  if (risk === 'high' || risk === 'medium') {
    return 'breathing';
  }

  return 'detox';
}

function buildSuggestions(risk, profile, text = '') {
  const suggestions = [];
  const textLower = text.toLowerCase();
  
  // Context-aware suggestions based on text content
  if (textLower.includes('sleep') || textLower.includes('tired') || textLower.includes('exhausted')) {
    suggestions.push(...SUGGESTIONS.sleep.slice(0, 2));
  } else if (textLower.includes('energy') || textLower.includes('motivated')) {
    suggestions.push(...SUGGESTIONS.energy.slice(0, 2));
  } else if (risk === 'high') {
    suggestions.push(SUGGESTIONS.breathing[0]);
    suggestions.push(SUGGESTIONS.detox[0]);
  } else if (risk === 'medium') {
    const type = pickSuggestionType(risk, profile);
    const chosenList = SUGGESTIONS[type];
    suggestions.push(chosenList[Math.floor(Math.random() * chosenList.length)]);
    // Add a second suggestion from a different category
    const otherTypes = Object.keys(SUGGESTIONS).filter(t => t !== type);
    const otherType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
    suggestions.push(SUGGESTIONS[otherType][0]);
  } else {
    // Low risk - positive suggestions
    const randomType = Math.random() > 0.5 ? 'energy' : 'detox';
    suggestions.push(SUGGESTIONS[randomType][Math.floor(Math.random() * SUGGESTIONS[randomType].length)]);
  }

  return suggestions.length ? suggestions : ['Take a moment to appreciate your progress today.'];
}

async function analyzeText(input) {
  const payload = typeof input === 'string' ? { text: input } : input || {};
  const text = (payload.text || '').trim();
  if (!text) {
    throw new Error('analyzeText requires a non-empty text value');
  }

  const score = computeSentimentScore(text);
  const sentimentLabel = mapScoreToLabel(score);
  const keywordsCount = countKeywords(text);
  const highFrequency = detectHighFrequency(text, payload.metadata);
  const negative = sentimentLabel === 'negative';
  const burnoutRisk = determineBurnoutRisk({ negative, score, keywordsCount, highFrequency });
  const suggestions = buildSuggestions(burnoutRisk, payload.profile, text);

  // Enhanced AI-powered insights
  let aiInsights = null;
  try {
    const aiPrompt = `Analyze this mental health reflection and provide 2-3 actionable insights:

Text: "${text}"
Sentiment Score: ${score}
Burnout Risk: ${burnoutRisk}
Keywords Found: ${keywordsCount}

Provide specific, empathetic recommendations for this user's mental wellness.`;

    const aiResponse = await multiAI.makeAPICall(aiPrompt, {
      mood: sentimentLabel,
      stressLevel: burnoutRisk,
      keywordCount: keywordsCount
    });

    if (aiResponse.success) {
      aiInsights = {
        content: aiResponse.content,
        provider: aiResponse.provider,
        confidence: aiResponse.success ? 'high' : 'low'
      };
    }
  } catch (error) {
    console.error('AI insights failed:', error.message);
  }

  return {
    sentimentScore: Number(score.toFixed(2)),
    sentimentLabel,
    burnoutRisk,
    keywordsCount,
    suggestions,
    aiInsights,
    timestamp: new Date().toISOString(),
    enhanced: !!aiInsights
  };
}

module.exports = {
  analyzeText
};
