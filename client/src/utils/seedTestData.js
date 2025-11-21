// Data seeder for testing dashboard features
// Run this in browser console to populate localStorage with sample data

function seedTestData() {
  console.log('🌱 Seeding test data...');

  // Sample journal entries
  const journalEntries = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - i);
    
    journalEntries.push({
      id: `entry-${Date.now()}-${i}`,
      date: entryDate.toISOString(),
      mood: Math.floor(Math.random() * 10) + 1,
      emotions: ['happy', 'calm', 'grateful'].slice(0, Math.floor(Math.random() * 3) + 1),
      content: `Sample journal entry for ${entryDate.toDateString()}. Feeling ${['great', 'okay', 'peaceful', 'reflective'][Math.floor(Math.random() * 4)]}.`,
      prompt: 'How are you feeling today?',
      tags: ['daily', 'mood'],
      timestamp: entryDate.getTime()
    });
  }
  
  localStorage.setItem('mood-journal-entries', JSON.stringify(journalEntries));
  console.log(`✅ Created ${journalEntries.length} journal entries`);

  // Sample breathing sessions
  const breathingSessions = [];
  const patterns = ['Box Breathing', '4-7-8 Technique', 'Equal Breathing', 'Wim Hof Method'];
  
  for (let i = 10; i >= 0; i--) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - i);
    
    breathingSessions.push({
      id: `session-${Date.now()}-${i}`,
      date: sessionDate.toISOString(),
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      duration: Math.floor(Math.random() * 10) + 5,
      cycles: Math.floor(Math.random() * 8) + 3,
      completed: true,
      timestamp: sessionDate.getTime()
    });
  }
  
  localStorage.setItem('breathing-sessions', JSON.stringify(breathingSessions));
  console.log(`✅ Created ${breathingSessions.length} breathing sessions`);

  // Sample achievements
  const achievements = [
    {
      id: 'first_entry',
      name: 'First Entry',
      description: 'Created your first journal entry',
      icon: '📝',
      unlockedAt: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'journal'
    },
    {
      id: 'breathing_novice',
      name: 'Breathing Novice',
      description: 'Completed 5 breathing sessions',
      icon: '🫁',
      unlockedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'breathing'
    },
    {
      id: 'week_streak',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day streak',
      icon: '🔥',
      unlockedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'streak'
    }
  ];
  
  localStorage.setItem('user-achievements', JSON.stringify(achievements));
  console.log(`✅ Created ${achievements.length} achievements`);

  // Sample progress data
  const progressData = {
    streaks: {
      journal: {
        current: 7,
        longest: 12,
        lastEntry: today.toISOString()
      },
      breathing: {
        current: 5,
        longest: 8,
        lastSession: today.toISOString()
      }
    },
    goals: {
      weekly: {
        journalEntries: { target: 5, current: 4 },
        breathingSessions: { target: 7, current: 5 },
        moodAverage: { target: 7, current: 6.8 }
      },
      monthly: {
        journalEntries: { target: 20, current: 15 },
        breathingSessions: { target: 25, current: 18 }
      }
    },
    statistics: {
      totalJournalEntries: journalEntries.length,
      totalBreathingSessions: breathingSessions.length,
      averageMood: 6.8,
      daysActive: 14
    }
  };
  
  localStorage.setItem('progress-data', JSON.stringify(progressData));
  console.log('✅ Created progress data');

  // Sample notification preferences
  const notificationPreferences = {
    dailyCheck: true,
    breathingReminder: true,
    moodReminder: true,
    encouragement: true,
    reminderTime: '09:00',
    frequency: 'daily'
  };
  
  localStorage.setItem('notification-preferences', JSON.stringify(notificationPreferences));
  console.log('✅ Created notification preferences');

  console.log('🎉 Test data seeding complete!');
  console.log('💡 Refresh the page to see the data in action');
  
  return {
    journalEntries: journalEntries.length,
    breathingSessions: breathingSessions.length,
    achievements: achievements.length,
    progressData: 'created',
    notificationPreferences: 'created'
  };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚀 Data seeder loaded! Run seedTestData() to populate test data.');
  
  // Check if data already exists
  const existingEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
  if (existingEntries.length === 0) {
    console.log('📊 No existing data found. Would you like to seed test data?');
    console.log('Run: seedTestData()');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { seedTestData };
}