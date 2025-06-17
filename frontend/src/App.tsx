import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import FocusTracker from './pages/FocusTracker';
import OutfitShop from './pages/OutfitShop';


function App() {
  // const [msg, setMsg] = useState('');
  // const [response, setResponse] = useState('');

  // const handleSend = async () => {
  //   const res = await fetch("http://localhost:5000/api/echo", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message: msg })
  //   });
  //   const data = await res.json();
  //   setResponse(data.response);
  // };

  return (
    <Router>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/pdf">PDF Upload</Link>
        <Link to ="/focus" style={{ marginLeft: '1rem' }}>Focus Tracker</Link>
        <Link to="/outfit-shop" style={{ marginLeft: '1rem' }}>Outfit Shop</Link>
        <Link to="/reading" style={{ marginLeft: '1rem' }}>Reading</Link>
      </nav>

      <Routes>
        <Route path="/" element={<div>Welcome to the Home Page!</div>} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/focus" element={<FocusTracker />} />
        <Route path="/outfit-shop" element={<OutfitShop />} />
        <Route path="/reading" element={<ReadingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
