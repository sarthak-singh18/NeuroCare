import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext.jsx';
import ProgressTracker from '../components/ProgressTracker.jsx';
import { useNotifications, NotificationSettings } from '../components/NotificationSystem.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { MOOD_EMOTIONS, getMoodByValue } from '../lib/moodUtils.js';
import { BREATHING_PATTERNS } from '../lib/breathingPatterns.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { isDark } = useThemeMode();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, clearAllNotifications } = useNotifications();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    recentEntries: [],
    moodTrend: [],
    breathingSessions: [],
    quickStats: {},
    insights: [],
    recommendations: []
  });

  const [timeFilter, setTimeFilter] = useState('week'); // week, month, year
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);

  const loadDashboardData = () => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      try {
        // Load journal entries
        const journalEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
      
      // Load breathing sessions
      const breathingStats = JSON.parse(localStorage.getItem('breathing-session-stats') || '{"sessions": [], "totalSessions": 0, "totalMinutes": 0}');
      
      // Filter data based on time period
      const timeRange = getTimeRange(timeFilter);
      const filteredEntries = journalEntries.filter(entry => 
        new Date(entry.date) >= timeRange
      );

      // Calculate mood trend
      const moodTrend = calculateMoodTrend(filteredEntries);
      
      // Get recent entries
      const recentEntries = journalEntries.slice(0, 5);

      // Calculate quick stats
      const quickStats = calculateQuickStats(journalEntries, breathingStats);

      // Generate insights
      const insights = generateInsights(filteredEntries, breathingStats);

      // Generate recommendations
      const recommendations = generateRecommendations(filteredEntries, breathingStats);

      setDashboardData({
        recentEntries,
        moodTrend,
        breathingSessions: breathingStats.sessions || [],
        quickStats,
        insights,
        recommendations
      });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay for smooth loading
  };

  const getTimeRange = (filter) => {
    const now = new Date();
    switch (filter) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const calculateMoodTrend = (entries) => {
    return entries
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: entry.date,
        mood: entry.moodScore,
        emotions: entry.emotions
      }));
  };

  const calculateQuickStats = (journalEntries, breathingStats) => {
    const totalWords = journalEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const averageMood = journalEntries.length > 0 
      ? (journalEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / journalEntries.length).toFixed(1)
      : 0;

    // Calculate streak
    const journalStreak = calculateJournalStreak(journalEntries);

    return {
      totalEntries: journalEntries.length,
      totalWords,
      averageMood: parseFloat(averageMood),
      breathingSessions: breathingStats.totalSessions || 0,
      practiceMinutes: breathingStats.totalMinutes || 0,
      journalStreak
    };
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
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const generateInsights = (entries, breathingStats) => {
    const insights = [];

    if (entries.length === 0) {
      insights.push({
        type: 'welcome',
        title: 'Welcome to Your Mental Health Journey',
        description: 'Start by creating your first journal entry to unlock personalized insights.',
        icon: '🌟',
        action: () => navigate('/journal')
      });
      return insights;
    }

    // Mood insights
    const averageMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length;
    if (averageMood >= 7) {
      insights.push({
        type: 'positive',
        title: 'You\'re Thriving!',
        description: `Your average mood is ${averageMood.toFixed(1)}/10. Keep up the great work!`,
        icon: '🌈',
        color: '#10b981'
      });
    } else if (averageMood < 5) {
      insights.push({
        type: 'support',
        title: 'Challenging Times',
        description: 'Your mood has been lower recently. Remember, it\'s okay to have difficult periods.',
        icon: '🤗',
        color: '#f59e0b',
        action: () => navigate('/breathing')
      });
    }

    // Emotion patterns
    const emotionCounts = {};
    entries.forEach(entry => {
      entry.emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const topEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (topEmotion) {
      const emotion = MOOD_EMOTIONS[topEmotion[0]];
      if (emotion) {
        insights.push({
          type: 'pattern',
          title: 'Emotional Pattern Detected',
          description: `You've been feeling "${emotion.label}" frequently. This shows great self-awareness.`,
          icon: emotion.emoji,
          color: emotion.color
        });
      }
    }

    // Breathing insights
    if (breathingStats.totalSessions > 0) {
      insights.push({
        type: 'practice',
        title: 'Mindful Practice',
        description: `You've completed ${breathingStats.totalSessions} breathing sessions. Consistency builds resilience.`,
        icon: '🧘',
        color: '#6366f1'
      });
    }

    return insights;
  };

  const generateRecommendations = (entries, breathingStats) => {
    const recommendations = [];

    // Check for consistency
    const hasRecentEntry = entries.some(entry => {
      const entryDate = new Date(entry.date);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return entryDate >= yesterday;
    });

    if (!hasRecentEntry) {
      recommendations.push({
        title: 'Daily Check-in',
        description: 'Take a moment to reflect on today. How are you feeling?',
        action: 'Write in Journal',
        icon: '📝',
        priority: 'high',
        onClick: () => navigate('/journal')
      });
    }

    // Breathing recommendations
    if (breathingStats.totalSessions < 3) {
      recommendations.push({
        title: 'Try Breathing Exercises',
        description: 'Start with a simple 5-minute breathing session to reduce stress.',
        action: 'Start Breathing',
        icon: '🫁',
        priority: 'medium',
        onClick: () => navigate('/breathing')
      });
    }

    // Mood-based recommendations
    const recentMoods = entries.slice(0, 3).map(e => e.moodScore);
    const averageRecentMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length 
      : 5;

    if (averageRecentMood < 5) {
      recommendations.push({
        title: 'Self-Care Time',
        description: 'Consider activities that bring you joy and relaxation.',
        action: 'Explore Techniques',
        icon: '💆',
        priority: 'high',
        onClick: () => navigate('/breathing')
      });
    }

    return recommendations;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 opacity-0 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              ← Back to Home
            </button>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Wellness Dashboard
            </h1>
            <p className={`text-lg mt-2 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Track your mental health journey and celebrate your progress
            </p>
          </div>
          
          {/* Notifications and Time Filter */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'bg-purple-900/50 hover:bg-purple-800/50' : 'bg-purple-100 hover:bg-purple-200'
                }`}
              >
                <div className="relative">
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </button>
              
              {/* Notification Panel */}
              {showNotificationPanel && (
                <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-lg border z-50 ${
                  isDark ? 'bg-purple-950 border-purple-500/20' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-4 border-b border-purple-500/20">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                      <button
                        onClick={() => setShowNotificationSettings(true)}
                        className={`text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-purple-500/10 cursor-pointer hover:bg-purple-900/30 ${
                            !notification.read ? 'bg-purple-900/20' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                            {notification.body}
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-gray-500'}`}>
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`p-6 text-center ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
                        <div className="text-2xl mb-2">🔕</div>
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-purple-500/20">
                      <button
                        onClick={clearAllNotifications}
                        className={`w-full text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Time Filter */}
            <div className="flex gap-2">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === period
                      ? isDark ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                      : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.totalEntries || 0}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Journal Entries
            </div>
          </div>

          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.averageMood || 0}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Avg Mood
            </div>
          </div>

          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.journalStreak || 0}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Day Streak
            </div>
          </div>

          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.breathingSessions || 0}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Breathing Sessions
            </div>
          </div>

          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.practiceMinutes || 0}m
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Practice Time
            </div>
          </div>

          <div className={`stat-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {dashboardData.quickStats.totalWords || 0}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Words Written
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Trend Chart */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mood Trend ({timeFilter})
              </h3>
              {dashboardData.moodTrend.length > 0 ? (
                <div className="h-80">
                  <Line 
                    data={{
                      labels: dashboardData.moodTrend.slice(-14).map(entry => formatDate(entry.date)),
                      datasets: [
                        {
                          label: 'Mood Score',
                          data: dashboardData.moodTrend.slice(-14).map(entry => entry.mood),
                          borderColor: '#8b5cf6',
                          backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: '#8b5cf6',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                          backgroundColor: isDark ? '#1f1937' : '#ffffff',
                          titleColor: isDark ? '#ffffff' : '#1f2937',
                          bodyColor: isDark ? '#e5e7eb' : '#6b7280',
                          borderColor: '#8b5cf6',
                          borderWidth: 1,
                          callbacks: {
                            label: function(context) {
                              const mood = getMoodByValue(context.parsed.y);
                              return `${mood.emoji} ${context.parsed.y}/10 - ${mood.label}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: isDark ? '#a78bfa' : '#6b7280',
                            font: {
                              size: 12
                            }
                          }
                        },
                        y: {
                          min: 1,
                          max: 10,
                          grid: {
                            color: isDark ? '#374151' : '#e5e7eb',
                            borderDash: [5, 5]
                          },
                          ticks: {
                            color: isDark ? '#a78bfa' : '#6b7280',
                            font: {
                              size: 12
                            },
                            callback: function(value) {
                              return value + '/10';
                            }
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
                  <div className="text-4xl mb-2">📊</div>
                  <p>No mood data for this period. Start journaling to see your trends!</p>
                </div>
              )}
            </div>

            {/* Progress Tracker */}
            <ProgressTracker />

            {/* Breathing Sessions Analytics */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Breathing Sessions Overview
              </h3>
              {dashboardData.breathingSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sessions by Pattern */}
                  <div className="h-64">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                      Preferred Techniques
                    </h4>
                    <Doughnut
                      data={{
                        labels: Object.keys(dashboardData.breathingSessions.reduce((acc, session) => {
                          acc[session.pattern] = (acc[session.pattern] || 0) + 1;
                          return acc;
                        }, {})),
                        datasets: [{
                          data: Object.values(dashboardData.breathingSessions.reduce((acc, session) => {
                            acc[session.pattern] = (acc[session.pattern] || 0) + 1;
                            return acc;
                          }, {})),
                          backgroundColor: [
                            '#8b5cf6',
                            '#06b6d4',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#ec4899',
                            '#6366f1'
                          ],
                          borderWidth: 0,
                          hoverBorderWidth: 2,
                          hoverBorderColor: '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: isDark ? '#e5e7eb' : '#374151',
                              padding: 15,
                              usePointStyle: true,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: isDark ? '#1f1937' : '#ffffff',
                            titleColor: isDark ? '#ffffff' : '#1f2937',
                            bodyColor: isDark ? '#e5e7eb' : '#6b7280',
                            borderColor: '#8b5cf6',
                            borderWidth: 1
                          }
                        }
                      }}
                    />
                  </div>
                  
                  {/* Weekly Activity */}
                  <div className="h-64">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                      Weekly Activity
                    </h4>
                    <Bar
                      data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                          label: 'Sessions',
                          data: (() => {
                            const weeklyData = [0,0,0,0,0,0,0];
                            dashboardData.breathingSessions.forEach(session => {
                              const day = new Date(session.date).getDay();
                              weeklyData[day === 0 ? 6 : day - 1]++;
                            });
                            return weeklyData;
                          })(),
                          backgroundColor: isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)',
                          borderColor: '#8b5cf6',
                          borderWidth: 1,
                          borderRadius: 4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: isDark ? '#1f1937' : '#ffffff',
                            titleColor: isDark ? '#ffffff' : '#1f2937',
                            bodyColor: isDark ? '#e5e7eb' : '#6b7280',
                            borderColor: '#8b5cf6',
                            borderWidth: 1
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              color: isDark ? '#a78bfa' : '#6b7280'
                            }
                          },
                          y: {
                            grid: {
                              color: isDark ? '#374151' : '#e5e7eb'
                            },
                            ticks: {
                              color: isDark ? '#a78bfa' : '#6b7280',
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
                  <div className="text-4xl mb-2">🫁</div>
                  <p>No breathing sessions yet. Start your wellness journey!</p>
                  <button
                    onClick={() => navigate('/breathing')}
                    className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Try Breathing Exercise
                  </button>
                </div>
              )}
            </div>

            {/* Recent Entries */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Journal Entries
                </h3>
                <button
                  onClick={() => navigate('/journal')}
                  className={`text-sm font-medium ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  View All →
                </button>
              </div>
              
              {dashboardData.recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentEntries.slice(0, 3).map((entry) => {
                    const mood = getMoodByValue(entry.moodScore);
                    return (
                      <div key={entry.id} className={`p-3 rounded-lg border ${isDark ? 'border-purple-700/50 bg-purple-900/20' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: mood.color + '20' }}
                          >
                            {mood.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(entry.date)}
                              </span>
                              <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                                • {mood.label}
                              </span>
                            </div>
                            <p className={`text-sm line-clamp-2 ${isDark ? 'text-purple-200' : 'text-gray-700'}`}>
                              {entry.content.slice(0, 120)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state journal-empty">
                  <div className="empty-state-icon">📝</div>
                  <h4 className="empty-state-title">Start Your Journey</h4>
                  <p className="empty-state-description">
                    Create your first journal entry to unlock personalized insights and track your mental wellness.
                  </p>
                  <button
                    onClick={() => navigate('/journal')}
                    className="empty-state-action"
                  >
                    <span className="action-icon">✨</span>
                    Write First Entry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Insights */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Insights & Patterns
              </h3>
              {dashboardData.insights.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${isDark ? 'border-purple-700/50 bg-purple-900/20' : 'border-gray-200 bg-gray-50'} ${insight.action ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                      onClick={insight.action}
                      style={insight.color ? { borderColor: insight.color + '40' } : {}}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {insight.title}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state insights-empty">
                  <div className="empty-state-icon">🧠</div>
                  <h4 className="empty-state-title">AI Insights Awaiting</h4>
                  <p className="empty-state-description">
                    Your personalized insights will appear here once you start using the app regularly.
                  </p>
                  <div className="empty-state-actions">
                    <button
                      onClick={() => navigate('/')}
                      className="empty-state-action primary"
                    >
                      <span className="action-icon">🤖</span>
                      Try AI Analysis
                    </button>
                    <button
                      onClick={() => navigate('/journal')}
                      className="empty-state-action secondary"
                    >
                      <span className="action-icon">📖</span>
                      Add Journal Entry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recommendations
              </h3>
              {dashboardData.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-purple-700/50 bg-purple-900/20' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rec.icon}</span>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {rec.title}
                          </h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                        {rec.description}
                      </p>
                      <button
                        onClick={rec.onClick}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          isDark 
                            ? 'bg-purple-600 text-white hover:bg-purple-500' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {rec.action}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state recommendations-empty">
                  <div className="empty-state-icon">🎯</div>
                  <h4 className="empty-state-title">You're All Set!</h4>
                  <p className="empty-state-description">
                    Great work! No urgent recommendations right now. Keep up your excellent mental wellness practices.
                  </p>
                  <button
                    onClick={() => navigate('/breathing')}
                    className="empty-state-action"
                  >
                    <span className="action-icon">🧘‍♀️</span>
                    Try Breathing Exercise
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/journal')}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${isDark ? 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <div className="font-medium">Write in Journal</div>
                      <div className="text-sm opacity-75">Reflect on your day</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/breathing')}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${isDark ? 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🫁</span>
                    <div>
                      <div className="font-medium">Breathing Exercise</div>
                      <div className="text-sm opacity-75">5-minute session</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${isDark ? 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧠</span>
                    <div>
                      <div className="font-medium">Text Analysis</div>
                      <div className="text-sm opacity-75">Analyze your thoughts</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}

      {/* Click outside to close notification panel */}
      {showNotificationPanel && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotificationPanel(false)}
        />
      )}
    </div>
  );
}