import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("readingbuddy_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  if (!profile) {
    return <div style={{ padding: "2rem" }}>No profile yet – please fill in the questionnaire!</div>;
  }

  const renderField = (label: string, value: string[] | string) => (
    <div style={{ marginBottom: "1rem" }}>
      <strong>{label}:</strong>{" "}
      {Array.isArray(value) ? (
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          {value.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>👤 User Profile</h1>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📝 Questionnaire Info</h2>

      {renderField("Role", profile.role)}
      {renderField("Reading Style", profile.reading_style)}
      {renderField("Reading Time", profile.reading_time)}
      {renderField("Reading Supports", profile.reading_supports)}
      {renderField("Reading Challenges", profile.reading_challenges)}
    </div>
  );
}
