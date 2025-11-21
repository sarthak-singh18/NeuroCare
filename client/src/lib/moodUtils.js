// Mood and emotion utilities for journal entries

export const MOOD_EMOTIONS = {
  // Positive emotions
  joy: { label: 'Joy', color: '#fbbf24', emoji: '😊', category: 'positive' },
  gratitude: { label: 'Gratitude', color: '#34d399', emoji: '🙏', category: 'positive' },
  love: { label: 'Love', color: '#f472b6', emoji: '💕', category: 'positive' },
  excitement: { label: 'Excitement', color: '#fb923c', emoji: '🤩', category: 'positive' },
  calm: { label: 'Calm', color: '#60a5fa', emoji: '😌', category: 'positive' },
  confident: { label: 'Confident', color: '#a78bfa', emoji: '😎', category: 'positive' },
  hopeful: { label: 'Hopeful', color: '#4ade80', emoji: '🌟', category: 'positive' },
  peaceful: { label: 'Peaceful', color: '#06b6d4', emoji: '☮️', category: 'positive' },

  // Neutral emotions
  content: { label: 'Content', color: '#94a3b8', emoji: '😊', category: 'neutral' },
  focused: { label: 'Focused', color: '#6b7280', emoji: '🎯', category: 'neutral' },
  tired: { label: 'Tired', color: '#9ca3af', emoji: '😴', category: 'neutral' },
  curious: { label: 'Curious', color: '#64748b', emoji: '🤔', category: 'neutral' },

  // Challenging emotions
  sad: { label: 'Sad', color: '#60a5fa', emoji: '😢', category: 'challenging' },
  angry: { label: 'Angry', color: '#f87171', emoji: '😠', category: 'challenging' },
  anxious: { label: 'Anxious', color: '#fbbf24', emoji: '😰', category: 'challenging' },
  stressed: { label: 'Stressed', color: '#fb7185', emoji: '😫', category: 'challenging' },
  overwhelmed: { label: 'Overwhelmed', color: '#ef4444', emoji: '🤯', category: 'challenging' },
  lonely: { label: 'Lonely', color: '#8b5cf6', emoji: '😔', category: 'challenging' },
  frustrated: { label: 'Frustrated', color: '#f97316', emoji: '😤', category: 'challenging' },
  worried: { label: 'Worried', color: '#eab308', emoji: '😟', category: 'challenging' }
};

export const MOOD_SCALE = [
  { value: 1, label: 'Very Low', color: '#ef4444', emoji: '😞' },
  { value: 2, label: 'Low', color: '#f97316', emoji: '😔' },
  { value: 3, label: 'Below Average', color: '#eab308', emoji: '😐' },
  { value: 4, label: 'Average', color: '#94a3b8', emoji: '😊' },
  { value: 5, label: 'Good', color: '#22d3ee', emoji: '🙂' },
  { value: 6, label: 'Very Good', color: '#4ade80', emoji: '😄' },
  { value: 7, label: 'Excellent', color: '#34d399', emoji: '🤗' },
  { value: 8, label: 'Amazing', color: '#10b981', emoji: '😍' },
  { value: 9, label: 'Euphoric', color: '#059669', emoji: '🥳' },
  { value: 10, label: 'Blissful', color: '#047857', emoji: '✨' }
];

export const JOURNAL_PROMPTS = [
  "What am I grateful for today?",
  "How did I take care of myself today?",
  "What challenged me today and how did I handle it?",
  "What brought me joy or peace today?",
  "What would I like to let go of?",
  "What do I need more of in my life?",
  "How did I show kindness today?",
  "What did I learn about myself today?",
  "What am I looking forward to?",
  "How can I be gentler with myself?",
  "What patterns do I notice in my thoughts?",
  "What would I tell a friend in my situation?",
  "What small wins can I celebrate today?",
  "How did my body feel today?",
  "What emotions came up for me today?"
];

export const getEmotionsByCategory = (category) => {
  return Object.entries(MOOD_EMOTIONS)
    .filter(([_, emotion]) => emotion.category === category)
    .map(([key, emotion]) => ({ key, ...emotion }));
};

export const getMoodByValue = (value) => {
  return MOOD_SCALE.find(mood => mood.value === value) || MOOD_SCALE[3];
};

export const getRandomPrompt = () => {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
};