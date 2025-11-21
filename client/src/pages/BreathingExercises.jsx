import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext.jsx';
import BreathingPatternSelector from '../components/BreathingPatternSelector.jsx';
import BreathingSession from '../components/BreathingSession.jsx';
import { BREATHING_PATTERNS } from '../lib/breathingPatterns.js';

export default function BreathingExercisesPage() {
  const { isDark } = useThemeMode();
  const navigate = useNavigate();
  const [selectedPattern, setSelectedPattern] = useState('basic');
  const [sessionDuration, setSessionDuration] = useState(5);
  const [showSession, setShowSession] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    favoritePattern: 'basic'
  });

  const handlePatternSelect = (patternKey, pattern) => {
    setSelectedPattern(patternKey);
  };

  const startSession = () => {
    setShowSession(true);
  };

  const handleSessionComplete = () => {
    setSessionStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      totalMinutes: prev.totalMinutes + sessionDuration,
      favoritePattern: selectedPattern
    }));
    setShowSession(false);
  };

  const currentPattern = BREATHING_PATTERNS[selectedPattern];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
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
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Advanced Breathing Exercises
          </h1>
          <p className={`text-lg ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
            Discover powerful breathing techniques for stress relief, focus, and well-being
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {sessionStats.totalSessions}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Total Sessions
            </div>
          </div>
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {sessionStats.totalMinutes}m
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Total Practice Time
            </div>
          </div>
          <div className={`stats-card p-4 rounded-xl text-center ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {BREATHING_PATTERNS[sessionStats.favoritePattern]?.name || 'Basic'}
            </div>
            <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              Favorite Pattern
            </div>
          </div>
        </div>

        {/* Pattern Selector */}
        <BreathingPatternSelector 
          onPatternSelect={handlePatternSelect}
          selectedPattern={selectedPattern}
        />

        {/* Session Configuration */}
        <div className={`mt-8 p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Session Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Pattern Info */}
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Selected Pattern: {currentPattern.name}
              </h4>
              <p className={`text-sm mb-3 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                {currentPattern.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentPattern.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      isDark 
                        ? 'bg-purple-600/30 text-purple-300' 
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Session Duration
              </h4>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {sessionDuration} minutes
                </span>
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-purple-200' : 'text-gray-500'}`}>
                Recommended: 3-10 minutes for beginners
              </div>
            </div>
          </div>

          {/* Start Session Button */}
          <div className="mt-6 text-center">
            <button
              onClick={startSession}
              className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 ${
                isDark 
                  ? 'bg-purple-600 text-white hover:bg-purple-500' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Start {sessionDuration}-Minute Session
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`mt-8 p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💡 Quick Tips for Better Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className={`space-y-2 text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              <li>• Find a quiet, comfortable space</li>
              <li>• Sit or lie down with spine straight</li>
              <li>• Focus on the rhythm, not perfection</li>
            </ul>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
              <li>• Practice regularly for best results</li>
              <li>• Start with shorter sessions</li>
              <li>• Stop if you feel dizzy or uncomfortable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Breathing Session Modal */}
      {showSession && (
        <BreathingSession
          isOpen={showSession}
          onDismiss={() => setShowSession(false)}
          durationMinutes={sessionDuration}
          pattern={currentPattern.pattern}
          onFinish={handleSessionComplete}
        />
      )}
    </div>
  );
}