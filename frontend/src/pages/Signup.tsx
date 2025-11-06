import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import logo from '../assets/logo.png';
import honeyThumbs from '../assets/honey-thumbs-signup.png';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend signup API
      const response = await axios.post(`${API_BASE}/api/signup`, {
        email,
        password
      });

      console.log('✅ Signup successful:', response.data);

      // Store user info in localStorage
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('user_email', response.data.email);
      localStorage.setItem('access_token', response.data.access_token);

      // Redirect to consent form
      navigate('/consent');

    } catch (err: any) {
      console.error('❌ Signup failed:', err);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#" onClick={(e) => e.preventDefault()}>About</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
        </nav>
      </header>

      <main className="signup-main">
        <h1>Let's get started!</h1>
        <p>To jumpstart into your reading journey~</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <form className="signup-form" onSubmit={handleSignup}>
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
            minLength={6}
          />
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
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