import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QuizSection: React.FC = () => {
  const { text } = useReadingContext();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!text) return;
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    setQuestions(data.questions);
    setAnswers(new Array(data.questions.length).fill(""));
    setFeedbacks(new Array(data.questions.length).fill(""));
    setLoading(false);
  };

  const submitAnswer = async (index: number) => {
    const response = await fetch('http://localhost:5000/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        question: questions[index],
        answer: answers[index]
      }),
    });
    const data = await response.json();
    const updatedFeedbacks = [...feedbacks];
    updatedFeedbacks[index] = data.feedback;
    setFeedbacks(updatedFeedbacks);
  };

  // const handleRecord = async (index: number) => {
  //   const res = await fetch('http://localhost:5000/api/record', { method: 'POST' });
  //   const data = await res.json();
  //   const updatedAnswers = [...answers];
  //   updatedAnswers[index] = data.transcription;
  //   setAnswers(updatedAnswers);
  // };

  const handleRecord = async (index: number) => {
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
        const updatedAnswers = [...answers];
        updatedAnswers[index] = data.transcription;
        setAnswers(updatedAnswers);
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 5000);
    } catch (err) {
      console.error("Mic access error", err);
      alert("Please allow mic access to record your answer.");
    }
  };


  const handleReadFeedback = async (index: number) => {
    if (!feedbacks[index]) return;

    try {
      // Step 1: Ask server to add clarity tags
      const clarifyRes = await fetch('http://localhost:5000/api/clarify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: feedbacks[index] }),
      });

      const clarifyData = await clarifyRes.json();
      let clarifiedText = clarifyData.text;

      // 🧼 Optional: Strip extra formatting like **!!word!!**
      clarifiedText = clarifiedText.replace(/\*+/g, '').replace(/!!/g, '!');

      console.log("Clarified Feedback Text:", clarifiedText);

      // Step 2: Send to TTS server
      const ttsRes = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clarifiedText }),
      });

      if (!ttsRes.ok) {
        throw new Error("TTS server error");
      }

      // Step 3: Play audio file (if using file playback)
      const audio = new Audio('http://localhost:5000/api/tts/file');
      audio.play();
    } catch (err) {
      console.error("Error reading feedback aloud:", err);
      alert("There was a problem generating the audio. Check the backend logs.");
    }
  };


  return (
    <div className="card quiz-section">
      <h2>Test Your Understanding</h2>
      {/* <button onClick={generateQuiz} className="primary mb-4" disabled={loading}>
        {loading ? "Generating..." : "Generate Quiz"}
      </button> */}

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={generateQuiz}
          className="primary"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      

      {questions.map((q, i) => (
        <div key={i} className="qa-box mt-6">           {/* outer wrapper */}
          <p className="font-medium">
            <b>Q{i + 1}:</b> {q}
          </p>

          {/* ✨ new unified input row */}
          <div className="qa-input-section">
            <input
              className="qa-input flex-grow"
              placeholder="Your answer…"
              value={answers[i]}
              onChange={(e) => {
                const newAns = [...answers];
                newAns[i] = e.target.value;
                setAnswers(newAns);
              }}
            />

            {/* same colour/shape as the Assistant’s ▶ button */}
            <button
              className="qa-button"
              onClick={() => submitAnswer(i)}
              disabled={loading}
            >
              {loading ? "…" : "Submit"}
            </button>

            {/* use the green mic style for consistency */}
            <button
              className="secondary"
              onClick={() => handleRecord(i)}
              aria-label="Record answer"
            >
              🎙️
            </button>
          </div>

          {/* feedback block stays the same */}
          {feedbacks[i] && (
            <div className="qa-answer mt-4">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <strong style={{ fontSize: "1.1rem" }}>Feedback:</strong>

                <button
                  onClick={() => handleReadFeedback(i)}
                  style={{
                    backgroundColor: "#22c55e", // match QAAssistant green
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ▶ Read Aloud
                </button>
              </div>
              <p>{feedbacks[i]}</p>
            </div>
          )}

        </div>
      ))}


      
    </div>
  );
};

export default QuizSection;
