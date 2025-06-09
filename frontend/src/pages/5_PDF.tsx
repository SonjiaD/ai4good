import React, { useState } from 'react';

const PdfPage: React.FC = () => {

    // State variables
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [textAudioUrl, setTextAudioUrl] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setText(data.text);
      } else {
        setError(data.error || 'Failed to extract text');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

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

    const handleReadFeedback = async (index: number) => {
    try {
        const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: feedbacks[index] }),
        });

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        const updatedUrls = [...audioUrls];
        updatedUrls[index] = audioUrl;
        setAudioUrls(updatedUrls);
    } catch (err) {
        setError('TTS failed');
    }
    };

    const handleReadText = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.slice(0, 300) }), // limit for speed
            });

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            setTextAudioUrl(audioUrl);
        } catch (err) {
            setError('TTS failed for PDF text');
        }
    };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📄 Upload & Read PDF</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {text && (
        <>
          <div className="mt-4 whitespace-pre-wrap border p-3 rounded bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
            {text.slice(0, 800)}... {/* optional: limit view for now */}
          </div>

          <button
            onClick={handleGenerateQuestions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            🧪 Generate Questions
          </button>
              <button
                onClick={handleReadText}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded"
                >
                🔊 Read Aloud
                </button>

                {textAudioUrl && (
                <audio controls className="mt-2">
                    <source src={textAudioUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                </audio>
                )}

        </>

        
      )}

      {questions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">🧠 Quiz</h2>
          {questions.map((q, i) => (
            <div key={i} className="border p-4 rounded bg-white shadow-sm">
              <p className="font-medium">Q{i + 1}: {q}</p>
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => {
                  const updated = [...answers];
                  updated[i] = e.target.value;
                  setAnswers(updated);
                }}
                className="border mt-2 px-2 py-1 w-full"
                placeholder="Your answer..."
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleSubmitAnswer(i)}
                  className="px-3 py-1 bg-purple-600 text-white rounded"
                >
                  ✅ Submit
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
      )}
    </div>
  );
};

export default PdfPage;
