import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PdfUpload from './pages/5_PDF';
import FocusTracker from './pages/FocusTracker';
import Questionnaire from './pages/Questionnaire';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherHome from './pages/TeacherHome';
import MyClass from './pages/MyClass';
import StudentOverview from './pages/StudentOverview';

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

      {/* navigation bar */}
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/pdf">PDF Upload</Link>
        <Link to ="/focus" style={{ marginLeft: '1rem' }}>Focus Tracker</Link>
        <Link to="/questionnaire" style={{ marginLeft: '1rem' }}>Questionnaire</Link>
        <Link to="/welcome" style={{ marginLeft: '1rem' }}>Welcome</Link>
        <Link to="/home" style={{ marginLeft: '1rem' }}>HomePage</Link>
        <Link to="/loginsignup" style={{ marginLeft: '1rem' }}>Login/Signup</Link>
        <Link to="/teacherhome" style={{ marginLeft: '1rem' }}>Teacher Home</Link>
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
        <Route path="/focus" element={<FocusTracker />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacherhome" element={<TeacherHome />} />
        <Route path="/myclass" element={<MyClass />} />
        <Route path="/studentoverview" element={<StudentOverview />} />
        
      </Routes>
    </Router>
  );
}

export default App;
