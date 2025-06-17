// /src/components/ExtractedText.tsx

import React from 'react';
import { useReadingContext } from '../context/ReadingContext';

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();

  return (
    text ? (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
        <div className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]">
          {text.slice(0, 800)}...
        </div>
      </div>
    ) : null
  );
};

export default ExtractedText;

// before adding matcha-tts/whisper asr
