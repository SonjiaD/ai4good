import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import logo from '../assets/logo.png';
import bookieBudd from '../assets/bookie-budd.png';

const LoginSignup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="loginsignup-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <button>About</button>
          <button>Contact</button>
        </nav>
      </header>

    <main className="loginsignup-main">
            <h1>Hi there! I’m your ReadingBudd :)</h1>
            <p>An AI reading companion to help you understand, enjoy, and grow!</p>
            <img src={bookieBudd} alt="Bot with Book" className="bookie-budd" />
            <div className="button-group">
              <button className="signup-btn" onClick={() => navigate('/Signup')}>Sign Up</button>
              <button className="login-btn" onClick={() => navigate('/Login')}>Log In</button>
            </div>
      </main>
    </div>
  );
};


export default LoginSignup;

