import { useState, useRef, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';
import { MOOD_EMOTIONS, MOOD_SCALE, getEmotionsByCategory, getMoodByValue, getRandomPrompt } from '../lib/moodUtils.js';

export default function MoodJournalEntry({ onSave, existingEntry = null }) {
  const { isDark } = useThemeMode();
  const textareaRef = useRef(null);
  const [entry, setEntry] = useState({
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    moodScore: existingEntry?.moodScore || 5,
    emotions: existingEntry?.emotions || [],
    content: existingEntry?.content || '',
    prompt: existingEntry?.prompt || getRandomPrompt(),
    tags: existingEntry?.tags || []
  });

  const [currentPrompt, setCurrentPrompt] = useState(entry.prompt);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = entry.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [entry.content]);

  const handleMoodChange = (value) => {
    setEntry(prev => ({ ...prev, moodScore: value }));
  };

  const toggleEmotion = (emotionKey) => {
    setEntry(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotionKey)
        ? prev.emotions.filter(e => e !== emotionKey)
        : [...prev.emotions, emotionKey]
    }));
  };

  const handleContentChange = (e) => {
    setEntry(prev => ({ ...prev, content: e.target.value }));
  };

  const handleSave = () => {
    const entryToSave = {
      ...entry,
      id: existingEntry?.id || Date.now(),
      timestamp: new Date().toISOString(),
      wordCount
    };
    onSave?.(entryToSave);
  };

  const insertPrompt = () => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = entry.content.slice(0, cursorPos);
    const textAfter = entry.content.slice(cursorPos);
    const newContent = textBefore + (textBefore ? '\n\n' : '') + currentPrompt + '\n\n' + textAfter;
    
    setEntry(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      const newCursorPos = cursorPos + currentPrompt.length + 4;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const selectedMood = getMoodByValue(entry.moodScore);
  const positiveEmotions = getEmotionsByCategory('positive');
  const neutralEmotions = getEmotionsByCategory('neutral');
  const challengingEmotions = getEmotionsByCategory('challenging');

  return (
    <div className={`mood-journal-entry max-w-4xl mx-auto p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'} border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Daily Mood Journal
          </h2>
          <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
            {new Date(entry.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <input
          type="date"
          value={entry.date}
          onChange={(e) => setEntry(prev => ({ ...prev, date: e.target.value }))}
          className={`px-3 py-2 rounded-lg border ${
            isDark 
              ? 'bg-purple-900/50 border-purple-600/50 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        />
      </div>

      {/* Mood Scale */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          How are you feeling today? ({selectedMood.label})
        </h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {MOOD_SCALE.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodChange(mood.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                entry.moodScore === mood.value
                  ? 'border-purple-500 shadow-lg'
                  : isDark
                    ? 'border-purple-700/50 hover:border-purple-500/70'
                    : 'border-gray-200 hover:border-purple-300'
              }`}
              style={{
                backgroundColor: entry.moodScore === mood.value ? mood.color + '20' : 'transparent'
              }}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className={`text-xs font-medium ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                {mood.value}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What emotions are you experiencing?
        </h3>
        
        {[
          { title: 'Positive Emotions', emotions: positiveEmotions, color: 'green' },
          { title: 'Neutral Emotions', emotions: neutralEmotions, color: 'gray' },
          { title: 'Challenging Emotions', emotions: challengingEmotions, color: 'orange' }
        ].map((category) => (
          <div key={category.title} className="mb-4">
            <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-gray-700'}`}>
              {category.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.emotions.map((emotion) => (
                <button
                  key={emotion.key}
                  onClick={() => toggleEmotion(emotion.key)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                    entry.emotions.includes(emotion.key)
                      ? 'text-white shadow-lg'
                      : isDark
                        ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: entry.emotions.includes(emotion.key) ? emotion.color : undefined
                  }}
                >
                  {emotion.emoji} {emotion.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Writing Prompt */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reflection Prompt
          </h3>
          <button
            onClick={() => setCurrentPrompt(getRandomPrompt())}
            className={`px-3 py-1 rounded text-sm ${
              isDark 
                ? 'bg-purple-700/50 text-purple-300 hover:bg-purple-600/50' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            New Prompt
          </button>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30 border-purple-600/30' : 'bg-purple-50 border-purple-200'} border`}>
          <p className={`${isDark ? 'text-purple-200' : 'text-purple-700'}`}>{currentPrompt}</p>
          <button
            onClick={insertPrompt}
            className={`mt-2 px-2 py-1 rounded text-xs ${
              isDark 
                ? 'bg-purple-600/50 text-white hover:bg-purple-500/50' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Use This Prompt
          </button>
        </div>
      </div>

      {/* Journal Content */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Thoughts & Feelings
          </h3>
          <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
            {wordCount} words
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={entry.content}
          onChange={handleContentChange}
          placeholder="Start writing about your day, feelings, or thoughts... Remember, this is a safe space for you to express yourself freely."
          className={`w-full h-64 p-4 rounded-lg border resize-none ${
            isDark 
              ? 'bg-purple-900/20 border-purple-600/50 text-white placeholder-purple-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
          💡 Tip: Be honest with yourself. This journal is private and secure.
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEntry(prev => ({ ...prev, content: '', emotions: [], moodScore: 5 }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDark 
                ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!entry.content.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              entry.content.trim()
                ? isDark
                  ? 'bg-purple-600 text-white hover:bg-purple-500'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}