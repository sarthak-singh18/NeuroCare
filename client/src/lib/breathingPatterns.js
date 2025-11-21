// Advanced Breathing Patterns for Mental Health and Wellness

export const BREATHING_PATTERNS = {
  // Basic 4-4-4 Pattern (Default)
  basic: {
    name: "Basic Breathing",
    description: "Simple, calming breath work perfect for beginners",
    pattern: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 }
    ],
    difficulty: 'Beginner',
    benefits: ['Stress relief', 'Focus', 'Relaxation'],
    category: 'general'
  },

  // 4-7-8 Breathing (Dr. Andrew Weil's technique)
  fourSevenEight: {
    name: "4-7-8 Breathing",
    description: "Dr. Andrew Weil's relaxation technique, great for sleep and anxiety",
    pattern: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 }
    ],
    difficulty: 'Intermediate',
    benefits: ['Sleep aid', 'Anxiety relief', 'Deep relaxation'],
    category: 'sleep'
  },

  // Box Breathing (Navy SEALs technique)
  boxBreathing: {
    name: "Box Breathing",
    description: "Military-grade technique used by Navy SEALs for focus and stress management",
    pattern: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 }
    ],
    difficulty: 'Intermediate',
    benefits: ['Stress management', 'Focus', 'Mental clarity'],
    category: 'performance'
  },

  // Wim Hof Method (simplified version)
  wimHof: {
    name: "Wim Hof Breathing",
    description: "Power breathing technique for energy, immunity, and mental resilience",
    pattern: [
      { label: 'Inhale Deep', seconds: 2 },
      { label: 'Exhale Fully', seconds: 1 },
      { label: 'Inhale Deep', seconds: 2 },
      { label: 'Exhale Fully', seconds: 1 },
      { label: 'Inhale Deep', seconds: 2 },
      { label: 'Hold Full', seconds: 15 }
    ],
    difficulty: 'Advanced',
    benefits: ['Energy boost', 'Immune support', 'Mental resilience'],
    category: 'energy'
  },

  // Coherent Breathing (5-5 pattern)
  coherent: {
    name: "Coherent Breathing",
    description: "Heart rate variability optimization for emotional balance",
    pattern: [
      { label: 'Inhale', seconds: 5 },
      { label: 'Exhale', seconds: 5 }
    ],
    difficulty: 'Beginner',
    benefits: ['Emotional balance', 'Heart health', 'Coherence'],
    category: 'heart'
  },

  // Triangle Breathing
  triangle: {
    name: "Triangle Breathing",
    description: "Three-part breath for grounding and centering",
    pattern: [
      { label: 'Inhale', seconds: 6 },
      { label: 'Hold', seconds: 6 },
      { label: 'Exhale', seconds: 6 }
    ],
    difficulty: 'Beginner',
    benefits: ['Grounding', 'Centering', 'Balance'],
    category: 'mindfulness'
  },

  // Energizing Breath
  energizing: {
    name: "Energizing Breath",
    description: "Quick, stimulating breath work for morning energy",
    pattern: [
      { label: 'Quick Inhale', seconds: 1 },
      { label: 'Quick Exhale', seconds: 1 },
      { label: 'Quick Inhale', seconds: 1 },
      { label: 'Quick Exhale', seconds: 1 },
      { label: 'Deep Inhale', seconds: 4 },
      { label: 'Long Exhale', seconds: 6 }
    ],
    difficulty: 'Intermediate',
    benefits: ['Energy boost', 'Alertness', 'Morning routine'],
    category: 'energy'
  },

  // Calming Breath (Extended exhale)
  calming: {
    name: "Calming Breath",
    description: "Extended exhale for deep relaxation and stress relief",
    pattern: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Pause', seconds: 2 },
      { label: 'Exhale Slow', seconds: 8 }
    ],
    difficulty: 'Beginner',
    benefits: ['Deep relaxation', 'Stress relief', 'Calm mind'],
    category: 'relaxation'
  }
};

export const BREATHING_CATEGORIES = {
  general: { name: 'General Wellness', color: '#8b5cf6', icon: '🌸' },
  sleep: { name: 'Sleep & Rest', color: '#3b82f6', icon: '🌙' },
  performance: { name: 'Performance', color: '#ef4444', icon: '🎯' },
  energy: { name: 'Energy & Vitality', color: '#f59e0b', icon: '⚡' },
  heart: { name: 'Heart Health', color: '#ec4899', icon: '💗' },
  mindfulness: { name: 'Mindfulness', color: '#10b981', icon: '🧘' },
  relaxation: { name: 'Deep Relaxation', color: '#6366f1', icon: '🕯️' }
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Beginner': return '#10b981';
    case 'Intermediate': return '#f59e0b';
    case 'Advanced': return '#ef4444';
    default: return '#6b7280';
  }
};

export const getPatternsByCategory = (category) => {
  return Object.entries(BREATHING_PATTERNS)
    .filter(([_, pattern]) => pattern.category === category)
    .map(([key, pattern]) => ({ key, ...pattern }));
};

export const getAllPatterns = () => {
  return Object.entries(BREATHING_PATTERNS)
    .map(([key, pattern]) => ({ key, ...pattern }));
};