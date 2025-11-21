import { useEffect, useState } from 'react';
import { deleteProfile, exportProfile } from '../lib/api.js';
import { useAnimatedPresence } from '../hooks/useAnimatedPresence.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function PrivacyModal({ userId, isOpen, onClose, onConsentChange }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { shouldRender, animationState } = useAnimatedPresence(isOpen, 320);

  useEffect(() => {
    if (!isOpen) {
      setStatus(null);
      setPendingAction(null);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  async function performExport() {
    try {
      setBusy(true);
      const data = await exportProfile(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `neuracare-${userId}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'Export ready. Check your downloads.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to export data' });
    } finally {
      setBusy(false);
    }
  }

  async function performDelete() {
    try {
      setBusy(true);
      await deleteProfile(userId);
      setStatus({ type: 'success', message: 'Profile deleted. Refresh to start fresh.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to delete profile' });
    } finally {
      setBusy(false);
    }
  }

  async function performConsent(consentGiven) {
    if (!onConsentChange) return;
    try {
      setBusy(true);
      await onConsentChange(consentGiven);
      setStatus({ type: 'success', message: consentGiven ? 'Consent granted. Local analysis unlocked.' : 'Consent revoked. Analysis paused.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to record consent' });
    } finally {
      setBusy(false);
    }
  }

  function getActionConfig(type) {
    switch (type) {
      case 'allow':
        return {
          title: 'Allow local analysis?',
          description: 'Enable on-device processing so NeuraCare can run burnout insights without uploading data.',
          confirmLabel: 'Allow analysis',
          tone: 'success',
          handler: () => performConsent(true)
        };
      case 'pause':
        return {
          title: 'Pause analysis and personalization?',
          description: 'We will stop all processing immediately and keep your data queued for deletion unless you resume.',
          confirmLabel: 'Pause analysis',
          tone: 'warning',
          handler: () => performConsent(false)
        };
      case 'export':
        return {
          title: 'Export all local data?',
          description: 'Generate a JSON export of your reflections, scores, and preferences to your Downloads folder.',
          confirmLabel: 'Export now',
          tone: 'info',
          handler: () => performExport()
        };
      case 'delete':
        return {
          title: 'Delete your profile?',
          description: 'Delete every stored reflection, metric, and consent record from this device. This cannot be undone.',
          confirmLabel: 'Delete immediately',
          tone: 'danger',
          handler: () => performDelete()
        };
      default:
        return null;
    }
  }

  function requestAction(type) {
    if (busy) return;
    const config = getActionConfig(type);
    if (!config || busy) return;
    setPendingAction(config);
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    try {
      await pendingAction.handler();
      setPendingAction(null);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-overlay"
        data-state={animationState}
        aria-label="Close privacy modal"
        onClick={() => {
          if (!busy) onClose?.();
        }}
      />
      <div
        className="modal-panel privacy-panel"
        data-state={animationState}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Privacy & Consent</p>
            <h2 id="privacy-modal-title" className="text-2xl font-semibold text-white">Your journaling stays local</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            disabled={busy}
          >
            Close
          </button>
        </header>

        <section className="mt-6 space-y-4 text-sm text-slate-300">
          <p>NeuraCare stores three things locally:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Reflections you type plus the mood slider value you submit.</li>
            <li>Timestamps and burnout scores generated after each analysis.</li>
            <li>Your profile settings, personalization preferences, and consent history.</li>
          </ul>
          <p className="text-xs text-amber-200">
            Revoking consent pauses analysis immediately and schedules deletion after 7 days unless you delete data sooner.
          </p>
          <p className="text-xs text-slate-400">
            For full details see PRIVACY.md or email privacy@yourdomain.com.
          </p>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2" aria-busy={busy}>
          <button
            type="button"
            onClick={() => requestAction('allow')}
            disabled={busy}
            className="modal-action modal-action--positive"
          >
            Allow local analysis
          </button>
          <button
            type="button"
            onClick={() => requestAction('pause')}
            disabled={busy}
            className="modal-action modal-action--warning"
          >
            Pause analysis (no personalization)
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-4" aria-busy={busy}>
          <button
            type="button"
            onClick={() => requestAction('export')}
            disabled={busy}
            className="modal-action flex-1"
          >
            Export data
          </button>
          <button
            type="button"
            onClick={() => requestAction('delete')}
            disabled={busy}
            className="modal-action flex-1 modal-action--danger"
          >
            Delete data
          </button>
        </div>

        {status && (
          <p
            className={`modal-status ${status.type === 'error' ? 'modal-status--error' : 'modal-status--success'}`}
            role="status"
            aria-live="assertive"
          >
            {status.message}
          </p>
        )}
      </div>
      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        onCancel={() => (!busy ? setPendingAction(null) : null)}
        onConfirm={handleConfirmAction}
        title={pendingAction?.title}
        description={pendingAction?.description}
        confirmLabel={pendingAction?.confirmLabel}
        tone={pendingAction?.tone}
        busy={busy}
      />
    </div>
  );
}
