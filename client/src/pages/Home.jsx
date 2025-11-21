import { useState } from 'react';
import InputPanel from '../components/InputPanel.jsx';
import Results from '../components/Results.jsx';
import StressDetector from '../components/StressDetector.jsx';

export default function HomePage({
  profile,
  onRunAnalysis,
  analysis,
  loading,
  onStartBreathing,
  onAcceptDetox,
  personalizedPlan,
  canSubmit,
  consentRequiredMessage
}) {
  const [currentText, setCurrentText] = useState('');

  const handleTextChange = (text) => {
    setCurrentText(text);
  };

  return (
    <div className="home-layout">
      <div className="mb-6">
        <StressDetector text={currentText} />
      </div>

      <div className="modern-grid">
        <InputPanel
          profile={profile}
          onSubmit={onRunAnalysis}
          loading={loading}
          canSubmit={canSubmit}
          disabledMessage={consentRequiredMessage}
          onTextChange={handleTextChange}
        />
        <Results
          result={analysis}
          onStartBreathing={onStartBreathing}
          onAcceptDetox={onAcceptDetox}
          personalizedPlan={personalizedPlan}
        />
      </div>
    </div>
  );
}
