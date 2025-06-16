// /src/components/QuizSection.tsx

import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QuizSection: React.FC = () => {
  const { text, questions, setQuestions, answers, setAnswers, feedbacks, setFeedbacks } = useReadingContext();
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
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch {
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
    } catch {
      setError('Failed to get feedback');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Test Your Understanding</h2>

      {questions.length === 0 && (
        <button onClick={handleGenerateQuestions} className="btn-primary w-full">
          Generate Quiz
        </button>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {questions.map((q, i) => (
        <div key={i} className="p-4 bg-slate-50 rounded-lg my-4">
          <p className="font-medium mb-2">Q{i + 1}: {q}</p>
          <input
            type="text"
            value={answers[i]}
            onChange={(e) => {
              const updated = [...answers];
              updated[i] = e.target.value;
              setAnswers(updated);
            }}
            className="form-input-custom mb-2"
            placeholder="Your answer..."
          />
          <button onClick={() => handleSubmitAnswer(i)} className="btn-secondary">
            Submit
          </button>
          {feedbacks[i] && (
            <div className="mt-2 p-2 bg-green-100 border rounded">
              <strong>Feedback:</strong> {feedbacks[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizSection;
