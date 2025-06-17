import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();
  const [loading, setLoading] = useState(false);

  const handleReadAloud = async () => {
    if (!text) return;

    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const audio = new Audio('http://localhost:5000/api/tts/file');
      audio.play();
    } catch (err) {
      console.error('TTS failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    text ? (
      <div className="card">
        <h2>Extracted Text</h2>
        <div className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]">{text.slice(0, 1000)}...</div>
        <button onClick={handleReadAloud} className="secondary" style={{ marginTop: "1rem" }}>
          {loading ? "Loading..." : "Read Aloud"}
        </button>
      </div>
    ) : null
  );
};

export default ExtractedText;
