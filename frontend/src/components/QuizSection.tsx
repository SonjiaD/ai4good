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

  const handleRecord = async (index: number) => {
    const res = await fetch('http://localhost:5000/api/record', { method: 'POST' });
    const data = await res.json();
    const updatedAnswers = [...answers];
    updatedAnswers[index] = data.transcription;
    setAnswers(updatedAnswers);
  };

  const handleReadFeedback = async (index: number) => {
    await fetch('http://localhost:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: feedbacks[index] }),
    });
    const audio = new Audio('http://localhost:5000/api/tts/file');
    audio.play();
  };

  return (
    <div className="card">
      <h2>Test Your Understanding</h2>
      <button onClick={generateQuiz} className="primary" disabled={loading}>
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {questions.map((q, i) => (
        <div key={i} className="mt-4">
          <p><b>Q{i + 1}:</b> {q}</p>
          <div className="flex gap-2 mt-2">
            <input
              className="form-input-custom flex-grow"
              placeholder="Your answer"
              value={answers[i]}
              onChange={e => {
                const newAns = [...answers];
                newAns[i] = e.target.value;
                setAnswers(newAns);
              }}
            />
            <button className="secondary" onClick={() => handleRecord(i)}>🎙️</button>
            <button className="primary" onClick={() => submitAnswer(i)}>Submit</button>
          </div>

          {feedbacks[i] && (
            <>
              <div className="mt-2 p-2 bg-green-100 border rounded">
                <strong>Feedback:</strong> {feedbacks[i]}
              </div>
              <button className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded" onClick={() => handleReadFeedback(i)}>
                🔊 Read Feedback
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizSection;
