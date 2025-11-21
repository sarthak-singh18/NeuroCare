import { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';
import { MOOD_EMOTIONS, getMoodByValue } from '../lib/moodUtils.js';

export default function JournalEntryCard({ entry, onEdit, onDelete }) {
  const { isDark } = useThemeMode();
  const [expanded, setExpanded] = useState(false);
  
  const mood = getMoodByValue(entry.moodScore);
  const previewLength = 150;
  const isLong = entry.content.length > previewLength;
  const displayContent = expanded || !isLong 
    ? entry.content 
    : entry.content.slice(0, previewLength) + '...';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const isToday = date.toDateString() === new Date().toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`journal-entry-card p-4 rounded-xl border transition-all hover:shadow-lg ${
      isDark 
        ? 'bg-purple-950/30 border-purple-500/20 hover:border-purple-400/30' 
        : 'bg-white border-gray-200 hover:border-purple-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: mood.color + '20' }}
          >
            {mood.emoji}
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(entry.date)}
            </h3>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
              {mood.label} • {formatTime(entry.timestamp)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(entry)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-purple-800/50 text-purple-300' 
                : 'hover:bg-purple-100 text-purple-600'
            }`}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete?.(entry.id)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-red-900/50 text-red-400' 
                : 'hover:bg-red-100 text-red-600'
            }`}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Emotions */}
      {entry.emotions && entry.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {entry.emotions.slice(0, 5).map(emotionKey => {
            const emotion = MOOD_EMOTIONS[emotionKey];
            return emotion ? (
              <span
                key={emotionKey}
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: emotion.color }}
              >
                {emotion.emoji} {emotion.label}
              </span>
            ) : null;
          })}
          {entry.emotions.length > 5 && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              isDark ? 'bg-purple-700/50 text-purple-300' : 'bg-gray-100 text-gray-600'
            }`}>
              +{entry.emotions.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-purple-100' : 'text-gray-700'}`}>
        <p className="whitespace-pre-wrap">{displayContent}</p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`mt-2 text-xs font-medium ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className={`text-xs flex items-center justify-between pt-2 border-t ${
        isDark ? 'border-purple-700/50 text-purple-400' : 'border-gray-200 text-gray-500'
      }`}>
        <span>{entry.wordCount} words</span>
        <span>Mood: {entry.moodScore}/10</span>
      </div>
    </div>
  );
}