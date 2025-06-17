import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QuizSection: React.FC = () => {
  const { text } = useReadingContext();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [textAudioUrl, setTextAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
        setFeedbacks(new Array(data.questions.length).fill(''));
        setAudioUrls(new Array(data.questions.length).fill(''));
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Failed to generate quiz');
    }
  };

  const handleSubmitAnswer = async (index: number) => {
    const question = questions[index];
    const answer = answers[index];

    try {
      const response = await fetch('http://localhost:5000/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question, answer }),
      });
      const data = await response.json();
      if (response.ok) {
        const updated = [...feedbacks];
        updated[index] = data.feedback;
        setFeedbacks(updated);
      } else {
        setError(data.error || 'Failed to get feedback');
      }
    } catch (err) {
      setError('Failed to get feedback');
    }
  };

  const handleReadText = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300) }), // limit text length
      });

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setTextAudioUrl(audioUrl);
    } catch (err) {
      setError('TTS failed for text');
    }
  };

  // const handleReadFeedback = async (index: number) => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/tts', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ text: feedbacks[index] }),
  //     });

  //     const blob = await response.blob();
  //     const audioUrl = URL.createObjectURL(blob);

  //     const updatedUrls = [...audioUrls];
  //     updatedUrls[index] = audioUrl;
  //     setAudioUrls(updatedUrls);
  //   } catch (err) {
  //     setError('TTS failed for feedback');
  //   }
  // };
  const handleReadFeedback = async (idx: number) => {
    if (!feedbacks[idx]) return;

    try {
      const response = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: feedbacks[idx] }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `http://localhost:5000${data.audio_url}?nocache=${Date.now()}`;
        const audio = new Audio(fullUrl);
        await audio.play();
      }
    } catch (err) {
      console.error("TTS failed:", err);
    }
  };

  const handleRecordAnswer = (index: number) => {
    let mediaRecorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

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
            const updated = [...answers];
            updated[index] = data.transcription;
            setAnswers(updated);
          })
          .catch(err => console.error(err));
      });

      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // record 5 seconds
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🧪 Test Your Understanding</h2>

      <button
        onClick={handleGenerateQuestions}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Generate Quiz
      </button>

      {textAudioUrl && (
        <audio controls className="mt-2">
          <source src={textAudioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}

      {questions.map((q, i) => (
        <div key={i} className="mb-4 p-3 bg-slate-50 rounded shadow">
          <p className="font-medium mb-2">Q{i + 1}: {q}</p>

          <input
            type="text"
            value={answers[i]}
            onChange={(e) => {
              const updated = [...answers];
              updated[i] = e.target.value;
              setAnswers(updated);
            }}
            className="w-full border px-2 py-1 rounded"
            placeholder="Your answer..."
          />

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleSubmitAnswer(i)}
              className="px-3 py-1 bg-purple-600 text-white rounded"
            >
              ✅ Submit
            </button>

            <button
              onClick={() => handleRecordAnswer(i)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              🎙 Record Answer
            </button>

            {feedbacks[i] && (
              <button
                onClick={() => handleReadFeedback(i)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                🔊 Read Feedback
              </button>
            )}
          </div>

          {feedbacks[i] && (
            <>
              <div className="mt-2 p-2 bg-green-100 border rounded">
                <strong>Feedback:</strong> {feedbacks[i]}
              </div>
              {audioUrls[i] && (
                <audio controls className="mt-2">
                  <source src={audioUrls[i]} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizSection;
