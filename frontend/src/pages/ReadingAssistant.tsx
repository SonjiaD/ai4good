// src/pages/ReadingAssistant.tsx

import React from 'react';
import { ReadingProvider } from '../context/ReadingContext';
import PDFUploader from '../components/PDFUploader';
import ExtractedText from '../components/ExtractedText';
import QAAssistant from '../components/QAAssistant';
import EyeTracker from '../components/EyeTracker';
import AnalyticsPanel from '../components/AnalyticsPanel';
import QuizSection from '../components/QuizSection';

const ReadingAssistant: React.FC = () => {
  return (
    <ReadingProvider>
      <div className="min-h-screen bg-[#f7fafd] p-6">
        <div className="max-w-[1300px] mx-auto grid grid-cols-3 gap-6">

          {/* LEFT PANEL */}
          <div className="col-span-2 space-y-4">

            {/* Story Time */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">📖 Story Time</h2>
                <PDFUploader />
              </div>
              <ExtractedText />
              <div className="flex justify-center mt-4">
                <button className="bg-green-500 text-white px-6 py-2 rounded font-semibold">Read Aloud</button>
              </div>
            </div>

            {/* Q&A Assistant */}
            <QAAssistant />
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-1 space-y-4">

            {/* Webcam Feed */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">Webcam Feed</h3>
              <EyeTracker />
            </div>

            {/* Focus Analytics */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <AnalyticsPanel />
            </div>

            {/* Quiz Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <QuizSection />
            </div>

            {/* Focus Alerts */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">Focus Alerts</h3>
              <p className="text-sm text-gray-600">No alerts right now. Keep up the great work!</p>
            </div>
          </div>

        </div>
      </div>
    </ReadingProvider>
  );
};

export default ReadingAssistant;
