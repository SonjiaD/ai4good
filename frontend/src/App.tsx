import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PdfUpload from './pages/5_PDF';

function App() {
  const [msg, setMsg] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    const res = await fetch("http://localhost:5000/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <Router>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/pdf">PDF Upload</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: '2rem' }}>
              <h1>React + Flask Example</h1>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} />
              <br />
              <button onClick={handleSend}>Send to Flask</button>
              <p><strong>Flask says:</strong> {response}</p>
            </div>
          }
        />
        <Route path="/pdf" element={<PdfUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
