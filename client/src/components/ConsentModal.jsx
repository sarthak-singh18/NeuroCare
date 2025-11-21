import { useEffect, useState } from 'react';
import { useAnimatedPresence } from '../hooks/useAnimatedPresence.js';

const MODAL_BODY = [
  'NeuraCare keeps everything on this device. Before we analyze any reflections, review what stays local:',
  '• Journal text you type into the Input Panel and the mood slider value you choose.',
  '• Timestamps plus burnout scores we calculate for each reflection.',
  '• Your profile choices such as name, timezone, breathing length, and detox format.'
];

const RETENTION_TEXT = 'If you decline, analysis stops immediately and your data is scheduled for deletion in 7 days unless you delete it sooner.';

export default function ConsentModal({ isOpen, onDecision, loading }) {
  const [busy, setBusy] = useState(false);
  const { shouldRender, animationState } = useAnimatedPresence(isOpen, 280);

  useEffect(() => {
    if (!isOpen) {
      setBusy(false);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  async function handleClick(consentGiven) {
    if (busy || loading) return;
    try {
      setBusy(true);
      await onDecision(consentGiven);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-layer">
      <div
        className="modal-overlay"
        data-state={animationState}
        aria-hidden="true"
      />
      <div
        className="modal-panel consent-panel"
        data-state={animationState}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-modal-title"
      >
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">NeuraCare Privacy Check-in</p>
          <h2 id="consent-modal-title" className="mt-2 text-2xl font-semibold text-white">We keep everything on this device</h2>
        </header>

        <section className="mt-5 space-y-3 text-sm leading-relaxed text-slate-200">
          {MODAL_BODY.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-100">
            Nothing is uploaded to external AI services. We just need your consent to analyze your reflections locally.
          </p>
          <p className="text-xs text-slate-400">{RETENTION_TEXT}</p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleClick(true)}
            disabled={busy}
            className="modal-action flex-1 modal-action--positive"
          >
            I agree — keep it local
          </button>
          <button
            type="button"
            onClick={() => handleClick(false)}
            disabled={busy}
            className="modal-action flex-1 modal-action--neutral"
          >
            No thanks — delete my inputs
          </button>
        </div>
      </div>
    </div>
  );
}
