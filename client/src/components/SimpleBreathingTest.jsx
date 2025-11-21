import React, { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function SimpleBreathingTest() {
  const { isDark } = useThemeMode();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(current => {
            if (current === 'inhale') return 'hold';
            if (current === 'hold') return 'exhale';
            if (current === 'exhale') {
              setCycle(c => c + 1);
              return 'inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const startSession = () => {
    setIsActive(true);
    setCycle(0);
    setPhase('inhale');
    setCount(4);
  };

  const stopSession = () => {
    setIsActive(false);
    
    // Save session to localStorage
    const session = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      pattern: 'Box Breathing Test',
      duration: cycle * 16, // Each cycle is ~16 seconds
      cycles: cycle,
      completed: true,
      timestamp: Date.now()
    };

    const existingSessions = JSON.parse(localStorage.getItem('breathing-sessions') || '[]');
    existingSessions.unshift(session);
    localStorage.setItem('breathing-sessions', JSON.stringify(existingSessions));
    
    alert(`Session complete! ${cycle} cycles completed.`);
  };

  const phaseInstructions = {
    inhale: 'Breathe in slowly',
    hold: 'Hold your breath',
    exhale: 'Breathe out slowly'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-purple-950' : 'bg-purple-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl ${
        isDark ? 'bg-purple-900/50 border-purple-500/20' : 'bg-white border-purple-200'
      } border text-center`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Simple Breathing Test
        </h2>

        {!isActive ? (
          <button
            onClick={startSession}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Breathing Exercise
          </button>
        ) : (
          <div className="space-y-6">
            <div className={`text-6xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {count}
            </div>
            
            <div className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {phaseInstructions[phase]}
            </div>
            
            <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
              Cycle: {cycle} | Phase: {phase}
            </div>

            <button
              onClick={stopSession}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Stop Session
            </button>
          </div>
        )}

        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-purple-800/50' : 'bg-purple-100'}`}>
          <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            Box breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4.
          </p>
        </div>
      </div>
    </div>
  );
}