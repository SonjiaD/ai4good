import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useReadingContext } from '../context/ReadingContext';
import './Highlight.css';  // New: separate CSS file
import GettingStartedGuide from "./GettingStartedGuide";
import "../styles/buttons.css";
import VocabToggle from "./VocabToggle";
import PDFUploader from "./PDFUploader";
import ImageGenerator from "../pages/ImageGenerator";
import {
  startStoryImageJob,
  getStoryImageJob,
  type StoryImage,
  type StoryJobStatus,
} from "../api/images";

const ExtractedText: React.FC = () => {
  const { text, title, paragraphs, file } = useReadingContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  // for text highlighting
  const [highlights, setHighlights] = useState<{ start: number; end: number; text: string }[]>([]);

  // for vocab searching
  const [vocabMode, setVocabMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");

  //for reading aloud definition
  const [definitionLoading, setDefinitionLoading] = useState(false);

// --- image generation state ---
  const [images, setImages] = useState<StoryImage[]>([]);
  const [imgJobId, setImgJobId] = useState<string | null>(null);
  const [imgJobStatus, setImgJobStatus] = useState<StoryJobStatus | null>(null);
  const [imgProgress, setImgProgress] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

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

  // illustrate click handler
  const handleIllustrate = async () => {
    if (!file) {
      alert("Please upload a story PDF first.");
      return;
    }

    setImgError(null);
    setImgLoading(true);
    setImages([]);
    setImgJobId(null);
    setImgJobStatus(null);
    setImgProgress([]);

    try {
      // tweak max_pages/size here - for now 5 (likely 3 for demo)
      const start = await startStoryImageJob(file, {
        max_pages: 5,
        size: "1024x1024",
      });

      setImgJobId(start.job_id);
      setImgJobStatus(start.status);
      if ((start as any).progress) {
        setImgProgress((start as any).progress);
      }
    } catch (e: any) {
      console.error("Error starting illustration job:", e);
      setImgError(e?.message ?? "Could not start illustration job.");
      setImgLoading(false);
    }
  };

  useEffect(() => {
    if (!imgJobId) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const job = await getStoryImageJob(imgJobId);
        if (cancelled) return;

        setImgJobStatus(job.status);
        if (job.progress) {
          setImgProgress(job.progress);
        }

        if (job.status === "done" && job.result) {
          setImages(job.result.images ?? []);
          setImgLoading(false);
          clearInterval(interval);
        } else if (job.status === "error") {
          setImgError(job.error ?? "Illustration job failed.");
          setImgLoading(false);
          clearInterval(interval);
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error("Error polling illustration job:", e);
        setImgError(e?.message ?? "Error checking illustration job.");
        setImgLoading(false);
        clearInterval(interval);
      }
    }, 6000); // 6s, similar to /images page

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [imgJobId]);


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
          className="rb-btn rb-btn--primary"
          style={{ gridColumn: "span 2" }} // full width
          onClick={handleIllustrate}
          disabled={imgLoading || !file}
          // onClick={() => navigate("/images")}
        >
          🖍️ Illustrate Story PDF
        </button>
        <button
          className="rb-btn rb-btn--secondary"
          style={{ gridColumn: "span 2" }}
          onClick={() => setHighlights([])}
        >
          ✖︎ Clear Highlights
        </button>
        {/* <button
          className="rb-btn rb-btn--primary"
          onClick={() => navigate("/images")}
        >
          🖍️ Illustrate Story PDF
        </button> */}
      </div>
      {/* ---------- illustration status + results ---------- */}
      {(imgLoading || imgJobStatus === "running" || imgJobStatus === "queued") && (
        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#374151" }}>
          <strong>Generating your illustrations…</strong>
          <p style={{ margin: "0.25rem 0" }}>
            This can take a couple of minutes depending on story length.
          </p>
          {imgProgress.length > 0 && (
            <p style={{ margin: 0 }}>
              Latest update: {imgProgress[imgProgress.length - 1]}
            </p>
          )}
        </div>
      )}

      {imgError && (
        <div style={{ marginTop: "0.75rem", color: "#b00020", fontSize: "0.9rem" }}>
          {imgError}
        </div>
      )}

      {images.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.75rem" }}>Story Pictures</h4>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            }}
          >
            {images.map((img, idx) => (
              <figure key={idx} style={{ margin: 0 }}>
                <img
                  src={img.url}
                  alt={`Story page illustration ${img.page ?? idx + 1}`}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <figcaption
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  Page {img.page ?? idx + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}


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
