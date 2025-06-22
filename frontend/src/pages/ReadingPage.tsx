import React from 'react';
import PDFUploader from '../components/PDFUploader';
import ExtractedText from '../components/ExtractedText';
import QAAssistant from '../components/QAAssistant';
import QuizSection from '../components/QuizSection';
import EyeTracker from '../components/EyeTracker';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { ReadingProvider } from '../context/ReadingContext';
import '../App.css';  // keep your existing CSS
import './ReadingPage.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ReadingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ReadingProvider>
      <div className="app">
        <header className="navbar">
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
          <nav>
            <Link to={'/home'} className="nav-link">{'Dashboard'}</Link>
            <Link to={'/outfit-shop'} className="nav-link">{'Outfit Shop'}</Link>
            <Link to={'/avatar'} className="nav-link">{'Customize Avatar'}</Link>
            <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
          </nav>
        </header>

        <div className="split-screen">
          <div className="left-panel">
          <div className="card story-time-card">
          <div className="story-time-top">
            <h2 className="section-title">Story Time</h2>
            <div className="story-time-header">
              <PDFUploader />
            </div>
          </div>
          <div className="story-box">
            <p>Upload a PDF to view your story here!</p>
          </div>
          <div className="read-aloud-container">
            <button className="read-aloud-btn">
              <span className="icon">▶</span> Read Aloud
            </button>
          </div>
          
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
          </div>
        </div>
      </div>
    </ReadingProvider>
  );
};

export default ReadingPage;
