import { useState, useEffect } from 'react';
import MagicBento from './MagicBento.jsx';

const STRESS_PATTERNS = [
  { pattern: /deadline|urgent|rush/i, indicator: 'Time Pressure' },
  { pattern: /too much|overload|overwhelm/i, indicator: 'Workload Stress' },
  { pattern: /can't sleep|insomnia|tired/i, indicator: 'Sleep Issues' },
  { pattern: /anxious|worry|nervous/i, indicator: 'Anxiety Markers' }
];

export default function StressDetector({ text, onStressDetected }) {
  const [stressIndicators, setStressIndicators] = useState([]);
  const [riskLevel, setRiskLevel] = useState('low');

  useEffect(() => {
    if (!text || text.length < 20) {
      setStressIndicators([]);
      setRiskLevel('low');
      return;
    }

    const detected = [];
    STRESS_PATTERNS.forEach(({ pattern, indicator }) => {
      if (pattern.test(text)) {
        detected.push(indicator);
      }
    });

    setStressIndicators(detected);
    
    const risk = detected.length >= 3 ? 'high' : detected.length >= 1 ? 'medium' : 'low';
    setRiskLevel(risk);

    if (onStressDetected) {
      onStressDetected({ indicators: detected, riskLevel: risk });
    }
  }, [text, onStressDetected]);

  if (stressIndicators.length === 0) return null;

  return (
    <MagicBento className="mb-4" accent="amber" intensity={0.3}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h3 className="font-semibold text-amber-300">Real-time Stress Detection</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {stressIndicators.map((indicator) => (
            <span
              key={indicator}
              className="px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs"
            >
              {indicator}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-300">
          Detected {stressIndicators.length} stress indicator{stressIndicators.length !== 1 ? 's' : ''} in your reflection.
          Consider taking a short break before continuing.
        </p>
      </div>
    </MagicBento>
  );
}