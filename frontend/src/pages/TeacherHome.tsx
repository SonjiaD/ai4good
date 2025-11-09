import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import logo from '../assets/logo.png';
import readingBuddies from '../assets/reading-buddies.png';
import './TeacherHome.css';

const TeacherHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="teacher-home-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <button>Home</button>
          <button>Assignment</button>
          <button>Troubleshoot</button>
          <button>Settings</button>
          <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
        </nav>
      </header>

    <main className="teacher-home-main">
            <h1>Hi, Ms. Watson.</h1>
            <p>Track and analyze your students' reading comprehension process.</p>
            <button className="my-class-btn" onClick={() => navigate('/MyClass')}>My Class</button>
            <img src={readingBuddies} alt="Reading buddies" className="reading-budds-img" />
        </main>
    </div>
  );
};

export default TeacherHome;
