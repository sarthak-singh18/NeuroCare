import { sanitizeText } from '../utils/sanitize.js';

export const PERSONALIZATION_PROMPT = (
  'Hello {name}, based on your recent reflections I see {sentimentLabel} energy with a {burnoutRisk} burnout risk. ' +
  'Let\'s prioritize {breathingPlan} followed by {detoxPlan}. After about {sessionLength} minutes, jot down how your body feels.'
);

const DETOX_COPY = {
  'phone-free': 'a phone-free wind-down block',
  'social-media-lite': 'a social-media-lite evening with muted feeds',
  'screen-schedule': 'a structured screen schedule with 15-minute pauses'
};

export function formatPrompt(template, variables = {}) {
  return template.replace(/\{(.*?)\}/g, (_, key) => variables[key] ?? '');
}

export function buildPersonalizedPlan(profile, analysis) {
  if (!profile?.preferences?.usePersonalization) {
    return null;
  }

  const sessionLength = Number(profile.preferences?.preferredSessionLength) || 3;
  const detoxFormat = profile.preferences?.detoxFormat || 'phone-free';
  const breathingPlan = `${sessionLength}-minute 4-4-4 breathing session`;
  const detoxPlan = DETOX_COPY[detoxFormat] || 'a short digital detox block';

  const message = formatPrompt(PERSONALIZATION_PROMPT, {
    name: profile.name || 'friend',
    sentimentLabel: analysis?.sentimentLabel || 'neutral',
    burnoutRisk: analysis?.burnoutRisk || 'low',
    breathingPlan,
    detoxPlan,
    sessionLength
  });

  return {
    sessionLength,
    breathingPlan,
    detoxPlan,
    message: sanitizeText(message)
  };
}
