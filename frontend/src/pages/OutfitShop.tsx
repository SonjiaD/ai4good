import './OutfitShop.css';
import React, { useState } from 'react';

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

  return (
    <div className="outfit-shop">
      <h1>Outfit Shop</h1>
      <p className="subtitle">Outfits rotate weekly— Grab them while you can!</p>
      <div className="coin-display">
        <img src="/images/coin.png" className="coin" />
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


