import { useState } from 'react';
import { BREATHING_PATTERNS, BREATHING_CATEGORIES, getDifficultyColor, getAllPatterns } from '../lib/breathingPatterns.js';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function BreathingPatternSelector({ onPatternSelect, selectedPattern = 'basic' }) {
  const { isDark } = useThemeMode();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const allPatterns = getAllPatterns();

  const filteredPatterns = selectedCategory === 'all' 
    ? allPatterns 
    : allPatterns.filter(pattern => pattern.category === selectedCategory);

  const handlePatternSelect = (patternKey) => {
    const pattern = BREATHING_PATTERNS[patternKey];
    onPatternSelect?.(patternKey, pattern);
  };

  return (
    <div className={`breathing-pattern-selector p-6 rounded-xl ${isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200/50'} border`}>
      <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Choose Your Breathing Pattern
      </h3>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? isDark ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'
              : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          All Patterns
        </button>
        {Object.entries(BREATHING_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === key
                ? isDark ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'
                : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatterns.map((pattern) => {
          const isSelected = selectedPattern === pattern.key;
          const category = BREATHING_CATEGORIES[pattern.category];
          
          return (
            <div
              key={pattern.key}
              onClick={() => handlePatternSelect(pattern.key)}
              className={`pattern-card p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                isSelected
                  ? isDark 
                    ? 'border-purple-400 bg-purple-800/30' 
                    : 'border-purple-500 bg-purple-100'
                  : isDark
                    ? 'border-purple-700/50 bg-purple-900/20 hover:border-purple-500/50'
                    : 'border-purple-200 bg-white hover:border-purple-400'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pattern.name}
                  </h4>
                </div>
                <span
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getDifficultyColor(pattern.difficulty) }}
                >
                  {pattern.difficulty}
                </span>
              </div>
              
              <p className={`text-sm mb-3 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                {pattern.description}
              </p>

              {/* Pattern Preview */}
              <div className="flex items-center gap-1 mb-3 text-xs">
                {pattern.pattern.map((phase, index) => (
                  <div key={index} className="flex items-center">
                    <span className={`px-2 py-1 rounded ${isDark ? 'bg-purple-700/50 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>
                      {phase.label} {phase.seconds}s
                    </span>
                    {index < pattern.pattern.length - 1 && (
                      <span className={`mx-1 ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-1">
                {pattern.benefits.slice(0, 3).map((benefit, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded text-xs ${
                      isDark 
                        ? 'bg-purple-600/30 text-purple-300' 
                        : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatterns.length === 0 && (
        <div className={`text-center py-8 ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
          No patterns found in this category.
        </div>
      )}
    </div>
  );
}