const POSITIVE_WORDS = ['calm', 'balanced', 'recharged', 'happy', 'energized', 'focused', 'supported'];
const NEGATIVE_WORDS = ['tired', 'exhausted', 'burned', 'overwhelmed', 'stressed', 'anxious', 'drained', 'fatigued'];

const BASE_SUGGESTIONS = {
  high: [
    'Pause for a 4-7-8 breathing cycle to reset your nervous system.',
    'Schedule a short device-free block (10-15 mins) to detach from notifications.',
    'Reach out to your accountability partner or coach for a quick sync.'
  ],
  medium: [
    'Take a mindful stretch or walk to interrupt prolonged sitting.',
    'Log a gratitude note to rebalance your check-in feed.',
    'Enable focus mode on your phone for the next sprint.'
  ],
  low: [
    'Celebrate a small win to reinforce the positive momentum.',
    'Share your energy level with a teammate to keep accountability high.'
  ]
};

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreTokens(tokens) {
  if (!tokens.length) {
    return 0;
  }

  const score = tokens.reduce((acc, token) => {
    if (POSITIVE_WORDS.includes(token)) return acc + 1;
    if (NEGATIVE_WORDS.includes(token)) return acc - 1;
    return acc;
  }, 0);

  return score / tokens.length;
}

function labelFromScore(score) {
  if (score > 0.15) return 'positive';
  if (score < -0.15) return 'negative';
  return 'neutral';
}

function burnoutRiskFromScore(score, textLength) {
  if (score < -0.3 || textLength > 400) return 'high';
  if (score < -0.1) return 'medium';
  return 'low';
}

function analyzeText(text = '') {
  const tokens = tokenize(text);
  const sentimentScore = Number(scoreTokens(tokens).toFixed(2));
  const sentimentLabel = labelFromScore(sentimentScore);
  const burnoutRisk = burnoutRiskFromScore(sentimentScore, text.length);
  const suggestions = BASE_SUGGESTIONS[burnoutRisk].slice(0, 2);

  return {
    sentimentScore,
    sentimentLabel,
    burnoutRisk,
    suggestions
  };
}

module.exports = {
  analyzeText
};
