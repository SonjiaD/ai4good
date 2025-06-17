import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';

const PDFUploader: React.FC = () => {
  const { setText } = useReadingContext();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload-pdf', { method: 'POST', body: formData });
      const data = await response.json();
      setText(data.text);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Story Time</h2>
        <label className="primary" style={{ cursor: "pointer" }}>
          Upload PDF
          <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
      </div>
      {loading && <p>Loading PDF...</p>}
    </div>
  );
};

export default PDFUploader;
