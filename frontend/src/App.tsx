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
      <Routes>
        <Route path="/" element={<LoginSignup/>} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/focus" element={<FocusTracker />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/outfit-shop" element={<OutfitShop />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/teacherhome" element={<TeacherHome />} />
        <Route path="/myclass" element={<MyClass />} />
        <Route path="/studentoverview" element={<StudentOverview />} />
        <Route path="/avatar" element={<CustomizeAvatar />} />
        
      </Routes>
    </Router>
  );
};

export default App;
