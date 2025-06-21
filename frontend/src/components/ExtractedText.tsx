import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);

  const handleTextClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString();
      if (!highlights.includes(selectedText)) {
        setHighlights(prev => [...prev, selectedText]);
      }
    }
  };

  const getHighlightedText = (text: string) => {
    if (!text) return null;

    let modified = text;
    highlights.forEach((phrase) => {
      const safePhrase = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape regex chars
      const regex = new RegExp(`(${safePhrase})`, 'g');
      modified = modified.replace(regex, '<mark>$1</mark>');
    });

    return <div dangerouslySetInnerHTML={{ __html: modified }} />;
  };

  const handleReadAloud = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const clarifyResponse = await fetch("http://localhost:5000/api/clarify-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { text: clarifiedText } = await clarifyResponse.json();

      await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clarifiedText }),
      });

      const audio = new Audio("http://localhost:5000/api/tts/file");
      audio.play();
    } catch (err) {
      console.error("Error reading aloud:", err);
    } finally {
      setLoading(false);
    }
  };

  return text ? (
    <div className="card">
      <h2>Extracted Text</h2>
      <div className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]" onMouseUp={handleTextClick}>
        {getHighlightedText(text.slice(0, 1000))}
      </div>
      <button onClick={handleReadAloud} className="secondary" style={{ marginTop: "1rem" }}>
        {loading ? "Loading..." : "Read Aloud"}
      </button>
    </div>
  ) : null;
};

export default ExtractedText;
