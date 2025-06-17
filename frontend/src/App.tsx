import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import FocusTracker from './pages/FocusTracker';
// import OutfitShop from './pages/OutfitShop';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/reading">Reading App</Link>
        <Link to="/focus">Focus Tracker</Link>
        <Link to="/outfit-shop">Outfit Shop</Link>
      </nav>

      <Routes>
        <Route path="/" element={<div>Welcome to the Home Page!</div>} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/focus" element={<FocusTracker />} />
        {/* <Route path="/outfit-shop" element={<OutfitShop />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
