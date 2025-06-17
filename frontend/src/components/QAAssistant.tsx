import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QAAssistant: React.FC = () => {
  const { text } = useReadingContext();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    setLoading(true);
    setError(null);
    setAnswer('');

    try {
      const response = await fetch('http://localhost:5000/api/qa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question }),
      });

      const data = await response.json();
      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || 'Failed to get answer');
      }
    } catch (err) {
      setError('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleReadAnswer = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: answer }),
      });

      const data = await response.json();
      if (response.ok) {
        setAudioUrl(`http://localhost:5000${data.audio_url}`);
      } else {
        setError('TTS failed');
      }
    } catch (err) {
      setError('TTS failed');
    }
  };

  const handleRecordQuestion = () => {
    let mediaRecorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      console.log("Recording...");

      mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', audioBlob);

        fetch('http://localhost:5000/api/transcribe-audio', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            setQuestion(data.transcription);
          })
          .catch(err => console.error(err));
      });

      setTimeout(() => {
        mediaRecorder.stop();
        console.log("Recording stopped");
      }, 5000);
    });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">💬 Ask Questions About the Story</h2>
      <div className="space-y-2">
        <textarea
          className="w-full border p-2 rounded"
          rows={3}
          placeholder="Type or record your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={handleAskQuestion} disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Ask'}
          </button>
          <button onClick={handleRecordQuestion} className="btn-secondary">
            🎙 Record Question
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {answer && (
          <div className="p-4 mt-3 bg-slate-100 rounded border">
            <p><strong>Answer:</strong> {answer}</p>
            <button onClick={handleReadAnswer} className="btn-secondary mt-2">
              🔊 Read Answer
            </button>
            {audioUrl && (
              <audio controls className="mt-2">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QAAssistant;
