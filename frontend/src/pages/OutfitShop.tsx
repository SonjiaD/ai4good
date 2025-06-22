import './OutfitShop.css';
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';
import coinCount from '../assets/coin-count.png';

const outfits = [
  {
    name: 'Astronaut Outfit',
    price: 400,
    image: '/images/astronaut.png',
  },
  {
    name: 'Wizard',
    price: 300,
    image: '/images/wizard.png',
  },
  {
    name: 'Bee',
    price: 300,
    image: '/images/bee.png',
  },
  {
    name: 'SuperBudd',
    price: 300,
    image: '/images/superbudd.png',
  },
];

export default function OutfitShop() {
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

      <div className="outfit-grid">
        {outfits.map((outfit) => (
          <div
            className="outfit-card"
            key={outfit.name}
            onClick={() => setSelectedOutfit(outfit.name)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <img src={outfit.image} alt={outfit.name} className="outfit-image" />
            <div className="outfit-name">{outfit.name}</div>
            <div className="outfit-price">
              <span role="img" aria-label="coin">💰</span> {outfit.price}
            </div>
            {selectedOutfit === outfit.name && (
              <img
                src="/images/checkmark.svg"  
                alt="Selected"
                className="checkmark"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


