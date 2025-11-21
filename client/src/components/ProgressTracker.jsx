import { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function ProgressTracker() {
  const { isDark } = useThemeMode();
  const [stats, setStats] = useState({
    streaks: {
      journal: 0,
      breathing: 0,
      analysis: 0
    },
    totals: {
      journalEntries: 0,
      breathingSessions: 0,
      analysisRuns: 0,
      totalMinutesPracticed: 0
    },
    achievements: [],
    weeklyGoals: {
      journal: { target: 7, current: 0 },
      breathing: { target: 5, current: 0 },
      analysis: { target: 3, current: 0 }
    },
    monthlyReport: {
      averageMood: 0,
      topEmotions: [],
      improvementAreas: []
    }
  });

  const [achievements] = useState([
    { id: 'first_journal', name: 'First Steps', description: 'Created your first journal entry', icon: '📝', unlocked: false },
    { id: 'journal_streak_3', name: 'Building Habits', description: '3-day journaling streak', icon: '🔥', unlocked: false },
    { id: 'journal_streak_7', name: 'Week Warrior', description: '7-day journaling streak', icon: '⭐', unlocked: false },
    { id: 'journal_streak_30', name: 'Monthly Master', description: '30-day journaling streak', icon: '🏆', unlocked: false },
    { id: 'breathing_novice', name: 'Breath Beginner', description: 'Completed 5 breathing sessions', icon: '🫁', unlocked: false },
    { id: 'breathing_expert', name: 'Zen Master', description: 'Completed 50 breathing sessions', icon: '🧘', unlocked: false },
    { id: 'analysis_user', name: 'Self Aware', description: 'Ran 10 text analyses', icon: '🧠', unlocked: false },
    { id: 'mood_improver', name: 'Positive Vibes', description: 'Improved average mood by 2 points', icon: '😊', unlocked: false },
    { id: 'consistent_user', name: 'Steady Progress', description: 'Used app for 30 consecutive days', icon: '📅', unlocked: false },
    { id: 'word_count_1k', name: 'Expressive Writer', description: 'Written 1,000 words total', icon: '✍️', unlocked: false },
    { id: 'word_count_10k', name: 'Author', description: 'Written 10,000 words total', icon: '📚', unlocked: false },
    { id: 'meditation_time_60', name: 'Hour of Peace', description: 'Practiced breathing for 60+ minutes total', icon: '⏰', unlocked: false }
  ]);

  // Load progress data from localStorage
  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    try {
      // Load journal entries
      const journalEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
      
      // Load breathing sessions (from breathing exercises page stats)
      const breathingStats = JSON.parse(localStorage.getItem('breathing-session-stats') || '{"totalSessions": 0, "totalMinutes": 0}');
      
      // Load analysis runs (from existing profile data)
      const analysisCount = JSON.parse(localStorage.getItem('analysis-count') || '0');

      // Calculate streaks
      const journalStreak = calculateJournalStreak(journalEntries);
      const breathingStreak = calculateBreathingStreak();
      
      // Calculate weekly progress
      const weeklyProgress = calculateWeeklyProgress(journalEntries, breathingStats.totalSessions);

      // Calculate monthly report
      const monthlyReport = calculateMonthlyReport(journalEntries);

      // Calculate total words
      const totalWords = journalEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);

      setStats({
        streaks: {
          journal: journalStreak,
          breathing: breathingStreak,
          analysis: 0 // Placeholder for now
        },
        totals: {
          journalEntries: journalEntries.length,
          breathingSessions: breathingStats.totalSessions,
          analysisRuns: analysisCount,
          totalMinutesPracticed: breathingStats.totalMinutes,
          totalWords
        },
        achievements: updateAchievements(journalEntries, breathingStats, analysisCount, totalWords),
        weeklyGoals: weeklyProgress,
        monthlyReport
      });
    } catch (err) {
      console.error('Error loading progress data:', err);
    }
  };

  const calculateJournalStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    const today = new Date();
    const entryDates = [...new Set(entries.map(e => new Date(e.date).toDateString()))];
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toDateString();
      if (entryDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0 && dateStr !== today.toDateString()) {
        // If no entry today, check if there was one yesterday to continue streak
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateBreathingStreak = () => {
    // Placeholder - would need to track breathing session dates
    return 0;
  };

  const calculateWeeklyProgress = (journalEntries, breathingSessions) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentJournalEntries = journalEntries.filter(entry => 
      new Date(entry.date) >= oneWeekAgo
    ).length;

    return {
      journal: { target: 7, current: Math.min(recentJournalEntries, 7) },
      breathing: { target: 5, current: Math.min(breathingSessions, 5) },
      analysis: { target: 3, current: 0 }
    };
  };

  const calculateMonthlyReport = (journalEntries) => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEntries = journalEntries.filter(entry => 
      new Date(entry.date) >= oneMonthAgo
    );

    const averageMood = recentEntries.length > 0 
      ? (recentEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / recentEntries.length).toFixed(1)
      : 0;

    // Count emotion frequency
    const emotionCounts = {};
    recentEntries.forEach(entry => {
      entry.emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    return {
      averageMood: parseFloat(averageMood),
      topEmotions,
      improvementAreas: averageMood < 5 ? ['mood', 'stress'] : ['consistency']
    };
  };

  const updateAchievements = (journalEntries, breathingStats, analysisCount, totalWords) => {
    const unlockedAchievements = [];
    
    // Journal achievements
    if (journalEntries.length >= 1) unlockedAchievements.push('first_journal');
    if (calculateJournalStreak(journalEntries) >= 3) unlockedAchievements.push('journal_streak_3');
    if (calculateJournalStreak(journalEntries) >= 7) unlockedAchievements.push('journal_streak_7');
    if (calculateJournalStreak(journalEntries) >= 30) unlockedAchievements.push('journal_streak_30');
    
    // Breathing achievements
    if (breathingStats.totalSessions >= 5) unlockedAchievements.push('breathing_novice');
    if (breathingStats.totalSessions >= 50) unlockedAchievements.push('breathing_expert');
    if (breathingStats.totalMinutes >= 60) unlockedAchievements.push('meditation_time_60');
    
    // Analysis achievements
    if (analysisCount >= 10) unlockedAchievements.push('analysis_user');
    
    // Writing achievements
    if (totalWords >= 1000) unlockedAchievements.push('word_count_1k');
    if (totalWords >= 10000) unlockedAchievements.push('word_count_10k');

    return achievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id)
    }));
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return isDark ? '#10b981' : '#059669';
    if (streak >= 7) return isDark ? '#3b82f6' : '#2563eb';
    if (streak >= 3) return isDark ? '#f59e0b' : '#d97706';
    return isDark ? '#6b7280' : '#9ca3af';
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className={`progress-tracker p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Your Progress Dashboard
      </h2>

      {/* Streaks */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          Current Streaks 🔥
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`streak-card p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                📝 Journal
              </span>
              <span 
                className="font-bold text-2xl"
                style={{ color: getStreakColor(stats.streaks.journal) }}
              >
                {stats.streaks.journal}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              days in a row
            </p>
          </div>
          
          <div className={`streak-card p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                🫁 Breathing
              </span>
              <span 
                className="font-bold text-2xl"
                style={{ color: getStreakColor(stats.streaks.breathing) }}
              >
                {stats.streaks.breathing}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              days in a row
            </p>
          </div>
          
          <div className={`streak-card p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                🧠 Analysis
              </span>
              <span 
                className="font-bold text-2xl"
                style={{ color: getStreakColor(stats.streaks.analysis) }}
              >
                {stats.streaks.analysis}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              days in a row
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          Weekly Goals 🎯
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.weeklyGoals).map(([key, goal]) => {
            const percentage = getProgressPercentage(goal.current, goal.target);
            const icons = { journal: '📝', breathing: '🫁', analysis: '🧠' };
            
            return (
              <div key={key} className={`goal-item p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-gray-700'}`}>
                    {icons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-purple-800/50' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          Achievements 🏆
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.achievements.slice(0, 8).map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card p-3 rounded-lg text-center transition-all ${
                achievement.unlocked
                  ? isDark
                    ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/50'
                    : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                  : isDark
                    ? 'bg-purple-900/20 border-purple-800/30 opacity-50'
                    : 'bg-gray-50 border-gray-200 opacity-50'
              } border`}
            >
              <div className="text-2xl mb-1">
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              <div className={`text-xs font-medium ${
                achievement.unlocked
                  ? isDark ? 'text-purple-200' : 'text-purple-700'
                  : isDark ? 'text-purple-500' : 'text-gray-500'
              }`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Report */}
      {stats.totals.journalEntries > 0 && (
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            This Month 📊
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`report-card p-4 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {stats.monthlyReport.averageMood}/10
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-gray-600'}`}>
                Average Mood
              </div>
            </div>
            
            <div className={`report-card p-4 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {stats.totals.totalWords}
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-gray-600'}`}>
                Words Written
              </div>
            </div>
            
            <div className={`report-card p-4 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                {stats.totals.totalMinutesPracticed}m
              </div>
              <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-gray-600'}`}>
                Minutes Practiced
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}