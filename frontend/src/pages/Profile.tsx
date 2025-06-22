import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

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
          <p>No profile yet – please fill in the questionnaire!</p>
        </div>
      </div>
    );
  }

  const renderField = (label: string, value: string[] | string) => (
    <div className="profile-field">
      <div className="bubble-label">{label}</div>
      <div className="bubble-value">
        {Array.isArray(value) ? (
          <ul className="bubble-list">
            {value.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-card colorful">
        <h1 className="profile-title">👤 Your Reading Profile </h1>
        <p className="profile-subtitle">Here’s what we learned from your questionnaire:</p>

        {renderField("Role", profile.role)}
        {renderField("Reading Style", profile.reading_style)}
        {renderField("Reading Time", profile.reading_time)}
        {renderField("Reading Supports", profile.reading_supports)}
        {renderField("Reading Challenges", profile.reading_challenges)}
      </div>
    </div>
  );
}
