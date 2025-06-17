import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QAAssistant: React.FC = () => {
  const { text } = useReadingContext();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question || !text) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/qa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRecord = async () => {
    const recordResponse = await fetch('http://localhost:5000/api/record', { method: 'POST' });
    const recordData = await recordResponse.json();
    setQuestion(recordData.transcription);
  };

  return (
    <div className="card">
      <h2>Q&A Assistant</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} className="form-input-custom" placeholder="Ask a question..." />
        <button className="primary" onClick={handleAsk} disabled={loading}>
          {loading ? "Asking..." : "Ask"}
        </button>
        <button className="secondary" onClick={handleRecord}>🎙️</button>
      </div>

      {answer && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f1f5f9", borderRadius: "0.75rem" }}>
          <b>Answer:</b> {answer}
        </div>
      )}
    </div>
  );
};

export default QAAssistant;
