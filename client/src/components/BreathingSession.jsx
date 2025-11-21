import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedPresence } from '../hooks/useAnimatedPresence.js';

const DEFAULT_PATTERN = [
  { label: 'Inhale', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Exhale', seconds: 4 }
];

function normalizePattern(pattern) {
  const source = Array.isArray(pattern) && pattern.length ? pattern : DEFAULT_PATTERN;
  return source.map((phase, index) => ({
    label: phase?.label || `Phase ${index + 1}`,
    seconds: Math.max(1, Number(phase?.seconds ?? phase?.duration ?? 4))
  }));
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function BreathingSession({
  isOpen = false,
  onDismiss,
  durationMinutes = 3,
  pattern = DEFAULT_PATTERN,
  onFinish
}) {
  const { shouldRender, animationState } = useAnimatedPresence(isOpen, 320);
  const patternSteps = useMemo(() => normalizePattern(pattern), [pattern]);
  const totalSeconds = Math.max(1, Math.round(Number(durationMinutes || 1) * 60));

  const [elapsed, setElapsed] = useState(0);
  const [phaseState, setPhaseState] = useState({ index: 0, remaining: patternSteps[0].seconds });
  const [isRunning, setIsRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ariaMessage, setAriaMessage] = useState('');

  const finishFiredRef = useRef(false);
  const audioCtxRef = useRef(null);
  const mutedRef = useRef(muted);

  const closeSession = useCallback(() => {
    setIsRunning(false);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      setPhaseState({ index: 0, remaining: patternSteps[0].seconds });
      setIsRunning(false);
      setAriaMessage('Breathing session closed.');
      finishFiredRef.current = false;
      return;
    }

    setElapsed(0);
    setPhaseState({ index: 0, remaining: patternSteps[0].seconds });
    setIsRunning(true);
    finishFiredRef.current = false;
    setAriaMessage(`Session started. ${patternSteps[0].label} for ${patternSteps[0].seconds} seconds.`);
    playBell(432);
  }, [isOpen, patternSteps]);

  useEffect(() => {
    if (!isOpen || !isRunning) {
      return undefined;
    }

    const tick = () => {
      setElapsed((prev) => {
        if (prev >= totalSeconds) {
          return prev;
        }
        return prev + 1;
      });

      setPhaseState((current) => {
        if (current.remaining > 1) {
          return { ...current, remaining: current.remaining - 1 };
        }

        const nextIndex = (current.index + 1) % patternSteps.length;
        setAriaMessage(`${patternSteps[nextIndex].label} for ${patternSteps[nextIndex].seconds} seconds.`);
        return { index: nextIndex, remaining: patternSteps[nextIndex].seconds };
      });
    };

    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, isRunning, totalSeconds, patternSteps]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSession();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeSession]);

  const timeRemaining = Math.max(0, totalSeconds - elapsed);
  const sessionComplete = elapsed >= totalSeconds;
  const activePhase = patternSteps[phaseState.index];
  const phaseRemaining = phaseState.remaining;
  const phaseProgress = 1 - phaseRemaining / activePhase.seconds;
  const circleScale = activePhase.label.toLowerCase().includes('inhale')
    ? 0.85 + phaseProgress * 0.35
    : activePhase.label.toLowerCase().includes('exhale')
      ? 1.2 - phaseProgress * 0.25
      : 1;

  useEffect(() => {
    if (sessionComplete && isOpen && !finishFiredRef.current) {
      finishFiredRef.current = true;
      setIsRunning(false);
      playBell(528);
      onFinish?.();
      setAriaMessage('Session complete. Take a moment to notice how you feel.');
    }
  }, [sessionComplete, isOpen, onFinish]);

  function ensureAudioContext() {
    if (audioCtxRef.current) {
      return audioCtxRef.current;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    audioCtxRef.current = new AudioContextClass();
    return audioCtxRef.current;
  }

  function playBell(frequency) {
    if (mutedRef.current) return;
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 1.5);
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-overlay breathing-modal-overlay"
        data-state={animationState}
        aria-label="Close breathing session"
        onClick={closeSession}
      />
      <div
        className="modal-panel breathing-panel enhanced-breathing-modal"
        data-state={animationState}
        role="dialog"
        aria-modal="true"
        aria-label="Guided breathing session"
        tabIndex={-1}
      >
        {/* Progress Bar */}
        <div className="breathing-progress-container">
          <div className="breathing-progress-bar">
            <div 
              className="breathing-progress-fill"
              style={{ width: `${(elapsed / totalSeconds) * 100}%` }}
            />
          </div>
          <span className="breathing-progress-text">
            {Math.round((elapsed / totalSeconds) * 100)}% Complete
          </span>
        </div>

        <div className="breathing-header">
          <div className="breathing-title-section">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Mindful Breathing</p>
            <h2 className="text-2xl font-semibold text-white">Focus Session</h2>
          </div>
          <button
            type="button"
            onClick={closeSession}
            className="breathing-close-btn"
            aria-label="Close breathing session"
          >
            <span className="close-icon">✕</span>
          </button>
        </div>

        <div className="breathing-main-content">
          {/* Enhanced Breathing Orb */}
          <div className="breathing-orb-container">
            <div className="breathing-background-rings">
              <div className="breathing-ring ring-1" />
              <div className="breathing-ring ring-2" />
              <div className="breathing-ring ring-3" />
            </div>
            <div
              className={`enhanced-breathing-orb ${activePhase.label.toLowerCase()}`}
              style={{ 
                transform: `scale(${circleScale})`
              }}
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="orb-inner">
                <span className="orb-phase-text">{activePhase.label}</span>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="breathing-session-info">
            <p className="breathing-timer" aria-label="Seconds remaining in current phase">
              {phaseRemaining}s
            </p>
            <p className="breathing-subtitle">
              {formatTime(timeRemaining)} remaining
            </p>
            <p className="sr-only" aria-live="polite">
              {ariaMessage}
            </p>
          </div>
        </div>

        <div className="breathing-controls">
          <button
            type="button"
            onClick={() => {
              setIsRunning((prev) => {
                const next = !prev;
                setAriaMessage(next ? 'Session resumed.' : 'Session paused.');
                if (next && audioCtxRef.current?.state === 'suspended') {
                  audioCtxRef.current.resume();
                }
                return next;
              });
            }}
            className="breathing-control-btn primary-control"
            aria-pressed={isRunning}
          >
            <span className="control-icon">{isRunning ? '⏸️' : '▶️'}</span>
            <span className="control-text">{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            className="breathing-control-btn secondary-control"
            aria-pressed={muted}
          >
            <span className="control-icon">{muted ? '🔇' : '🔔'}</span>
            <span className="control-text">{muted ? 'Unmute' : 'Mute'}</span>
          </button>
          
          <button
            type="button"
            onClick={closeSession}
            className="breathing-control-btn danger-control"
          >
            <span className="control-icon">🛑</span>
            <span className="control-text">End Session</span>
          </button>
        </div>

        {sessionComplete && (
          <p className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Session complete. Log how your body feels before moving on.
          </p>
        )}
      </div>
    </div>
  );
}
