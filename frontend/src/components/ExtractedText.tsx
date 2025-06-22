import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file
import GettingStartedGuide from "./GettingStartedGuide";

const ExtractedText: React.FC = () => {
  const { text, title, paragraphs } = useReadingContext();
  const [loading, setLoading] = useState(false);
  
  // for text highlighting
  const [highlights, setHighlights] = useState<{ start: number; end: number; text: string }[]>([]);

  // for vocab searching
  const [vocabMode, setVocabMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");

  const handleTextClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const container = document.querySelector(".storybook-text");

    if (!container) return;

    const preCaretRange = document.createRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    // Use rendered DOM text to calculate offsets
    const fullRenderedText = preCaretRange.toString();
    const start = fullRenderedText.length;
    const end = start + selectedText.length;

    if (vocabMode) {
      if (selectedText.split(" ").length > 1) {
        alert("Please select only one word.");
        return;
      }
      setSelectedWord(selectedText);
    } else {
      if (!highlights.some(h => h.start === start && h.end === end)) {
        setHighlights(prev => [...prev, { start, end, text: selectedText }]);
      }
    }

    selection.removeAllRanges();
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



  const getHighlightedText = (text: string, highlightsArg?: { start: number; end: number; text: string }[]) => {
    const hl = highlightsArg || highlights;
    if (!text) return null;

    const sorted = [...hl].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    for (const h of sorted) {
      if (h.start > currentIndex) {
        parts.push(text.slice(currentIndex, h.start));
      }
      parts.push(<mark key={h.start}>{text.slice(h.start, h.end)}</mark>);
      currentIndex = h.end;
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    return <>{parts}</>;
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
    // <div className="card">
    <div>
      {/* <h2>Extracted Text</h2> */}

      {/* Story text box with highlighting */}
      {/* <div
        className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]"
        onMouseUp={handleTextClick}
      >
        {getHighlightedText(text.slice(0, 1000))}
      </div> */}

      {title && (
        <h2 className="text-xl font-bold mb-4">{title}</h2>
      )}

      {/* ---------- Story paragraphs with accurate highlights ---------- */}
      <div
        className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]"
        onMouseUp={handleTextClick}
      >
        {(() => {
          // removes the title from the text, as it's already rendered separately
          const blocks = [text.replace(title, "").trim()];
          
          // running character offset inside the FULL rendered text
          let runningOffset = 0;

          return blocks.map((block, i) => {
            const blockStart = runningOffset;
            const blockEnd   = blockStart + block.length;

            // highlights that live inside this paragraph
            const localHls = highlights
              .filter(h => h.start >= blockStart && h.end <= blockEnd)
              .map(h => ({
                ...h,
                start: h.start - blockStart,
                end:   h.end   - blockStart
              }));

            // advance offset (+1 for the implicit newline the browser puts after <p>)
            runningOffset = blockEnd + 1;

            return (
              <p key={i} className="mb-4">
                {getHighlightedText(block, localHls)}
              </p>
            );
          });
        })()}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <button onClick={handleReadAloud} className="secondary" style={{ width: "100%" }}>
            {loading ? "Loading..." : "Read Aloud"}
          </button>
        </div>

        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <button onClick={() => setHighlights([])} className="secondary" style={{ width: "100%" }}>
            Clear Highlights
          </button>
        </div>

        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <button
            onClick={() => {
              setVocabMode(true);
              setSelectedWord("");
              setDefinition("");
            }}
            className="secondary"
            style={{ width: "100%" }}
          >
            📘 Vocab
          </button>
        </div>

        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <button
            onClick={fetchDefinition}
            className="secondary"
            disabled={!vocabMode || !selectedWord}
            style={{ width: "100%", opacity: !selectedWord ? 0.5 : 1 }}
          >
            🔍 Search Definition
          </button>
        </div>
      </div>
      {selectedWord && definition && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f1f5f9", borderRadius: "0.5rem" }}>
          <strong>Definition of <em>{selectedWord}</em>:</strong>
          <p>{definition}</p>
        </div>
      )}


 
      {/* Buttons: Read Aloud + Clear Highlights */}
      
    </div>
  ) : (
    <div style={{ padding: "2rem" }}>
      <GettingStartedGuide />
    </div>
  );

};

export default ExtractedText;
