import React from 'react';
import "./CustomizeAvatar.css";
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import coinIcon from '../assets/coin-icon.png';
import { useState } from 'react';

import bearPfp from '../assets/bear-avatar.png';
import coinCount from '../assets/coin-count.png';
import chef from '../assets/chef.png';
import pirate from '../assets/pirate.png';
import hero from '../assets/hero.png';

const Home: React.FC = () => {
  const [coins] = useState<number>(100);
  const navigate = useNavigate();

  return (
    <div className="customavatar-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <Link to={'/reading'} className="nav-link">{'Read'}</Link>
          <Link to={'/home'} className="nav-link">{'Dashboard'}</Link>
          <Link to={'/outfit-shop'} className="nav-link">{'Outfit Shop'}</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button> 
        </nav>
      </header>

      <main className="customavatar-main">
        <h1>Customize your avatar!</h1>
        <div className="coin-display">
        <img src={coinIcon} className="coin-icon" alt="Coin" />
        <span className="coin-count">{coins}</span>
      </div>
        
        <div className="avatar-sections">
          <div className="avatar-equipment">
            <img src={bearPfp} alt="Bear Avatar" className="bear-pfp" />
            <h2>Lily</h2>
            <p>equipped <em>Honey Bear</em></p>
          </div>

          <div className="outfit-gallery">
            <h2>Outfits</h2>
            <div className="outfit-row">
              <img src={chef} alt="Chef Outfit" className="outfit-img" />
              <img src={pirate} alt="Pirate Outfit" className="outfit-img" />
              <img src={hero} alt="Superhero Outfit" className="outfit-img" />
            </div>
            <button className="save-changes">Save Changes</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
