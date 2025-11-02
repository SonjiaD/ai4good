import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import readingBuddies from '../assets/reading-buddies-login.png';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend login API
      const response = await axios.post(`${API_BASE}/api/login`, {
        email,
        password
      });

      console.log('✅ Login successful:', response.data);

      // Store user info in localStorage
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('user_email', response.data.email);
      localStorage.setItem('access_token', response.data.access_token);

      // Redirect to home
      navigate('/home');

    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#" onClick={(e) => e.preventDefault()}>About</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
        </nav>
      </header>

      <main className="login-main">
        <h1>Welcome back!</h1>
        <p>Let's continue your reading journey!</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            className="input blue"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password…" 
            className="input purple"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
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