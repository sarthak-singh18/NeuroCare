import { useEffect, useMemo, useState } from 'react';
import MagicBento from './MagicBento.jsx';

const MIN_TEXT_LENGTH = 12;
const MAX_TEXT_LENGTH = 2000;

export default function InputPanel({ profile, onSubmit, loading, canSubmit = true, disabledMessage, onTextChange }) {
  const [form, setForm] = useState({
    name: '',
    text: '',
    mood: 5
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ name: false, text: false, mood: false });
  const [shake, setShake] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (profile?.name && profile.name !== 'Guest') {
      setForm((prev) => ({ ...prev, name: profile.name }));
    }
  }, [profile?.name]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    
    if (name === 'text' && onTextChange) {
      onTextChange(value);
    }
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (form.text.trim().length < MIN_TEXT_LENGTH) {
      nextErrors.text = `Tell us a bit more (minimum ${MIN_TEXT_LENGTH} characters)`;
    }
    if (Number.isNaN(Number(form.mood)) || form.mood < 1 || form.mood > 10) {
      nextErrors.mood = 'Mood must be between 1 and 10';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  useEffect(() => {
    if (!touched.name) return;
    setErrors((prev) => ({
      ...prev,
      name: form.name.trim() ? undefined : 'Name is required'
    }));
  }, [form.name, touched.name]);

  const meetsMinText = useMemo(() => form.text.trim().length >= MIN_TEXT_LENGTH, [form.text]);

  useEffect(() => {
    if (!touched.text) return;
    setErrors((prev) => ({
      ...prev,
      text: meetsMinText ? undefined : `Tell us a bit more (minimum ${MIN_TEXT_LENGTH} characters)`
    }));
  }, [meetsMinText, touched.text]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || !canSubmit) return;
    const isValid = validate();
    if (!isValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      text: form.text.trim(),
      mood: Number(form.mood)
    });
  }

  const textHelperId = 'reflection-helper';
  const nameErrorId = errors.name ? 'name-error' : undefined;
  const textErrorId = errors.text ? 'text-error' : undefined;
  const moodErrorId = errors.mood ? 'mood-error' : undefined;
  const remainingChars = useMemo(() => Math.max(0, MAX_TEXT_LENGTH - form.text.length), [form.text.length]);
  const sliderPercent = useMemo(() => ((Number(form.mood) - 1) / 9) * 100, [form.mood]);
  const moodTone = useMemo(() => {
    const moodValue = Number(form.mood);
    if (moodValue <= 3) return '#f87171';
    if (moodValue <= 6) return '#fbbf24';
    if (moodValue <= 8) return '#34d399';
    return '#38bdf8';
  }, [form.mood]);
  const sliderStyle = useMemo(() => ({
    '--mood-accent': moodTone,
    '--mood-percent': `${sliderPercent}%`
  }), [moodTone, sliderPercent]);
  
  const moodEmoji = useMemo(() => {
    const moodValue = Number(form.mood);
    if (moodValue <= 2) return '😔';
    if (moodValue <= 4) return '😐';
    if (moodValue <= 6) return '🙂';
    if (moodValue <= 8) return '😊';
    return '🎉';
  }, [form.mood]);
  
  const moodLabel = useMemo(() => {
    const moodValue = Number(form.mood);
    if (moodValue <= 2) return 'Very Depleted';
    if (moodValue <= 4) return 'Somewhat Low';
    if (moodValue <= 6) return 'Balanced';
    if (moodValue <= 8) return 'Good Energy';
    return 'Highly Energized';
  }, [form.mood]);

  useEffect(() => {
    const isValid = canSubmit && form.name.trim() && meetsMinText && !loading;
    setIsFormValid(isValid);
  }, [canSubmit, form.name, meetsMinText, loading]);

  const submitDisabled = !isFormValid;
  const helperMessage = `${form.text.length} / ${MAX_TEXT_LENGTH} characters · ${remainingChars} left`;
  const moodAnnounceId = 'mood-feedback';
  const getFieldState = (field) => {
    if (errors[field]) return 'error';
    if (touched[field]) return 'complete';
    return 'idle';
  };

  function renderSpinner() {
    if (!loading) return null;
    return (
      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" aria-hidden="true" />
      </span>
    );
  }

  return (
    <MagicBento className="h-full" accent="violet" intensity={0.45} shimmer="bold">
      <form onSubmit={handleSubmit} className={`space-y-8 ${shake ? 'form-shake' : ''}`} noValidate>
      {loading && (
        <div className="analysis-progress" aria-live="assertive">
          <span className="analysis-progress__bar" />
          <span className="sr-only">Analyzing reflection</span>
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          💭 Personal Reflection
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Share how you're feeling to get personalized AI-powered insights
        </p>
      </div>

      <div className="field-group" data-state={getFieldState('name')}>
        <label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--label-color)' }}>
          Your Name
        </label>
        <input
          id="name"
          name="name"
          className="field-control text-base"
          placeholder="Enter your name..."
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={nameErrorId}
        />
        <p className="field-hint">Only stored locally on your device</p>
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-rose-400" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field-group" data-state={getFieldState('text')}>
        <label htmlFor="text" className="text-sm font-medium" style={{ color: 'var(--label-color)' }}>
          How are you feeling today? 💭
        </label>
        <div className="relative">
          <textarea
            id="text"
            name="text"
            rows="6"
            className="field-control min-h-[180px] max-h-[300px] text-base leading-relaxed resize-none pr-10"
            placeholder="Share your thoughts, feelings, or what's been on your mind lately. The more detail you provide, the better our AI can understand and help you..."
            value={form.text}
            onChange={handleChange}
            disabled={loading}
            maxLength={MAX_TEXT_LENGTH}
            aria-required="true"
            aria-invalid={Boolean(errors.text)}
            aria-describedby={[textHelperId, textErrorId].filter(Boolean).join(' ') || undefined}
            style={{
              height: 'auto',
              minHeight: '180px',
              height: `${Math.min(300, Math.max(180, form.text.split('\n').length * 24 + 60))}px`
            }}
          />
          {form.text && (
            <button
              type="button"
              onClick={() => {
                setForm(prev => ({ ...prev, text: '' }));
                setTouched(prev => ({ ...prev, text: false }));
                if (onTextChange) onTextChange('');
              }}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Clear text"
            >
              <span className="text-lg">✕</span>
            </button>
          )}
        </div>
        <div id={textHelperId} className="mt-2 flex flex-wrap items-center justify-between text-sm" aria-live="polite">
          <span className={`font-medium transition-colors ${
            remainingChars < 100 ? 'text-yellow-500' : 'text-slate-400'
          }`}>
            {helperMessage}
          </span>
          <span className={`min-indicator font-semibold transition-all ${
            meetsMinText 
              ? 'min-indicator--success' 
              : form.text.length > 0 
                ? 'min-indicator--warn' 
                : 'min-indicator--neutral'
          }`}>
            {meetsMinText ? (
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span>
                Ready for analysis
              </span>
            ) : form.text.length > 0 ? (
              `Need ${MIN_TEXT_LENGTH - form.text.length} more characters`
            ) : (
              `Minimum ${MIN_TEXT_LENGTH} characters required`
            )}
          </span>
        </div>
        {errors.text && (
          <p id="text-error" className="mt-2 text-sm text-rose-400 font-medium" role="alert">
            {errors.text}
          </p>
        )}
      </div>

      <div className="field-group" data-state={getFieldState('mood')}>
        <label htmlFor="mood" className="text-sm font-medium" style={{ color: 'var(--label-color)' }}>
          Energy Level Today ⚡
        </label>
        <div
          className="mood-slider"
          aria-live="polite"
          aria-atomic="true"
          style={sliderStyle}
        >
          <div
            className="mood-slider__bubble"
            style={{ left: `calc(${sliderPercent}% - 16px)` }}
            aria-hidden="true"
          >
            <span>{form.mood}</span>
          </div>
          <input
            id="mood"
            name="mood"
            type="range"
            min="1"
            max="10"
            step="1"
            value={form.mood}
            onChange={handleChange}
            disabled={loading}
            className="mood-slider__input"
            aria-valuemin="1"
            aria-valuemax="10"
            aria-valuenow={form.mood}
            aria-describedby={moodErrorId || moodAnnounceId}
          />
          <p id={moodAnnounceId} className="sr-only">
            Current mood value {form.mood}, {moodLabel}
          </p>
          <div className="mood-feedback" style={{ color: moodTone }}>
            <span className="mood-emoji text-xl">{moodEmoji}</span>
            <span className="mood-text font-semibold">{moodLabel} ({form.mood}/10)</span>
          </div>
          <div className="mood-scale" aria-hidden="true">
            <span>😴 Depleted</span>
            <span>😐 Steady</span>
            <span>🚀 Energized</span>
          </div>
        </div>
        {errors.mood && (
          <p id="mood-error" className="mt-2 text-sm text-rose-400 font-medium" role="alert">
            {errors.mood}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="action-button primary-cta w-full px-8 py-4 text-lg font-bold tracking-wide focus-visible:outline-none focus-visible:ring-0 transition-all duration-300"
        disabled={submitDisabled}
        data-state={submitDisabled ? 'disabled' : 'ready'}
        data-loading={loading}
        aria-live="polite"
      >
        {renderSpinner()}
        {!canSubmit ? '🔒 Consent Required' : loading ? '🧠 AI Analyzing Your Reflection...' : '✨ Get AI-Powered Insights'}
      </button>
      {!canSubmit && disabledMessage && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg" style={{ background: 'var(--note-bg)', borderColor: 'var(--note-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }} role="alert">
            {disabledMessage}
          </p>
        </div>
      )}
      </form>
    </MagicBento>
  );
}
