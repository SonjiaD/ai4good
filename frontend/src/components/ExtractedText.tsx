import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file
import GettingStartedGuide from "./GettingStartedGuide";
import "../styles/buttons.css";
import VocabToggle from "./VocabToggle";
import PDFUploader from "./PDFUploader";

const ExtractedText: React.FC = () => {
  const { text, title, paragraphs } = useReadingContext();
  const [loading, setLoading] = useState(false);
  
  // for text highlighting
  const [highlights, setHighlights] = useState<{ start: number; end: number; text: string }[]>([]);

  // for vocab searching
  const [vocabMode, setVocabMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");

  //for reading aloud definition
  const [definitionLoading, setDefinitionLoading] = useState(false);

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

  const getHighlightedText = (
    text: string,
    highlightsArg?: { start: number; end: number; text: string }[]
  ) => {
    const hl = highlightsArg || highlights;
    if (!text) return null;

    const sorted = [...hl].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    for (const h of sorted) {
      if (h.start > currentIndex) {
        parts.push(text.slice(currentIndex, h.start));
      }

      // Yellow highlight
      parts.push(
        <mark key={`hl-${h.start}`} className="yellow-highlight">
          {text.slice(h.start, h.end)}
        </mark>
      );

      currentIndex = h.end;
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    // If vocabMode is active and selectedWord exists, also wrap it
    if (vocabMode && selectedWord) {
      return (
        <>
          {parts.map((part, i) => {
            if (typeof part === "string") {
              const regex = new RegExp(`\\b(${selectedWord})\\b`, "gi");
              const splitParts = part.split(regex);
              return splitParts.map((sub, j) =>
                sub.toLowerCase() === selectedWord.toLowerCase() ? (
                  <span key={`${i}-${j}`} className="blue-highlight">
                    {sub}
                  </span>
                ) : (
                  sub
                )
              );
            }
            return part;
          })}
        </>
      );
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
      // audio.play();
    } catch (err) {
      console.error("Error reading aloud:", err);
    } finally {
      setLoading(false);
    }
  };

  //reading aloud definition function
  const handleDefinitionReadAloud = async () => {
    if (!definition) return;
    setDefinitionLoading(true);
    try {
      await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: definition }),
    });
      const audio = new Audio("http://localhost:5000/api/tts/file");
      // audio.play();
    } catch (err) {
      console.error("Error reading definition aloud:", err);
    } finally {
      setDefinitionLoading(false);
    }
  }

  return text ? (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {title && (
          <h3 className="text-xl font-bold mb-0" style={{ margin: 0 }}>
            {title}
          </h3>
        )}
        <VocabToggle enabled={vocabMode} onChange={setVocabMode} />
      </div>

      {/* ---------- Story paragraphs with accurate highlights ---------- */}
      <div
        className="storybook-text p-4 bg-slate-50 rounded-lg min-h-[200px]"
        onMouseUp={handleTextClick}
      >
        {(() => {
          const blocks = [text.replace(title, "").trim()];
          let runningOffset = 0;

          return blocks.map((block, i) => {
            const blockStart = runningOffset;
            const blockEnd = blockStart + block.length;

            const localHls = highlights
              .filter(h => h.start >= blockStart && h.end <= blockEnd)
              .map(h => ({
                ...h,
                start: h.start - blockStart,
                end: h.end - blockStart,
              }));

            runningOffset = blockEnd + 1;

            return (
              <p key={i} className="mb-4">
                {getHighlightedText(block, localHls)}
              </p>
            );
          });
        })()}
      </div>

      {/* ---------- action bar ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginTop: "1.25rem",
        }}
      >
        <button
          className="rb-btn rb-btn--accent"
          disabled={!vocabMode || !selectedWord}
          onClick={fetchDefinition}
        >
          🔍 Search Definition
        </button>

        <button
          className="rb-btn rb-btn--primary"
          onClick={handleReadAloud}
          disabled={loading}
        >
          {loading ? "Loading..." : "▶ Read Aloud"}
        </button>

        <button
          className="rb-btn rb-btn--secondary"
          style={{ gridColumn: "span 2" }}
          onClick={() => setHighlights([])}
        >
          ✖︎ Clear Highlights
        </button>
      </div>

      {/* definition display section */}

      {selectedWord && definition && (
        <aside
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            background: "#f1f8ff",
            borderLeft: "4px solid #2196f3",
            borderRadius: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "0.5rem",
            }}
          >
            <strong style={{ fontSize: "1.1rem" }}>
              Definition of <em>{selectedWord}</em>:
            </strong>

            <button
              onClick={handleDefinitionReadAloud}
              disabled={definitionLoading}
              style={{
                backgroundColor: "#4BDE81",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.9rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {definitionLoading ? "🔊..." : "▶ Read Aloud"}
            </button>
          </div>

          <p style={{ marginTop: "0.5rem", lineHeight: "1.6" }}>{definition}</p>
        </aside>
      )}



    </>
  ) : (
    <div style={{ padding: "2rem" }}>
      <GettingStartedGuide />
    </div>
  );


};

export default ExtractedText;
