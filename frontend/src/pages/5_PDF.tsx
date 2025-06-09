import React, { useState } from 'react';

const PdfUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">📄 Upload a PDF</h1>
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
        <div className="mt-4 whitespace-pre-wrap border p-3 rounded bg-gray-100">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          {text}
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
