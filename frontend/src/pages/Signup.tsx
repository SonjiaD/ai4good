import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import logo from '../assets/logo.png';
import honeyThumbs from '../assets/honey-thumbs-signup.png';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

    <main className="signup-main">
            <h1>Let’s get started!</h1>
            <p>To jumpstart into your reading journey~</p>
            
            <form className="signup-form">
              <input type="email" placeholder="Email" className="input blue" />
              <input type="password" placeholder="Password…" className="input purple" />
              <button type="submit" className="submit-btn" onClick={() => navigate('/Questionnaire')}>Sign Up</button>
            </form>

            <p className="login-text">
                Already have an account? <Link to="/login" className="login-link">Login</Link>
            </p>

            <img src={honeyThumbs} alt="Cheering Bear" className="signup-bear" />
      </main>
    </div>
  );
};


export default Signup;