import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file

const ExtractedText: React.FC = () => {
  const { text } = useReadingContext();
  const [loading, setLoading] = useState(false);
  
  // for text highlighting
  const [highlights, setHighlights] = useState<{ start: number; end: number; text: string }[]>([]);

  // for vocab searching
  const [vocabMode, setVocabMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");

  const handleTextClick = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) return;

    if (vocabMode) {
      if (selectedText.split(" ").length > 1) {
        alert("Please select only one word.");
        return;
      }
      setSelectedWord(selectedText);
    } else {
      // highlighting logic from before (unchanged)
      const range = selection!.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(document.querySelector(".storybook-text")!);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      const end = start + selectedText.length;

      if (!highlights.some(h => h.start === start && h.end === end)) {
        setHighlights(prev => [...prev, { start, end, text: selectedText }]);
      }
    }

    selection?.removeAllRanges();
  };

  const fetchDefinition = async () => {
    if (!selectedWord) return;

    const response = await fetch("http://localhost:5000/api/define", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: selectedWord }),
    });
    const data = await response.json();
    setDefinition(data.definition || "No definition found.");
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


      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <button onClick={handleReadAloud} className="secondary">
          {loading ? "Loading..." : "Read Aloud"}
        </button>
        <button onClick={() => setHighlights([])} className="secondary">Clear Highlights</button>
        <button onClick={() => { setVocabMode(true); setSelectedWord(""); setDefinition(""); }} className="secondary">
          📘 Vocab
        </button>
        <button
          onClick={fetchDefinition}
          className="secondary"
          disabled={!vocabMode || !selectedWord}
          style={{ opacity: !selectedWord ? 0.5 : 1 }}
        >
          🔍 Search Definition
        </button>
      </div>
      {selectedWord && definition && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f1f5f9", borderRadius: "0.5rem" }}>
          <strong>Definition of <em>{selectedWord}</em>:</strong>
          <p>{definition}</p>
        </div>
      )}



      {/* Buttons: Read Aloud + Clear Highlights */}
      
    </div>
  ) : null;

};

export default ExtractedText;
