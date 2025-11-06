import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import FocusTracker from './pages/FocusTracker';
import OutfitShop from './pages/OutfitShop';
import ConsentForm from './pages/ConsentForm';
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
import ImageGenerator from "./pages/ImageGenerator";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup/>} />
        <Route path="/reading" element={<ReadingPage />} />
        {/* <Route path="/focus" element={<FocusTracker />} /> */}
        <Route path="/consent" element={<ConsentForm />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/outfit-shop" element={<OutfitShop />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacherhome" element={<TeacherHome />} />
        <Route path="/myclass" element={<MyClass />} />
        <Route path="/studentoverview" element={<StudentOverview />} />
        <Route path="/avatar" element={<CustomizeAvatar />} />
        <Route path="/images" element={<ImageGenerator />} />
        
      </Routes>
    </Router>
  );
};

export default App;
