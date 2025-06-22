import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import FocusTracker from './pages/FocusTracker';
import OutfitShop from './pages/OutfitShop';
import Questionnaire from './pages/Questionnaire';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import TeacherHome from './pages/TeacherHome';
import MyClass from './pages/MyClass';
import StudentOverview from './pages/StudentOverview';
import CustomizeAvatar from './pages/CustomizeAvatar';

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
        {/* <Link to="/pdf">PDF Upload</Link>
        <Link to ="/focus" style={{ marginLeft: '1rem' }}>Focus Tracker</Link> */}
        <Link to="/questionnaire" style={{ marginLeft: '1rem' }}>Questionnaire</Link>
        <Link to="/welcome" style={{ marginLeft: '1rem' }}>Welcome</Link>
        <Link to="/home" style={{ marginLeft: '1rem' }}>HomePage</Link>
        <Link to="/loginsignup" style={{ marginLeft: '1rem' }}>Login/Signup</Link>
        <Link to="/outfit-shop" style={{ marginLeft: '1rem' }}>Outfit Shop</Link>
        <Link to="/reading" style={{ marginLeft: '1rem' }}>Reading</Link>
        <Link to="/profile" style={{ marginLeft: '1rem' }}>Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<LoginSignup/>} />
        <Route path="/reading" element={<ReadingPage />} />
        {/* <Route path="/focus" element={<FocusTracker />} /> */}
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/outfit-shop" element={<OutfitShop />} />
        <Route path="/profile" element={<Profile />} />
        {/* Add more routes as needed */}
        <Route path="/teacherhome" element={<TeacherHome />} />
        <Route path="/myclass" element={<MyClass />} />
        <Route path="/studentoverview" element={<StudentOverview />} />
        <Route path="/avatar" element={<CustomizeAvatar />} />
        
      </Routes>
    </Router>
  );
};

export default App;
