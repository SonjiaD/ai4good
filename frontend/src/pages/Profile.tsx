import { useEffect, useState } from "react";
import "./Profile.css";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');

      console.log("🔑 Fetching profile for user_id:", userId);

      if (!userId) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      try {
        // Fetch profile from backend/database with access token
        const response = await axios.get(`${API_BASE}/api/profile?user_id=${userId}&access_token=${accessToken}`);

        console.log("✅ Profile loaded from database:", response.data);
        console.log("🔍 Checking response.data.id:", response.data?.id);
        console.log("🔍 Checking response.data.role:", response.data?.role);

        // Check if we got any data back (not just empty questionnaire object)
        if (response.data && response.data.id) {
          console.log("✅ Profile exists in database, extracting fields...");

          // Helper function to parse array fields that might be strings or actual arrays
          const parseArrayField = (field: any) => {
            if (!field) return [];
            if (Array.isArray(field)) {
              // Filter out empty strings
              const filtered = field.filter((item: any) => item !== '' && item !== null && item !== undefined);
              return filtered.length > 0 ? filtered : [];
            }
            if (typeof field === 'string') {
              // Handle empty string or literal "[]"
              if (field === '' || field === '[]') return [];
              try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                  const filtered = parsed.filter((item: any) => item !== '' && item !== null && item !== undefined);
                  return filtered.length > 0 ? filtered : [];
                }
                return [];
              } catch {
                // If parsing fails, treat as single value (unless empty)
                return [field];
              }
            }
            return [];
          };

          // Extract the fields we need from the flat structure
          const profileData = {
            role: response.data.role,
            reading_style: parseArrayField(response.data.reading_style),
            reading_time: parseArrayField(response.data.reading_time),
            reading_supports: parseArrayField(response.data.reading_supports),
            reading_challenges: parseArrayField(response.data.reading_challenges)
          };
          console.log("📦 Profile data extracted:", profileData);
          setProfile(profileData);
        } else {
          console.log("❌ No profile found - response.data.id is missing");
        }
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card empty">
          <p style={{ fontSize: "0.9rem" }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <header className="navbar">
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
          <nav>
            <Link to={'/home'} className="nav-link">Dashboard</Link>
            <Link to={'/reading'} className="nav-link">Read</Link>
            <Link to={'/avatar'} className="nav-link">Customize</Link>
            <Link to={'/outfit-shop'} className="nav-link">Shop</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button className="logout-nav-btn" onClick={() => navigate('/LoginSignup')}>Log Out</button>
          </nav>
        </header>
        
        <div className="profile-wrapper">
          <div className="profile-card empty">
            <p style={{ fontSize: "0.9rem" }}>
              No profile yet – please fill in the questionnaire!
            </p>
            <button 
              onClick={() => navigate('/questionnaire')} 
              style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
            >
              Go to Questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderField = (
    label: string,
    value: string[] | string,
    isLast: boolean = false
  ) => {
    // Handle empty or null values
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return (
        <div
          className="profile-field"
          style={{ marginBottom: isLast ? "0.5rem" : "2rem" }}
        >
          <div className="bubble-label" style={{ fontSize: "0.95rem", marginBottom: "0.2rem" }}>
            {label}
          </div>
          <div className="bubble-value" style={{ fontSize: "0.95rem", color: "#999" }}>
            <span>Not specified</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="profile-field"
        style={{ marginBottom: isLast ? "0.5rem" : "2rem" }}
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
  };

  return (
    <div>
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav>
          <Link to={'/home'} className="nav-link">Dashboard</Link>
          <Link to={'/reading'} className="nav-link">Read</Link>
          <Link to={'/avatar'} className="nav-link">Customize</Link>
          <Link to={'/outfit-shop'} className="nav-link">Shop</Link>
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
            Here's what we learned from your questionnaire:
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