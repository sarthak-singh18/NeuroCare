import { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/Home.jsx';
import ProfilePage from './pages/Profile.jsx';
import BreathingExercisesPage from './pages/BreathingExercises.jsx';
import MoodJournalPage from './pages/MoodJournal.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import BreathingSession from './components/BreathingSession.jsx';
import SimpleBreathingTest from './components/SimpleBreathingTest.jsx';
import PrivacyModal from './components/PrivacyModal.jsx';
import ConsentModal from './components/ConsentModal.jsx';
import Particles from './components/Particles.jsx';
import CardNav from './components/CardNav.jsx';
import ClickSpark from './components/ClickSpark.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import MobileResponsive from './components/MobileResponsive.jsx';
import { analyzeText, getProfile, saveProfile, recordConsent } from './lib/api.js';
import { buildPersonalizedPlan } from './lib/personalization.js';
import logo from './assets/logo.svg';
import { useThemeMode } from './context/ThemeContext.jsx';

const STORAGE_KEY = 'neuracare-user-id';
const CONSENT_KEY = 'neuracare-consent-status';
const DEFAULT_BREATHING_PATTERN = [
  { label: 'Inhale', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Exhale', seconds: 4 }
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useThemeMode();
  const [userId, setUserId] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const generated = `demo-${crypto.randomUUID().slice(0, 8)}`;
    window.localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  });

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [toast, setToast] = useState(null);
  const [consentRecord, setConsentRecord] = useState(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn('Unable to parse stored consent', err);
      return null;
    }
  });

  const navItems = [
    {
      label: "About",
      bgColor: isDark ? "#1a0b2e" : "#f8fafc",
      textColor: isDark ? "#e879f9" : "#1e293b",
      links: [
        { name: "Our Mission", href: "#mission" },
        { name: "Team", href: "#team" },
        { name: "Careers", href: "#careers" }
      ]
    },
    {
      label: "Services", 
      bgColor: isDark ? "#2d1b4e" : "#f1f5f9",
      textColor: isDark ? "#c084fc" : "#334155",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Breathing Exercises", href: "/breathing" },
        { name: "Mood Journal", href: "/journal" },
        { name: "Profile", href: "/profile" }
      ]
    },
    {
      label: "Contact",
      bgColor: isDark ? "#1e0a37" : "#f8fafc",
      textColor: isDark ? "#d8b4fe" : "#475569",
      links: [
        { name: "Support", href: "#support" },
        { name: "Feedback", href: "#feedback" }
      ]
    }
  ];

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const data = await getProfile(userId);
        if (!cancelled) {
          setProfile(data);
          if (data?.consent) {
            persistConsentState(data.consent);
          }
        }
      } catch (err) {
        if (err.status !== 404 && !cancelled) {
          console.warn('Profile sync failed, using local data.', err);
          // Removed intrusive offline message
        }
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const hasConsent = consentRecord?.consentGiven === true;

  async function handleRunAnalysis({ name, text, mood }) {
    try {
      if (!hasConsent) {
        setError('Consent is required before running burnout analysis.');
        return;
      }
      setLoading(true);
      setError(null);
      if (!profile || profile.name !== name) {
        const preferencesPayload = profile?.preferences || {
          preferredSessionLength: 3,
          detoxFormat: 'phone-free',
          usePersonalization: false,
          preferredSupport: 'breathing'
        };
        const updatedProfile = await saveProfile({
          userId,
          name,
          timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: preferencesPayload
        });
        setProfile(updatedProfile);
      }

      const payload = {
        userId,
        text,
        timestamp: new Date().toISOString(),
        metadata: {
          mood,
          name
        }
      };
      const result = await analyzeText(payload);
      setAnalysis(result);
      setProfile((prev) => {
        const base = prev || {
          userId,
          name,
          timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: profile?.preferences || {}
        };
        return {
          ...base,
          lastAnalysis: {
            timestamp: payload.timestamp,
            sentimentScore: result.sentimentScore,
            sentimentLabel: result.sentimentLabel,
            burnoutRisk: result.burnoutRisk,
            suggestions: result.suggestions
          }
        };
      });
      setToast({ type: 'success', message: 'Analysis complete' });
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  const personalizedPlan = useMemo(() => buildPersonalizedPlan(profile, analysis), [profile, analysis]);
  const breathingMinutes = personalizedPlan?.sessionLength
    || profile?.preferences?.preferredSessionLength
    || 3;
  const breathingPattern = profile?.preferences?.breathingPattern?.length
    ? profile.preferences.breathingPattern
    : DEFAULT_BREATHING_PATTERN;

  const handleAcceptDetox = useCallback(() => {
    const detoxMessage = personalizedPlan?.detoxPlan
      ? `Personalized detox: ${personalizedPlan.detoxPlan}.`
      : 'Detox block scheduled — silence notifications for 2 hours.';
    setToast({ type: 'info', message: detoxMessage });
    setTimeout(() => setToast(null), 4000);
  }, [personalizedPlan]);

  const scrollToInsights = useCallback(() => {
    const insightSection = document.getElementById('insights');
    if (!insightSection) return;
    insightSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    insightSection.classList.add('insights-highlight');
    window.setTimeout(() => insightSection.classList.remove('insights-highlight'), 1000);
  }, []);

  function persistConsentState(consent) {
    if (!consent) return;
    const record = {
      consentGiven: consent.consentGiven,
      timestamp: consent.timestamp
    };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    setConsentRecord(record);
  }

  async function handleConsentDecision(consentGiven) {
    const payload = {
      userId,
      consentGiven,
      timestamp: new Date().toISOString()
    };
    await recordConsent(payload);
    persistConsentState(payload);

    if (!consentGiven) {
      setAnalysis(null);
      setToast({ type: 'info', message: 'Consent declined. Analysis is paused and data queued for deletion.' });
      setTimeout(() => setToast(null), 5000);
    } else {
      setToast({ type: 'success', message: 'Thanks! Local analysis is enabled.' });
      setTimeout(() => setToast(null), 4000);
    }
  }

  const consentDisabledMessage = 'Please review and accept the privacy notice to enable burnout detection.';
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Overview", ariaLabel: "About NeuraCare", href: "/" },
        { label: "Features", ariaLabel: "Our Features", href: "#features" }
      ]
    },
    {
      label: "Analysis", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Start Analysis", ariaLabel: "Run Burnout Analysis", href: "/" },
        { label: "My Reports", ariaLabel: "View My Reports", href: "#insights" }
      ]
    },
    {
      label: "Support",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Privacy", ariaLabel: "Privacy Settings", href: "#privacy" },
        { label: "Help", ariaLabel: "Get Help", href: "#help" },
        { label: "Contact", ariaLabel: "Contact Us", href: "#contact" }
      ]
    }
  ];

  const overlayClass = isDark
    ? 'absolute inset-0 bg-gradient-to-b from-[#030014]/60 via-[#030014]/85 to-[#01010f]'
    : 'absolute inset-0 bg-gradient-to-b from-white/70 via-[#fefafc]/80 to-[#fdf8ff]';
  const sparkColor = isDark ? '#c084fc' : '#f59e0b';

  return (
    <MobileResponsive>
      <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={120}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          className="h-full w-full"
        />
        <div className={overlayClass} aria-hidden="true" />
      </div>

      <div className="relative z-10 px-4 pb-20">
        <CardNav
          logo={logo}
          logoAlt="NeuraCare logo"
          items={navItems}
          baseColor={isDark ? '#1a0b2e' : '#ffffff'}
          menuColor={isDark ? '#e879f9' : '#334155'}
          buttonBgColor={isDark ? '#c084fc' : '#1f1342'}
          buttonTextColor={isDark ? '#100414' : '#fdf8ff'}
          onCtaClick={() => setShowPrivacy(true)}
          rightAccessory={<ThemeToggle />}
        />

        {error && (
          <div className="glass-panel mx-auto mb-4 max-w-4xl text-rose-100" role="alert">
            {error}
          </div>
        )}

        {toast && (
          <div className={`glass-panel mx-auto mb-4 max-w-4xl text-sm ${toast.type === 'success' ? 'border-emerald-400/40 text-emerald-100' : 'border-sky-400/40 text-sky-100'}`}>
            {toast.message}
          </div>
        )}

        <ClickSpark
          className="mx-auto max-w-6xl mt-8"
          sparkColor={sparkColor}
          sparkSize={12}
          sparkRadius={isDark ? 18 : 22}
          sparkCount={isDark ? 10 : 12}
          duration={isDark ? 420 : 500}
          extraScale={1.2}
        >
          <main className="space-y-8">
            <Routes>
              <Route
                path="/"
                element={(
                  <HomePage
                    profile={profile}
                    analysis={analysis}
                    loading={loading}
                    personalizedPlan={personalizedPlan}
                    canSubmit={hasConsent}
                    consentRequiredMessage={consentDisabledMessage}
                    onRunAnalysis={handleRunAnalysis}
                    onStartBreathing={() => setShowBreathing(true)}
                    onAcceptDetox={handleAcceptDetox}
                  />
                )}
              />
              <Route
                path="/profile"
                element={(
                  <ProfilePage
                    userId={userId}
                    profile={profile}
                    onProfileUpdate={(next) => {
                      setProfile(next);
                      navigate('/');
                    }}
                  />
                )}
              />
              <Route
                path="/breathing"
                element={<BreathingExercisesPage />}
              />
              <Route
                path="/journal"
                element={<MoodJournalPage />}
              />
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />
              <Route
                path="/test-breathing"
                element={<SimpleBreathingTest />}
              />
            </Routes>
          </main>
        </ClickSpark>
      </div>

      <BreathingSession
        isOpen={showBreathing}
        onDismiss={() => setShowBreathing(false)}
        durationMinutes={breathingMinutes}
        pattern={breathingPattern}
        onFinish={() => {
          setToast({ type: 'success', message: 'Breathing session complete. Jot down how you feel.' });
          setShowBreathing(false);
          setTimeout(() => setToast(null), 4000);
        }}
      />
      <PrivacyModal
        userId={userId}
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        onConsentChange={handleConsentDecision}
      />
      <ConsentModal isOpen={!consentRecord} onDecision={handleConsentDecision} />
    </div>
    </MobileResponsive>
  );
}
