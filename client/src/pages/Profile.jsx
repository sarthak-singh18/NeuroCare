import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { saveProfile } from '../lib/api.js';

const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore'];

export default function ProfilePage({ userId, profile, onProfileUpdate }) {
  const [form, setForm] = useState({
    userId,
    name: '',
    timezone: 'UTC',
    preferences: {
      preferredSessionLength: 3,
      detoxFormat: 'phone-free',
      usePersonalization: false,
      preferredSupport: 'breathing'
    }
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        userId,
        name: profile.name || '',
        timezone: profile.timezone || 'UTC',
        preferences: {
          preferredSessionLength: profile.preferences?.preferredSessionLength || 3,
          detoxFormat: profile.preferences?.detoxFormat || 'phone-free',
          usePersonalization: Boolean(profile.preferences?.usePersonalization),
          preferredSupport: profile.preferences?.preferredSupport || 'breathing'
        }
      });
    }
  }, [profile, userId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...form,
        preferences: {
          ...form.preferences,
          preferredSessionLength: Number(form.preferences.preferredSessionLength)
        }
      };
      const saved = await saveProfile(payload);
      setStatus({ type: 'success', message: 'Profile saved' });
      onProfileUpdate(saved);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save profile' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold text-white">Profile settings</h1>
      <p className="mt-2 text-slate-400">Tune how NeuraCare personalizes nudges and sessions.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div>
          <label htmlFor="name" className="block text-sm text-slate-200">Display name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-white"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm text-slate-200">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-white"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preferences.preferredSessionLength" className="block text-sm text-slate-200">
            Preferred breathing session (minutes)
          </label>
          <select
            id="preferences.preferredSessionLength"
            name="preferences.preferredSessionLength"
            value={form.preferences.preferredSessionLength}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-white"
          >
            {[1, 3, 5].map((option) => (
              <option key={option} value={option}>{option} minute{option > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preferences.detoxFormat" className="block text-sm text-slate-200">
            Detox format
          </label>
          <select
            id="preferences.detoxFormat"
            name="preferences.detoxFormat"
            value={form.preferences.detoxFormat}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-white"
          >
            <option value="phone-free">Phone-free routine</option>
            <option value="social-media-lite">Social media lite</option>
            <option value="screen-schedule">Screen schedule</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="preferences.usePersonalization"
            name="preferences.usePersonalization"
            type="checkbox"
            checked={form.preferences.usePersonalization}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-600 bg-slate-900"
          />
          <label htmlFor="preferences.usePersonalization" className="text-sm text-slate-200">
            Use personalization (processed locally only)
          </label>
        </div>

        <div>
          <label htmlFor="preferences.preferredSupport" className="block text-sm text-slate-200">
            Support preference
          </label>
          <select
            id="preferences.preferredSupport"
            name="preferences.preferredSupport"
            value={form.preferences.preferredSupport || 'breathing'}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-white"
          >
            <option value="breathing">Breathing guidance</option>
            <option value="detox">Digital detox focus</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3 font-semibold text-white"
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>

        {status && (
          <p className={`rounded-2xl px-4 py-2 text-sm ${status.type === 'error' ? 'bg-rose-500/20 text-rose-100' : 'bg-emerald-500/20 text-emerald-100'}`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}

ProfilePage.propTypes = {
  userId: PropTypes.string.isRequired,
  profile: PropTypes.shape({
    name: PropTypes.string,
    timezone: PropTypes.string,
    preferences: PropTypes.object,
    lastAnalysis: PropTypes.object
  }),
  onProfileUpdate: PropTypes.func.isRequired
};
