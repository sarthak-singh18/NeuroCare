import { useEffect, useMemo, useState } from 'react';

const PHASES = [
  { label: 'Inhale', duration: 4 },
  { label: 'Hold', duration: 4 },
  { label: 'Exhale', duration: 4 }
];

export default function BreathingCoach({ isOpen, onClose, sessionLength = 3 }) {
  const totalDuration = Math.max(1, Number(sessionLength || 3)) * 60;
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(PHASES[0].duration);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      setPhaseIndex(0);
      setPhaseRemaining(PHASES[0].duration);
      return undefined;
    }

    setElapsed(0);
    setPhaseIndex(0);
    setPhaseRemaining(PHASES[0].duration);

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= totalDuration) return prev;
        return prev + 1;
      });

      setPhaseRemaining((prev) => {
        if (prev > 1) return prev - 1;
        let nextDuration = PHASES[0].duration;
        setPhaseIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % PHASES.length;
          nextDuration = PHASES[nextIndex].duration;
          return nextIndex;
        });
        return nextDuration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, totalDuration]);

  const percentage = useMemo(() => Math.round((elapsed / totalDuration) * 100), [elapsed, totalDuration]);
  const phase = PHASES[phaseIndex];
  const sessionComplete = elapsed >= totalDuration;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 transition ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-semibold text-white">Guided Breathing</h2>
  <p className="mt-2 text-sm text-slate-400">Follow the cue for the next {sessionLength} minutes.</p>

        <div className="mx-auto mt-6 flex flex-col items-center gap-4">
          <div className={`breathing-ring ${phase.label === 'Inhale' ? 'expand' : ''}`} aria-live="polite">
            <span className="text-xl font-semibold text-indigo-200">{phase.label}</span>
          </div>
          <p className="text-4xl font-bold text-white" aria-label="seconds remaining in phase">
            {phaseRemaining}s
          </p>
          <p className="text-sm text-slate-400">Session progress: {percentage}%</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
            className="rounded-full border border-indigo-400/60 px-4 py-2 text-indigo-200"
          >
            {soundOn ? 'Sound on' : 'Sound off'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600 px-4 py-2 text-slate-200"
          >
            Close
          </button>
        </div>

        {sessionComplete && (
          <p className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200">
            Session complete! Notice any shifts in your breathing.
          </p>
        )}
      </div>
    </div>
  );
}
