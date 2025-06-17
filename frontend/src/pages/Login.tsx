import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import readingBuddies from '../assets/reading-buddies-login.png';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

    <main className="login-main">
            <h1>Welcome back!</h1>
            <p>Let's continue your reading journey!</p>
            
            <form className="login-form">
              <input type="email" placeholder="Email" className="input blue" />
              <input type="password" placeholder="Password…" className="input purple" />
              <button type="submit" className="submit-btn" onClick={() => navigate('/Questionnaire')}>Log In</button>
            </form>

            <p className="signup-text">
                Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
            </p>

            <img src={readingBuddies} alt="Reading Buddies" className="login-buddies" />
      </main>
    </div>
  );
};


export default Login;