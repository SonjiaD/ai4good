import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleReadAloud = async () => {
    if (!text) return;

    try {
      setLoading(true);
      setAudioUrl(null); // Reset previous audio

      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `http://localhost:5000${data.audio_url}?nocache=${Date.now()}`;

        // Preload audio fully to avoid broken player
        const audio = new Audio(fullUrl);
        audio.addEventListener('loadedmetadata', () => {
          setAudioUrl(fullUrl);
        });

        // Start preloading immediately
        audio.load();
      }
    } catch (err) {
      console.error('TTS failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    text ? (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
        <div className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]">
          {text.slice(0, 800)}...
        </div>
        <button
          onClick={handleReadAloud}
          className="btn-secondary mt-4"
          disabled={loading}
        >
          {loading ? "Loading..." : "Read Aloud"}
        </button>

        {audioUrl && (
          <audio controls className="mt-2">
            <source src={audioUrl} type="audio/wav" />
          </audio>
        )}
      </div>
    ) : null
  );
};

export default ExtractedText;
