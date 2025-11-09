import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsentForm.css';
import logo from '../assets/logo.png';

const ConsentForm: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (consentGiven) {
      navigate('/questionnaire');
    }
  };

  return (
    <div className="consent-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="ReadingBudd Logo" className="logo-img" />
        </div>
        <nav>
          <button onClick={() => {}}>About</button>
          <button onClick={() => {}}>Contact</button>
        </nav>
      </header>

      <main className="consent-main">
        <h1>We need your consent!</h1>
        <p>Please read the text below carefully.</p>

        <div className="consent-text">
          <h3>Why we ask for your consent</h3>
          <p>
            We collect eye movements, voice, and app usage to improve learning. This is done under CPPA (Bill C-27) rules to protect your information. We won't share your personal details.
          </p>

          <h3>Your Rights</h3>
          <p>
            You and your guardian can see, change, or delete your data. We’ll remove identifying information.
          </p>

          <h3>Benefits</h3>
          <p>
            ReadingBudd.ai provides a supportive learning environment, helping children gain confidence and improve reading at their own pace.
          </p>
        </div>

        <label className="consent-checkbox">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          I understand and agree to use ReadingBudd.ai.
        </label>

        <button
          className="consent-btn"
          onClick={handleContinue}
          disabled={!consentGiven}
        >
          Continue
        </button>
      </main>
    </div>
  );
};

export default ConsentForm;