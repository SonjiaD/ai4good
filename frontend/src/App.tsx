import { useState } from 'react';

function App() {
  const [msg, setMsg] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    const res = await fetch("http://localhost:5000/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>React + Flask Example</h1>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} />
      <br />
      <button onClick={handleSend}>Send to Flask</button>
      <p><strong>Flask says:</strong> {response}</p>
    </div>
  );
}

export default App;
