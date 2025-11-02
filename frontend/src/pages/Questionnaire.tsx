import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import buddFace from '../assets/budd-face.png';
import logo from '../assets/logo.png';
import honeyThumbs from '../assets/honey-thumbs.png';
import buddCheer from '../assets/budd-cheer.png';
import './Questionnaire.css';
import { parentQuestions } from '../data/parentQuestions';
import { childQuestions } from '../data/childQuestions';
// for post request
import axios from 'axios';
const API_BASE = "http://127.0.0.1:5000";


type Role = 'Parent' | 'Child' | null;
type AnswerMap = Record<string, string>;

const Questionnaire: React.FC = () => {
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showThankYou, setShowThankYou] = useState(false);
  const navigate = useNavigate();

  const questions = role === 'Parent' ? parentQuestions : childQuestions;

  // Debug: Log when component renders
  console.log("[Questionnaire] Render - showThankYou:", showThankYou, "role:", role, "step:", step);

  // Check if questionnaire was already completed on component mount
  useEffect(() => {
    const questionnaireCompleted = localStorage.getItem('questionnaire_completed');
    if (questionnaireCompleted === 'true') {
      console.log("[Questionnaire] Questionnaire already completed - showing thank you page");
      setShowThankYou(true);
    }
  }, []);

  // Debug: Track showThankYou changes
  useEffect(() => {
    console.log("[Questionnaire] showThankYou changed to:", showThankYou);
    if (showThankYou) {
      console.log("[Questionnaire] Thank you page should be visible now!");
    }
  }, [showThankYou]);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(0);
    setSelectedOption('');
  };

  const selectOption = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    const questionId = questions[step].id;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    setSelectedOption('');

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const finalAnswers = { role, ...answers, [questionId]: selectedOption };

      // Get user_id and access_token from localStorage (set during login/signup)
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');

      if (!userId) {
        console.error("❌ No user_id found. User must be logged in.");
        alert("Please log in first!");
        navigate('/login');
        return;
      }

      try {
        // Send to backend with user_id and access_token
        console.log("[Questionnaire] Sending data to backend...");
        await axios.post(`${API_BASE}/api/save-questionnaire`, {
          answers: finalAnswers,
          user_id: userId,
          access_token: accessToken
        });

        localStorage.setItem("readingbuddy_profile", JSON.stringify(finalAnswers));

        console.log("✅ Questionnaire data sent to backend.");
      } catch (err) {
        console.error("❌ Failed to send questionnaire to backend:", err);
      }

      console.log("[Questionnaire] Setting showThankYou to true");
      // Mark questionnaire as completed in localStorage to persist state
      localStorage.setItem('questionnaire_completed', 'true');
      setShowThankYou(true);
      console.log("[Questionnaire] Questionnaire complete - staying on page");
      // Don't auto-redirect - let user click button to proceed
      return;
    }
  };

  const handleSkip = async () => {
    const questionId = questions[step].id;
    const skippedAnswers = { ...answers, [questionId]: 'skipped' };

    setAnswers(skippedAnswers);
    setSelectedOption('');

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const finalAnswers = { role, ...skippedAnswers };

      // Get user_id and access_token from localStorage
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');

      if (!userId) {
        console.error("❌ No user_id found. User must be logged in.");
        alert("Please log in first!");
        navigate('/login');
        return;
      }

      try {
        // Send to backend with user_id and access_token
        await axios.post(`${API_BASE}/api/save-questionnaire`, {
          answers: finalAnswers,
          user_id: userId,
          access_token: accessToken
        });

        localStorage.setItem("readingbuddy_profile", JSON.stringify(finalAnswers));

        console.log("✅ Skipped questionnaire sent to backend.");
      } catch (err) {
        console.error("❌ Failed to send skipped questionnaire:", err);
      }

      // Mark questionnaire as completed in localStorage to persist state
      localStorage.setItem('questionnaire_completed', 'true');
      setShowThankYou(true);
      // Don't auto-redirect - let user click button to proceed
      return;
    }
  };


  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      const prevQuestionId = questions[prevStep].id;
      const prevAnswer = answers[prevQuestionId];
      setSelectedOption(prevAnswer || '');
      setStep(prevStep);
    } else {
      setRole(null); // Go back to role selection
      setSelectedOption('');
    }
  };

  return (
    <div className="role-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#" onClick={(e) => e.preventDefault()}>About</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
        </nav>
      </header>

    <main className="questionnaire-main">
        {showThankYou ? (
            <div className="thankyou-content">
            <h1>Thank you for your time!</h1>
            <p>Your answers are of great help in your child’s learning journey.</p>
            <button className="start-btn" onClick={() => navigate('/reading')}> {/* Changed to reading page since welcome page felt redundant */}
              Let’s get started!
            </button>
            <img src={buddCheer} alt="Budd Cheer" className="thankyou-bot" />
            <img src={honeyThumbs} alt="Honey Thumbs" className="thankyou-bear" />
            </div>
        ) : !role ? (
          <>
            <h1>Before we start, we’d like to learn more about you!</h1>
            <h1>Are you a:</h1>
            <div className="button-group">
              <button className="role-btn" onClick={() => handleRoleSelect('Parent')}>Parent</button>
              <button className="role-btn" onClick={() => handleRoleSelect('Child')}>Child</button>
              <button className="role-btn" onClick={() => navigate('/TeacherHome')}>Teacher</button>
            </div>
          </>
        ) : (
          <>
            <div className="question">{questions[step].question}</div>
            <form className="checkbox-group">
              {questions[step].options.map((opt) => (
                <label key={opt} className="checkbox-label">
                  <input
                    type="radio"
                    name={`question-${step}`}
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={() => selectOption(opt)}
                  />
                  {opt}
                </label>
              ))}
            </form>

            <div className="nav-buttons">
                <div className="nav-left">
                    <button className="nav-btn back-btn" onClick={handleBack}>⬅ Back</button>
                </div>
                <div className="nav-right">
                    {['reading_challenges', 'reading_difficulties'].includes(questions[step].id) && (
                    <button className="nav-btn skip-btn" onClick={handleSkip}>Skip ➡</button>
                    )}
                    <button className="nav-btn next-btn" onClick={handleNext} disabled={!selectedOption}>
                    Next
                    </button>
                </div>
            </div>
          </>
        )}
        {!role && (
        <img src={buddFace} alt="Budd Face" className="budd-face" />
        )}
      </main>
    </div>
  );
};

export default Questionnaire;