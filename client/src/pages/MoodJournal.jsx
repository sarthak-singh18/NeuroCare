import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext.jsx';
import MoodJournalEntry from '../components/MoodJournalEntry.jsx';
import JournalEntryCard from '../components/JournalEntryCard.jsx';
import ProgressTracker from '../components/ProgressTracker.jsx';
import { MOOD_EMOTIONS, getMoodByValue } from '../lib/moodUtils.js';

export default function MoodJournalPage() {
  const { isDark } = useThemeMode();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterMood, setFilterMood] = useState('all');
  const [filterEmotion, setFilterEmotion] = useState('all');

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('mood-journal-entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        setEntries(parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (err) {
        console.error('Error loading journal entries:', err);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('mood-journal-entries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (entry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      setEditingEntry(null);
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    setShowNewEntry(false);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowNewEntry(true);
  };

  const handleDeleteEntry = (entryId) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  // Filter entries based on mood and emotion filters
  const filteredEntries = entries.filter(entry => {
    const moodMatch = filterMood === 'all' || 
      (filterMood === 'high' && entry.moodScore >= 7) ||
      (filterMood === 'medium' && entry.moodScore >= 4 && entry.moodScore < 7) ||
      (filterMood === 'low' && entry.moodScore < 4);
    
    const emotionMatch = filterEmotion === 'all' || 
      entry.emotions.includes(filterEmotion);
    
    return moodMatch && emotionMatch;
  });

  // Calculate stats
  const stats = {
    totalEntries: entries.length,
    averageMood: entries.length ? (entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length).toFixed(1) : 0,
    streakDays: calculateStreak(entries),
    totalWords: entries.reduce((sum, e) => sum + (e.wordCount || 0), 0)
  };

  function calculateStreak(entries) {
    if (entries.length === 0) return 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const entryDates = [...new Set(entries.map(e => new Date(e.date).toDateString()))];
    
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toDateString();
      if (entryDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr === today && entryDates.includes(yesterday)) {
        // If no entry today but there's one yesterday, continue from yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
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
              Mood Journal
            </h1>
            <p className={`text-lg mt-2 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Track your emotions and reflect on your mental wellness journey
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowNewEntry(true);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
              isDark 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            + New Entry
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <ProgressTracker />
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {stats.totalEntries}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Total Entries
            </div>
          </div>
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {stats.averageMood}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Avg Mood
            </div>
          </div>
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {stats.streakDays}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Day Streak
            </div>
          </div>
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {stats.totalWords}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Words Written
            </div>
          </div>
        </div>

        {/* New/Edit Entry */}
        {showNewEntry && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button
                onClick={() => {
                  setShowNewEntry(false);
                  setEditingEntry(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
            <MoodJournalEntry 
              onSave={handleSaveEntry}
              existingEntry={editingEntry}
            />
          </div>
        )}

        {/* Filters */}
        {entries.length > 0 && !showNewEntry && (
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Filter Entries
            </h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-purple-300' : 'text-gray-700'}`}>
                  Mood Level
                </label>
                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-purple-900/50 border-purple-600/50 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Moods</option>
                  <option value="high">High (7-10)</option>
                  <option value="medium">Medium (4-6)</option>
                  <option value="low">Low (1-3)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-purple-300' : 'text-gray-700'}`}>
                  Emotion
                </label>
                <select
                  value={filterEmotion}
                  onChange={(e) => setFilterEmotion(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-purple-900/50 border-purple-600/50 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Emotions</option>
                  {Object.entries(MOOD_EMOTIONS).map(([key, emotion]) => (
                    <option key={key} value={key}>
                      {emotion.emoji} {emotion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {!showNewEntry && (
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Journal Entries
              {filteredEntries.length !== entries.length && (
                <span className={`text-base font-normal ml-2 ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                  ({filteredEntries.length} of {entries.length})
                </span>
              )}
            </h2>
            
            {filteredEntries.length === 0 && entries.length === 0 && (
              <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-purple-950/20' : 'bg-gray-50'}`}>
                <div className="text-6xl mb-4">📝</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Start Your Mood Journal
                </h3>
                <p className={`${isDark ? 'text-purple-200' : 'text-gray-600'} mb-4`}>
                  Begin tracking your emotions and thoughts to better understand your mental wellness.
                </p>
                <button
                  onClick={() => setShowNewEntry(true)}
                  className={`px-6 py-3 rounded-xl font-semibold ${
                    isDark 
                      ? 'bg-purple-600 text-white hover:bg-purple-500' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Create Your First Entry
                </button>
              </div>
            )}

            {filteredEntries.length === 0 && entries.length > 0 && (
              <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-purple-950/20' : 'bg-gray-50'}`}>
                <p className={`${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                  No entries match your current filters.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}