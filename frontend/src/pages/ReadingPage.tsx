import React, { useEffect } from "react";
import PDFUploader from "../components/PDFUploader";
import ExtractedText from "../components/ExtractedText";
import QAAssistant from "../components/QAAssistant";
import QuizSection from "../components/QuizSection";
import EyeTracker from "../components/EyeTracker";
import AnalyticsPanel from "../components/AnalyticsPanel";
import { ReadingProvider, useReadingContext } from "../context/ReadingContext";
import "../App.css"; // keep your existing CSS
import "./ReadingPage.css";
import FocusAlerts from "../components/FocusAlerts";

const ReadingPageContent: React.FC = () => {
  const { setMouseIdleTime } = useReadingContext();
  useEffect(() => {
    let lastMoveTime = Date.now();

    const updateIdle = () => {
      lastMoveTime = Date.now();
    };

    const interval = setInterval(() => {
      const idleTimeSec = Math.floor((Date.now() - lastMoveTime) / 1000);
      setMouseIdleTime(idleTimeSec);
    }, 1000);

    window.addEventListener("mousemove", updateIdle);
    return () => {
      window.removeEventListener("mousemove", updateIdle);
      clearInterval(interval);
    };
  }, [setMouseIdleTime]);

  return (
    <div className="app">

      {/* Uncomment the header if you want to display the logo */}

      {/* <header className="header">
        <img
          src="/logo.png"
          alt="ReadingBudd.AI logo"
          className="app-logo"
        ></img>
      </header> */}

      <div className="split-screen">
        <div className="left-panel">
          <div className="card story-time-card">
            
            <div className="story-time-top">
              <h2 className="section-title">Story Time</h2>
              <div className="story-time-header">
                <PDFUploader />
              </div>
            </div>
            {/* <div className="story-box">
              <p>Upload a PDF to view your story here!</p>
            </div> */}

            {/* text extraction showing now */}
            <div className="story-box" style={{ whiteSpace: "pre-wrap" }}>
              <ExtractedText />
            </div>


            {/* <div className="read-aloud-container">
              <button className="read-aloud-btn">
                <span className="icon">▶</span> Read Aloud
              </button>
            </div> */}

            <div className="card qa-card">
              <h2 className="qa-title">Q&A Assistant</h2>
              <QAAssistant />
            </div>
            <QuizSection />
          </div>

          {/* <PDFUploader />
            <ExtractedText />
            <QAAssistant />
            <QuizSection /> */}
        </div>

        <div className="right-panel">
          <EyeTracker />
          <AnalyticsPanel />
          <FocusAlerts />
        </div>
      </div>
    </div>
  );
};
const ReadingPage: React.FC = () => (
  <ReadingProvider>
    <ReadingPageContent />
  </ReadingProvider>
);
export default ReadingPage;
