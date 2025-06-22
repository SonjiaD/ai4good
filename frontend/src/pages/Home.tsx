import React from 'react';
import './Home.css';
import badge1 from '../assets/star-reader.png'; 
import badge2 from '../assets/storyteller.png';
import badge3 from '../assets/explorer.png';
import badge4 from '../assets/quiz-whiz.png';
import logo from '../assets/logo.png'; 
import coins from '../assets/coins.png';
import treehouseImg from '../assets/treehouse.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <Link to={'/reading'} className="nav-link">{'Read'}</Link>
          <Link to={'/outfit-shop'} className="nav-link">{'Outfit Shop'}</Link>
          <Link to={'/avatar'} className="nav-link">{'Customize Avatar'}</Link>
          <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button> 
        </nav>
      </header>

      <main className="homepage-main">
        <h1>Welcome back, Lily!</h1>

        <section className="reading-section">
          <h2>Currently Reading</h2>
          <div className="current-book">
            <div className="book-text">
              <h3>The Magical Treehouse</h3>
              <p>Chapter 3: The Secret of the Forest</p>
              <p>Continue your journey with Alex and Mia as they explore the enchanted forest.</p>
              <button className="continue-btn" onClick={() => navigate('/Reading')}>Continue Reading</button>
            </div>
            <img src={treehouseImg} alt="Treehouse" className="book-img" />
          </div>
        </section>

      <section className="progress-section">
        <h2>Reading Progress</h2>
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: '60%' }}></div>
        </div>
        <span className="progress-percent">60%</span>

        <div className="reading-stats">
          <div className="time-this-week">
            <p>Reading Time This Week</p>
            <div className="bar-chart">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                <div className="day-bar" key={day}>
                  <div className="bar"></div>
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reading-challenge">
            <p>Daily Reading Challenge</p>
            <div className="challenge-box">
              <p>📖 Read for 10 minutes and get 50 coins!</p>
              <div className="challenge-progress">
                <div className="progress-bar purple" style={{ width: '70%' }}></div>
                <span className="challenge-text">7/10</span>
                <img src={coins} alt="coin" className="coin" />
              </div>
              <div className="bot-reaction">
                <div className="speech-bubble">You got this!</div>
                {/*<img src={botThumbsUp} alt="Bot" className="bot-thumbs" />*/}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="achievements-section">
        <h2>Recent Achievements</h2>
        <div className="badges">
          <div className="badge-card">
            <img src={badge1} alt="Star Reader" />
            <h4>Star Reader Award</h4>
            <p>Completed 5 chapters!</p>
          </div>
          <div className="badge-card">
            <img src={badge2} alt="Storyteller" />
            <h4>Storyteller Badge</h4>
            <p>Listened to an audiobook!</p>
          </div>
          <div className="badge-card">
            <img src={badge3} alt="Explorer" />
            <h4>Explorer Medal</h4>
            <p>Discovered a new genre!</p>
          </div>
          <div className="badge-card">
            <img src={badge4} alt="Quiz Whiz" />
            <h4>Quiz Whiz</h4>
            <p>Passed your first quiz!</p>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
};

export default Home;
