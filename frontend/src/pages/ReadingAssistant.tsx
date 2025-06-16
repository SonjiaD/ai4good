// /src/pages/ReadingAssistant.tsx

import React from 'react';
import { ReadingProvider } from '../context/ReadingContext';
import PDFUploader from '../components/PDFUploader';
import ExtractedText from '../components/ExtractedText';
import QuizSection from '../components/QuizSection';
import EyeTracker from '../components/EyeTracker';
import AnalyticsPanel from '../components/AnalyticsPanel';

const ReadingAssistant: React.FC = () => {
  return (
    <ReadingProvider>
      <div className="flex min-h-screen bg-[var(--background-light)] text-[var(--text-primary)]">

        <div className="w-3/5 p-6 space-y-6">
          <PDFUploader />
          <ExtractedText />
          <QuizSection />
        </div>

        <div className="w-2/5 p-6 space-y-6 bg-gray-100">
          <EyeTracker />
          <AnalyticsPanel />
        </div>

      </div>
    </ReadingProvider>
  );
};

export default ReadingAssistant;
