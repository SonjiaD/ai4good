import './StudentOverview.css';
import bearPfp from '../assets/bear-pfp.png'; 
import logo from '../assets/logo.png';
import chartPlaceholder from '../assets/chart-placeholder.png'; // Placeholder for chart image
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentOverview: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="overview-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#">Home</a>
          <a href="#">Assignment</a>
          <a href="#">Troubleshoot</a>
          <a href="#">Settings</a>
          <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
        </nav>
      </header>

      <h1 className="page-title">Student Overview</h1>

      <div className="info-grid">
        <div className="profile-card">
          <img src={bearPfp} alt="Bear Avatar" className="profile-avatar" />
          <h2 className="student-name">Lily 🧠</h2>
          <p><strong>ReadingBudd.AI ID</strong> 123456789</p>
          <p><strong>Birthday</strong> November 12, 2018</p>
          <p><strong>Last Session</strong> May 30, 2025</p>
        </div>

        <div className="stats-card">
          <p><strong>Reading Level</strong><br/>Level 3</p>
          <p><strong>Learner Type</strong><br/>Visual, Audio, Independent</p>
          <p><strong>Topic Preference</strong><br/>Animals, Magic/Adventure</p>
          <p><strong>Text-To-Speech (ON/OFF)</strong><br/>ON</p>
        </div>
      </div>

      <div className="reading-activity">
        <div className="activity-header">
          <h2>📘 Reading Activity</h2>
          <button className="see-all-btn">See All</button>
        </div>

        <div className="activity-stats">
          <div className="stat-box">
            <h3>Reading Time</h3>
            <p className="stat-value">30 Min</p>
            <p className="stat-sub">Last 7 Days <span className="stat-positive">↑ +10%</span></p>
          </div>
          <div className="stat-box">
            <h3>Uploads</h3>
            <p className="stat-value">12</p>
            <p className="stat-sub">Last 7 Days <span className="stat-positive">↑ +2 uploads</span></p>
          </div>
        </div>

        <div className="chart-box">
          <img src={chartPlaceholder} alt="Reading Trend" className="trend-chart" />
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;