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


  // return (
  //   <div>
  //     {/* <h2>Q&A Assistant</h2> */}
  //     <div style={{ display: "flex", gap: "1rem" }}>
  //       <input value={question} onChange={e => setQuestion(e.target.value)} className="form-input-custom" placeholder="Ask a question..." />
  //       <button className="primary" onClick={handleAsk} disabled={loading}>
  //         {loading ? "Asking..." : "Ask"}
  //       </button>
  //       <button className="secondary" onClick={handleRecord}>🎙️</button>
  //     </div>

  //     {answer && (
  //       <div style={{ marginTop: "1rem", padding: "1rem", background: "#f1f5f9", borderRadius: "0.75rem" }}>
  //         <b>Answer:</b> {answer}
  //       </div>
  //     )}
  //   </div>
  // );
// };

// take this style and use it in the test your understanding section

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
        <p>{answer}</p>
      </div>
    )}
  </div>
);


};


export default QAAssistant;
