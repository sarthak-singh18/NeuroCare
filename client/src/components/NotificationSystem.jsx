import { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function NotificationSystem() {
  const { isDark } = useThemeMode();
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Load notification preferences
    const preferences = JSON.parse(localStorage.getItem('notification-preferences') || '{}');
    
    // Set up daily reminder
    setupDailyReminders(preferences);
    
    // Load existing notifications
    loadNotifications();
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        showNotification('Notifications Enabled!', 'You\'ll now receive wellness reminders 🌟');
      }
    }
  };

  const showNotification = (title, body, options = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'wellness-reminder',
        requireInteraction: false,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Add to notification history
      addToHistory(title, body);
    }
  };

  const addToHistory = (title, body) => {
    const newNotification = {
      id: Date.now(),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false
    };

    const history = JSON.parse(localStorage.getItem('notification-history') || '[]');
    const updatedHistory = [newNotification, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem('notification-history', JSON.stringify(updatedHistory));
    
    setNotifications(updatedHistory);
  };

  const loadNotifications = () => {
    const history = JSON.parse(localStorage.getItem('notification-history') || '[]');
    setNotifications(history);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notification-history', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notification-history');
  };

  const setupDailyReminders = (preferences) => {
    // Clear existing reminders
    if (window.notificationInterval) {
      clearInterval(window.notificationInterval);
    }

    const defaultPrefs = {
      dailyCheck: true,
      breathingReminder: true,
      moodReminder: true,
      encouragement: true,
      reminderTime: '09:00',
      frequency: 'daily'
    };

    const prefs = { ...defaultPrefs, ...preferences };
    
    if (!prefs.dailyCheck) return;

    // Check every hour if it's time for reminders
    window.notificationInterval = setInterval(() => {
      const now = new Date();
      const [targetHour, targetMinute] = prefs.reminderTime.split(':').map(Number);
      
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        sendDailyReminders(prefs);
      }
    }, 60000); // Check every minute
  };

  const sendDailyReminders = (preferences) => {
    const lastEntry = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]')[0];
    const lastEntryDate = lastEntry ? new Date(lastEntry.date).toDateString() : null;
    const today = new Date().toDateString();

    // Mood reminder
    if (preferences.moodReminder && lastEntryDate !== today) {
      setTimeout(() => {
        showNotification(
          '📝 Daily Check-in',
          'How are you feeling today? Take a moment to journal your mood.',
          { tag: 'mood-reminder' }
        );
      }, 1000);
    }

    // Breathing reminder
    if (preferences.breathingReminder) {
      setTimeout(() => {
        showNotification(
          '🫁 Mindful Moment',
          'Take a deep breath and center yourself with a breathing exercise.',
          { tag: 'breathing-reminder' }
        );
      }, 3000);
    }

    // Encouragement
    if (preferences.encouragement) {
      const encouragements = [
        'You\'re doing great on your wellness journey! 🌟',
        'Every small step towards better mental health matters 💪',
        'Remember to be kind to yourself today 💜',
        'You\'ve got this! Your mental health is worth prioritizing ✨',
        'Taking time for self-care is a sign of strength 🌸'
      ];
      
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      
      setTimeout(() => {
        showNotification(
          '💜 Daily Encouragement',
          randomEncouragement,
          { tag: 'encouragement' }
        );
      }, 5000);
    }
  };

  const savePreferences = (newPreferences) => {
    const currentPrefs = JSON.parse(localStorage.getItem('notification-preferences') || '{}');
    const updatedPrefs = { ...currentPrefs, ...newPreferences };
    localStorage.setItem('notification-preferences', JSON.stringify(updatedPrefs));
    setupDailyReminders(updatedPrefs);
  };

  const triggerTestNotification = () => {
    if (permission === 'granted') {
      showNotification(
        '🧪 Test Notification',
        'Your notifications are working perfectly!'
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    showNotification,
    markAsRead,
    clearAllNotifications,
    savePreferences,
    triggerTestNotification,
    addToHistory
  };
}

// Hook for easy integration
export function useNotifications() {
  return NotificationSystem();
}

// Notification preferences component
export function NotificationSettings({ onClose }) {
  const { isDark } = useThemeMode();
  const { savePreferences, triggerTestNotification, permission, requestPermission } = useNotifications();
  const [preferences, setPreferences] = useState(() => {
    return JSON.parse(localStorage.getItem('notification-preferences') || '{}');
  });

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-lg w-full rounded-xl p-6 ${
        isDark ? 'bg-purple-950 border-purple-500/20' : 'bg-white border-gray-200'
      } border max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notification Settings
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Permission Status */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-purple-900/50' : 'bg-purple-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Browser Notifications
                </h4>
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  Status: {permission === 'granted' ? '✅ Enabled' : permission === 'denied' ? '❌ Blocked' : '⚠️ Not set'}
                </p>
              </div>
              {permission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Test Notification */}
          {permission === 'granted' && (
            <button
              onClick={triggerTestNotification}
              className={`w-full p-3 rounded-lg border-2 border-dashed ${
                isDark 
                  ? 'border-purple-500/50 text-purple-300 hover:bg-purple-900/30' 
                  : 'border-purple-300 text-purple-600 hover:bg-purple-50'
              }`}
            >
              🧪 Send Test Notification
            </button>
          )}

          {/* Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Daily Check-ins
              </label>
              <input
                type="checkbox"
                checked={preferences.dailyCheck !== false}
                onChange={(e) => handlePreferenceChange('dailyCheck', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mood Reminders
              </label>
              <input
                type="checkbox"
                checked={preferences.moodReminder !== false}
                onChange={(e) => handlePreferenceChange('moodReminder', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Breathing Reminders
              </label>
              <input
                type="checkbox"
                checked={preferences.breathingReminder !== false}
                onChange={(e) => handlePreferenceChange('breathingReminder', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Daily Encouragement
              </label>
              <input
                type="checkbox"
                checked={preferences.encouragement !== false}
                onChange={(e) => handlePreferenceChange('encouragement', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime || '09:00'}
                onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                className={`px-3 py-1 rounded-lg border ${
                  isDark 
                    ? 'bg-purple-900/50 border-purple-500/30 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}