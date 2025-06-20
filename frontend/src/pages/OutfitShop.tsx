import './OutfitShop.css';
import React, { useState } from 'react';

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
  const [purchased, setPurchased] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const handlePurchase = (outfit: any) => {
    if (!purchased.includes(outfit.name)) {
      if (coins >= outfit.price) {
        setCoins(coins - outfit.price);
        setPurchased([...purchased, outfit.name]);
        setSelectedOutfit(outfit.name);
        setShowWarning(false);
      } else {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2500); // Hide after 2.5s
      }
    } else {
      setSelectedOutfit(outfit.name);
      setShowWarning(false);
    }
  };

  return (
    <div className="outfit-shop">
      <h1>Outfit Shop</h1>
      <p className="subtitle">Outfits rotate weekly— Grab them while you can!</p>

      <div className="coin-display">
        <img src="/images/coin.png" className="coin-icon" alt="Coin" />
        <span className="coin-count">{coins}</span>
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
