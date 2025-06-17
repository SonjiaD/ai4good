import React from 'react';
import PDFUploader from '../components/PDFUploader';
import ExtractedText from '../components/ExtractedText';
import QAAssistant from '../components/QAAssistant';
import QuizSection from '../components/QuizSection';
import EyeTracker from '../components/EyeTracker';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { ReadingProvider } from '../context/ReadingContext';
import '../App.css';  // keep your existing CSS

const ReadingPage: React.FC = () => {
  return (
    <ReadingProvider>
      <div className="app">
        <header className="header">
          <h1>ReadingBudd.Ai</h1>
        </header>

        <div className="split-screen">
          <div className="left-panel">
            <PDFUploader />
            <ExtractedText />
            <QAAssistant />
            <QuizSection />
          </div>

          <div className="right-panel">
            <EyeTracker />
            <AnalyticsPanel />
          </div>
        </div>
      </div>
    </ReadingProvider>
  );
};

export default ReadingPage;
