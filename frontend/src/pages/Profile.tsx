import { useEffect, useState } from "react";
import "./Profile.css";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate(); // ✅ this line is missing in your code


  useEffect(() => {
    const saved = localStorage.getItem("readingbuddy_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  if (!profile) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card empty">
          <p style={{ fontSize: "0.9rem" }}>
            No profile yet – please fill in the questionnaire!
          </p>
        </div>
      </div>
    );
  }

  const renderField = (
    label: string,
    value: string[] | string,
    isLast: boolean = false
  ) => (
    <div
      className="profile-field"
      style={{ marginBottom: isLast ? "0.5" : "2rem" }}
    >
      <div className="bubble-label" style={{ fontSize: "0.95rem", marginBottom: "0.2rem" }}>
        {label}
      </div>
      <div className="bubble-value" style={{ fontSize: "0.95rem" }}>
        {Array.isArray(value) ? (
          <ul className="bubble-list" style={{ marginTop: "0.25rem", paddingLeft: "1.25rem" }}>
            {value.map((v, i) => (
              <li key={i} style={{ marginBottom: "0.2rem" }}>{v}</li>
            ))}
          </ul>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );

  return (
  <div>
    <header className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>
      <nav>
        <Link to={'/reading'} className="nav-link">Read</Link>
        <Link to={'/home'} className="nav-link">Dashboard</Link>
        <Link to={'/avatar'} className="nav-link">Customize Avatar</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button> 
      </nav>
    </header>

    <div className="profile-wrapper">
      <div className="profile-card colorful" style={{ padding: "1.8rem" }}>
        <h1 className="profile-title" style={{ fontSize: "1.7rem", marginBottom: "0.6rem" }}>
          Your Reading Profile
        </h1>
        <p className="profile-subtitle" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
          Here’s what we learned from your questionnaire:
        </p>

        {renderField("Role", profile.role)}
        {renderField("Reading Style", profile.reading_style)}
        {renderField("Reading Time", profile.reading_time)}
        {renderField("Reading Supports", profile.reading_supports)}
        {renderField("Reading Challenges", profile.reading_challenges, true)}
      </div>
    </div>
  </div>
);

}