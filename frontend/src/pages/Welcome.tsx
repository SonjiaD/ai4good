import React from 'react';
import './Welcome.css';
import badge1 from '../assets/star-reader.png'; 
import badge2 from '../assets/storyteller.png';
import badge3 from '../assets/explorer.png';
import badge4 from '../assets/quiz-whiz.png';
import logo from '../assets/logo.png'; 

const Welcome: React.FC = () => {
  return (
    <div className="welcome-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#">Home</a>
          <a href="#">My Library</a>
          <a href="#">Explore</a>
          <a href="#">Settings</a>
        </nav>
      </header>

      <main className="welcome-main">
        <h1>Welcome, Lily!</h1>

        <div className="upload-box">
          <p>Upload a PDF to start reading!</p>
          <button className="upload-btn">Let’s Go!</button>
        </div>

        <div className="reading-progress">
          <p>Reading Progress</p>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="reading-stats">
          <div className="weekly-time">
            <p>Reading Time This Week</p>
            {/* bar chart placeholder */}
          </div>
          <div className="daily-challenge">
            <p>Daily Reading Challenge</p>
            <p>Read for 10 minutes and get 50 coins! 0/10 ⏱️</p>
          </div>
        </div>

        <h2>Recent Achievements</h2>
        <div className="achievements">
          <img src={badge1} alt="Star Reader" />
          <img src={badge2} alt="Storyteller" />
          <img src={badge3} alt="Explorer" />
          <img src={badge4} alt="Quiz Whiz" />
        </div>
      </main>
    </div>
  );
};

export default Welcome;
