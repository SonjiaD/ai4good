import React from 'react';
import './Welcome.css';
import logo from '../assets/logo.png';
import readingBuddies from '../assets/reading-buddies.png'; // ← your combined image
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
      </header>

      <main className="welcome-main">
        <h1>Welcome, Lily!</h1>
        <h2>Upload a PDF to start reading!</h2>
        <button className="file-btn" onClick={() => navigate('/pdf')}>
              Let's Go!
        </button>
        <img src={readingBuddies} alt="Reading Buddies" className="reading-buddies-img" />
      </main>
    </div>
  );
};

export default Welcome;
