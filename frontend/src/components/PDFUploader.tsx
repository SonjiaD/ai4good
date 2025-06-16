// /src/components/PDFUploader.tsx

import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const PDFUploader: React.FC = () => {
  const { file, setFile, setText } = useReadingContext();
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
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Story Time</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading} className="btn-primary mt-2">
        {loading ? 'Uploading...' : 'Upload PDF'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PDFUploader;
