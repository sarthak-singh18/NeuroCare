import { useId } from 'react';
import { useAnimatedPresence } from '../hooks/useAnimatedPresence.js';

const toneStyles = {
  info: {
    accent: 'text-sky-200',
    chip: 'bg-sky-500/15 text-sky-100 border border-sky-400/30',
    confirm: 'modal-action--info'
  },
  success: {
    accent: 'text-emerald-200',
    chip: 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/30',
    confirm: 'modal-action--positive'
  },
  warning: {
    accent: 'text-amber-200',
    chip: 'bg-amber-500/15 text-amber-100 border border-amber-400/30',
    confirm: 'modal-action--warning'
  },
  danger: {
    accent: 'text-rose-200',
    chip: 'bg-rose-500/15 text-rose-100 border border-rose-400/30',
    confirm: 'modal-action--danger'
  }
};

export default function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  description = 'Confirm this action.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'info',
  busy = false
}) {
  const { shouldRender, animationState } = useAnimatedPresence(isOpen, 300);
  const titleId = useId();
  const descId = useId();
  if (!shouldRender) return null;

  const style = toneStyles[tone] || toneStyles.info;

  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-overlay"
        aria-label="Close confirmation dialog"
        data-state={animationState}
        onClick={() => !busy && onCancel?.()}
      />
      <div
        className={`modal-panel confirm-panel confirm-panel--${tone}`}
        data-state={animationState}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}>
          Confirm action
        </div>
        <h3 id={titleId} className={`mt-4 text-2xl font-semibold ${style.accent}`}>
          {title}
        </h3>
        <p id={descId} className="mt-2 text-sm text-slate-200">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="modal-action flex-1"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-action flex-1 ${style.confirm}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
