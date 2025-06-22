import './OutfitShop.css';
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';
import coinCount from '../assets/coin-count.png';

const outfits = [
  {
    name: 'Astronaut Outfit',
    price: 50,
    image: '/images/astronaut.png',
  },
  {
    name: 'Wizard',
    price: 40,
    image: '/images/wizard.png',
  },
  {
    name: 'Bee',
    price: 30,
    image: '/images/bee.png',
  },
  {
    name: 'SuperBudd',
    price: 30,
    image: '/images/superbudd.png',
  },
];

export default function OutfitShop() {
  const [coins, setCoins] = useState<number>(100);
  const [selectedOutfit, setSelectedOutfit] = useState<string>('');
  const navigate = useNavigate();

  return (
    <div className="outfit-shop">
      <header className="navbar">
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
          <nav>
            <Link to={'/reading'} className="nav-link">{'Read'}</Link>
            <Link to={'/home'} className="nav-link">{'Dashboard'}</Link>
            <Link to={'/avatar'} className="nav-link">{'Customize Avatar'}</Link>
            <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
          </nav>
      </header>


      <h1>Outfit Shop</h1>
      <p className="subtitle">Outfits rotate weekly— Grab them while you can!</p>

      <div className="coin-display">
            <img src={coinCount} alt="Coins" className="coin-img" />
      </div>

      {showWarning && (
        <div className="warning-popup">
          Not enough coins! 🪙<br />
          <span style={{ fontSize: '14px' }}>Read more to earn coins.</span>
        </div>
      )}

      <div className="outfit-grid">
        {outfits.map((outfit) => {
          const isPurchased = purchased.includes(outfit.name);
          const isSelected = selectedOutfit === outfit.name;

          return (
            <div
              className="outfit-card"
              key={outfit.name}
              onClick={() => handlePurchase(outfit)}
              style={{
                position: 'relative',
                cursor: isSelected ? 'default' : 'pointer',
                opacity: isSelected ? 0.95 : 1,
              }}
            >
              <img src={outfit.image} alt={outfit.name} className="outfit-image" />
              <div className="outfit-name">{outfit.name}</div>
              <div className="outfit-price">
                <span role="img" aria-label="coin">💰</span> {outfit.price}
              </div>

              {isPurchased && (
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  backgroundColor: '#fff3cd',
                  color: '#333',
                  padding: '4px 8px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                }}>
                  Unlocked
                </div>
              )}

              {isSelected && (
                <img
                  src="/images/checkmark.svg"
                  alt="Selected"
                  className="checkmark"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
