// src/pages/ReadingAssistant.tsx

import React from "react";
import PDFUploader from "../components/PDFUploader";
import ExtractedText from "../components/ExtractedText";
import QAAssistant from "../components/QAAssistant";
import QuizSection from "../components/QuizSection";
import EyeTracker from "../components/EyeTracker";
import AnalyticsPanel from "../components/AnalyticsPanel";
import { ReadingProvider } from "../context/ReadingContext";

const ReadingAssistant: React.FC = () => {
  return (
    <ReadingProvider>
      <div className="flex flex-1 p-6 gap-6 @container/main bg-[var(--background-light)]">
        <div className="flex flex-col w-full @[1024px]/main:w-3/5 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Story Time</h2>
              <PDFUploader />
            </div>
            <ExtractedText />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Q&A Assistant</h2>
            <QAAssistant />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Test Your Understanding</h2>
            <QuizSection />
          </div>
        </div>

        <div className="flex flex-col w-full @[1024px]/main:w-2/5 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Webcam Feed</h2>
            <EyeTracker />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Focus Analytics</h2>
            <AnalyticsPanel />
          </div>
        </div>
      </div>
    </ReadingProvider>
  );
};

export default ReadingAssistant;
