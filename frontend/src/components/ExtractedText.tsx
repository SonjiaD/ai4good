import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<{ start: number; end: number; text: string }[]>([]);

  const handleTextClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim()) return;

    // Get position of selected text inside the full text string
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(document.querySelector(".storybook-text")!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    // Add to highlights if not already in
    if (!highlights.some(h => h.start === start && h.end === end)) {
      setHighlights(prev => [...prev, { start, end, text: selectedText }]);
    }

    selection.removeAllRanges();
  };


  const getHighlightedText = (text: string) => {
    if (!text) return null;

    // Sort highlights by position
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    for (const h of sorted) {
      if (h.start > currentIndex) {
        parts.push(text.slice(currentIndex, h.start));
      }
      parts.push(<mark key={h.start}>{text.slice(h.start, h.end)}</mark>);
      currentIndex = h.end;
    }

    // Add the rest of the text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    return <div>{parts}</div>;
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

      {/* Story text box with highlighting */}
      <div
        className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]"
        onMouseUp={handleTextClick}
      >
        {getHighlightedText(text.slice(0, 1000))}
      </div>

      {/* Buttons: Read Aloud + Clear Highlights */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button onClick={handleReadAloud} className="secondary">
          {loading ? "Loading..." : "Read Aloud"}
        </button>

        <button onClick={() => setHighlights([])} className="secondary">
          Clear Highlights
        </button>
      </div>
    </div>
  ) : null;

};

export default ExtractedText;
