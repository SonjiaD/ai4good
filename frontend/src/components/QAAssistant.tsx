import React, { useState, useRef } from 'react';
import { useReadingContext } from '../context/ReadingContext';
import { API_BASE_URL } from '../config';

const QAAssistant: React.FC = () => {
  const { text } = useReadingContext();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  //Added a way to track if recording or not
  //This is for visual purposes because the STT would immediately show "No speech detected" after a question was asked
  const [isRecording, setIsRecording] = useState(false); 
  //Keep references to the recorder and audio chunks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleAsk = async () => {
    if (!question || !text) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/qa-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  //Recording function changed slightly
  const handleRecord = async () => {
    //If already recording, stop and process the audio
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    //Otherwise, start recording
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); //Using webm
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await fetch(`${API_BASE_URL}/api/transcribe-audio`, {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.transcription && data.transcription !== "No speech detected") {
            setQuestion(data.transcription); //Only update if we got actual speech
          } else {
            //Keep the existing question if no speech was detected
            console.log("No speech detected, keeping previous question");
          }
        } catch (err) {
          console.error("Transcription failed:", err);
        } finally {
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Mic access denied or failed", err);
      alert("Please allow microphone access to use this feature.");
      setIsRecording(false);
    }
  };

  const handleAnswerReadAloud = async () => {
    if (!answer) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      //Convert response to blob and play directly
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); //Clean up the memory
      };
      
      await audio.play();
    } catch (err) {
      console.error("Error reading answer aloud:", err);
    }
  };

  return (
    <div className="qa-box">
      <div className="qa-input-section">
        <input
          className="qa-input"
          placeholder="Ask a question about the text..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="qa-button" onClick={handleAsk} disabled={loading}>
          {loading ? '...' : '▶'}
        </button>
        <button 
          className="secondary" 
          onClick={handleRecord} //Added a stop emoji to the recording button for clarity
        >
          {isRecording ? '⏹️' : '🎙️'} 
        </button>
      </div>

      {answer && (
        <div className="qa-answer">
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
            <strong style={{ fontSize: "1.1rem" }}>Answer:</strong>

            <button
              onClick={handleAnswerReadAloud}
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
              ▶ Read Aloud
            </button>
          </div>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default QAAssistant;
