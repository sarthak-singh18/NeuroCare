import { useEffect, useMemo, useState } from 'react';
import { sanitizeText } from '../utils/sanitize.js';
import { useThemeMode } from '../context/ThemeContext.jsx';

const badgeClasses = {
  positive: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40',
  neutral: 'bg-slate-500/20 text-slate-100 border border-slate-500/40',
  negative: 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
};

const riskColors = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-rose-300'
};

export default function Results({ result, onStartBreathing, onAcceptDetox, personalizedPlan }) {
  const { isDark } = useThemeMode();
  const [animatedResult, setAnimatedResult] = useState(result);
  const [entering, setEntering] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!result) {
      setAnimatedResult(null);
      return;
    }
    setEntering(true);
    
    // Show celebration on new results
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    
    const timeout = window.setTimeout(() => {
      setAnimatedResult(result);
      setEntering(false);
    }, 140);
    return () => window.clearTimeout(timeout);
  }, [result]);

  const copyAnalysis = () => {
    if (!content) return;
    
    const text = `NeuraCare Analysis:
Sentiment: ${content.sentimentLabel} (${content.sentimentScore})
Burnout Risk: ${content.burnoutRisk}

Suggestions:
${content.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    
    navigator.clipboard?.writeText(text).then(() => {
      // Could add toast notification here
    });
  };

  const saveToJournal = () => {
    if (!content) return;
    
    const journalEntry = {
      id: `analysis-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'ai-analysis',
      content: `AI Analysis Results:\n\nSentiment: ${content.sentimentLabel}\nBurnout Risk: ${content.burnoutRisk}\n\nRecommendations:\n${content.suggestions.map((s, i) => `• ${s}`).join('\n')}`,
      mood: content.sentimentScore > 0 ? Math.min(10, Math.max(1, Math.round((content.sentimentScore + 1) * 5))) : 5,
      emotions: content.sentimentScore > 0 ? ['hopeful'] : content.sentimentScore < -0.3 ? ['concerned'] : ['neutral'],
      tags: ['ai-analysis', 'insights'],
      timestamp: Date.now()
    };

    const existingEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
    existingEntries.unshift(journalEntry);
    localStorage.setItem('mood-journal-entries', JSON.stringify(existingEntries));
  };

  const content = useMemo(() => {
    if (!animatedResult) return null;
    const { sentimentScore, sentimentLabel, burnoutRisk, suggestions } = animatedResult;
    return {
      sentimentScore,
      sentimentLabel,
      burnoutRisk,
      suggestions
    };
  }, [animatedResult]);

  return (
    <div 
      className="results-container p-6 rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-800/60 backdrop-blur-xl border border-slate-700/50"
      id="insights"
    >
      <div
        className="space-y-6 insights-panel"
        data-state={entering ? 'entering' : 'ready'}
      >
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <span className="celebration-emoji">🎉</span>
            <span className="celebration-text">Analysis Complete!</span>
            <span className="celebration-emoji">✨</span>
          </div>
        </div>
      )}
      
      {content ? (
        <>
          <header className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>🧠 AI Insights</p>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30">
                  Real-time Analysis
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyAnalysis}
                  className="action-btn copy-btn"
                  title="Copy analysis to clipboard"
                >
                  <span className="action-icon">📋</span>
                  <span className="action-text">Copy</span>
                </button>
                <button 
                  onClick={saveToJournal}
                  className="action-btn save-btn"
                  title="Save to journal entries"
                >
                  <span className="action-icon">📝</span>
                  <span className="action-text">Save</span>
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Wellness Snapshot</h2>
          </header>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="metric-card metric-card--animated p-6" style={{ '--metric-delay': '0ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📊</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Sentiment Analysis</p>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{content.sentimentScore}</p>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {content.sentimentScore > 0.5 ? '📈 Positive trend' : content.sentimentScore < -0.5 ? '📉 Needs attention' : '➖ Stable'}
                </div>
              </div>
            </div>

            <div className="metric-card metric-card--animated p-6" style={{ '--metric-delay': '100ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💭</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Current Mood</p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold border ${badgeClasses[content.sentimentLabel] || badgeClasses.neutral}`}>
                {content.sentimentLabel === 'positive' ? '😊 Feeling Good' : content.sentimentLabel === 'negative' ? '😔 Struggling' : '😐 Balanced'}
              </span>
            </div>

            <div className="metric-card metric-card--animated p-6" style={{ '--metric-delay': '200ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Burnout Risk</p>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-2xl font-bold ${riskColors[content.burnoutRisk] || 'text-white'}`}>
                  {content.burnoutRisk === 'low' ? '🟢' : content.burnoutRisk === 'medium' ? '🟡' : '🔴'}
                </p>
                <span className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                  {content.burnoutRisk} Risk
                </span>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI-Powered Recommendations</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Personalized suggestions based on your reflection</p>
              </div>
            </div>
            
            {/* Enhanced AI insights display */}
            {animatedResult?.aiInsights && (
              <div className="p-4 rounded-2xl border" style={{ 
                background: 'var(--note-bg)', 
                borderColor: 'var(--note-border)',
                marginBottom: '1.5rem'
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🤖</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    AI Analysis ({animatedResult.aiInsights.provider?.toUpperCase()})
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 font-medium">
                    {animatedResult.aiInsights.confidence} confidence
                  </span>
                </div>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {animatedResult.aiInsights.content}
                </p>
              </div>
            )}

            <ul className="results-card space-y-4 p-4">
              {content.suggestions?.length ? (
                content.suggestions.map((suggestion, index) => (
                  <li key={suggestion} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 rounded-full flex items-center justify-center text-sm font-bold border border-purple-500/40">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-base leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                        {sanitizeText(suggestion)}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-3 py-8 justify-center">
                  <span className="animate-spin text-2xl">🧠</span>
                  <span className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
                    AI is analyzing your reflection to generate personalized insights...
                  </span>
                </li>
              )}
            </ul>
          </section>

          {personalizedPlan && (
            <section className="note-panel text-slate-100">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Personalized note</p>
              <p className="mt-2 text-base text-slate-100">{personalizedPlan.message}</p>
            </section>
          )}

          <div className="action-stack flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onStartBreathing}
              className="action-button secondary-cta px-6 py-3 font-semibold text-base flex items-center gap-2"
              aria-label={`Start ${personalizedPlan?.sessionLength || 3}-minute breathing session`}
            >
              <span className="text-lg">🧘‍♀️</span>
              Start {personalizedPlan?.sessionLength || 3}-min Breathing
            </button>
            <button
              type="button"
              onClick={onAcceptDetox}
              className="action-button tertiary-cta px-6 py-3 font-semibold text-base flex items-center gap-2"
              aria-label="Accept suggested detox schedule"
            >
              <span className="text-lg">📱</span>
              Accept Digital Detox
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto">
          <div className="text-7xl opacity-70 mb-2">🧠</div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Ready for AI Analysis
            </h3>
            <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }} aria-live="polite">
              Share your thoughts in the reflection panel to get personalized AI insights powered by multiple advanced models.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm bg-gradient-to-r from-green-500/10 to-blue-500/10 px-4 py-2 rounded-full border border-green-500/20" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-medium">OpenAI • Perplexity • Gemini Ready</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
