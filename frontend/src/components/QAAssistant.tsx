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

  //whisper recording function
  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        const res = await fetch('http://localhost:5000/api/transcribe-audio', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        setQuestion(data.transcription);  // update question field with transcribed audio
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 5000);  // record 5 seconds
    } catch (err) {
      console.error("Mic access denied or failed", err);
      alert("Please allow microphone access to use this feature.");
    }
  };

  //matcha-tts 
  const handleAnswerReadAloud = async () => {
    if (!answer) return;

    try {
      const response = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });

      const data = await response.json();
      const audio = new Audio("http://localhost:5000/audio/" + data.filename);
      audio.play();
    } catch (err) {
      console.error("Error reading answer aloud:", err);
    }
  }

return (
  <div className="qa-box">
    <div className="qa-input-section">
      <input
        className="qa-input"
        placeholder="Ask a question about the text..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button className="qa-button" onClick={handleAsk} disabled={loading}>
        {loading ? '...' : '▶'}
      </button>
      <button className="secondary" onClick={handleRecord}>🎙️</button>
    </div>

    {answer && (
      <div className="qa-answer">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <strong style={{ fontSize: "1.1rem" }}>Answer:</strong>

          <button
            onClick={handleAnswerReadAloud}
            style={{
              backgroundColor: "#22c55e",  // same green
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ▶ Read Aloud
          </button>
        </div>
        <p>{answer}</p>
      </div>
    )}
  </div>
);
};

export default QAAssistant;
