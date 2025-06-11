import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import buddFace from '../assets/budd-face.png';
import logo from '../assets/logo.png';
import honeyThumbs from '../assets/honey-thumbs.png';
import buddCheer from '../assets/budd-cheer.png';
import './Questionnaire.css';
import { parentQuestions } from '../data/parentQuestions';
import { childQuestions } from '../data/childQuestions';

type Role = 'Parent' | 'Child' | null;
type AnswerMap = Record<string, string[] | string>;

const Questionnaire: React.FC = () => {
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const navigate = useNavigate();

  const questions = role === 'Parent' ? parentQuestions : childQuestions;

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(0);
    setSelectedOptions([]);
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleNext = () => {
    const questionId = questions[step].id;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOptions }));
    setSelectedOptions([]);

    if (step < questions.length - 1) {
        setStep(step + 1);
    } else {
        //Logging to console for now, can be replaced later by sending to backend or saving profile
        console.log("✅ Final Answers:", { role, ...answers, [questionId]: selectedOptions });
        //Add logic to save profile or redirect ?
        //For now just show thank you message
        setShowThankYou(true);
    }
  };

  const handleSkip = () => {
    const questionId = questions[step].id;
    setAnswers((prev) => ({ ...prev, [questionId]: 'skipped' }));
    setSelectedOptions([]);
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
    else {
        console.log("✅ Final Answers:", { role, ...answers, [questionId]: 'skipped' });
        setShowThankYou(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      const prevQuestionId = questions[prevStep].id;
      const prevAnswer = answers[prevQuestionId];
      setSelectedOptions(Array.isArray(prevAnswer) ? prevAnswer : []);
      setStep(prevStep);
    } else {
      setRole(null); // Go back to role selection
      setSelectedOptions([]);
    }
  };

  return (
    <div className="role-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <button className="signup-btn">Sign Up</button>
        </nav>
      </header>

    <main className="main-section">
        {showThankYou ? (
            <div className="thankyou-content">
            <h1>Thank you for your time!</h1>
            <p>Your answers are of great help in your child’s learning journey.</p>
            <button className="start-btn" onClick={() => navigate('/welcome')}>
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
            </div>
          </>
        ) : (
          <>
            <div className="question">{questions[step].question}</div>
            <form className="checkbox-group">
              {questions[step].options.map((opt) => (
                <label key={opt} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={selectedOptions.includes(opt)}
                    onChange={() => toggleOption(opt)}
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
                    <button className="nav-btn next-btn" onClick={handleNext} disabled={selectedOptions.length === 0}>
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