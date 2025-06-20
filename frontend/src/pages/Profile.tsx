import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // read it once when the component mounts
    const saved = localStorage.getItem("readingbuddy_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  if (!profile) {
    return <div style={{padding:"2rem"}}>No profile yet – please fill in the questionnaire!</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>User Profile</h1>

      <h2>📝 Questionnaire Info</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
