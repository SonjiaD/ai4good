// src/components/QAAssistant.tsx

import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const QAAssistant: React.FC = () => {
  const { text } = useReadingContext();
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/qa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question }),
      });

      const data = await response.json();
      if (response.ok) {
        setConversation(prev => [...prev, { question, answer: data.answer }]);
        setQuestion('');
      } else {
        setError(data.error || 'Failed to get answer.');
      }
    } catch {
      setError('Failed to get answer.');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Ask Questions About The Story</h2>

      <div className="mb-4 flex">
        <input
          type="text"
          className="form-input-custom flex-grow"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="btn-primary ml-2" onClick={handleAskQuestion} disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {conversation.map((msg, idx) => (
          <div key={idx} className="p-3 bg-slate-50 rounded-lg">
            <p className="font-semibold">Q: {msg.question}</p>
            <p className="mt-1">A: {msg.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAAssistant;
