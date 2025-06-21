import React, { useState } from 'react';
import { useReadingContext } from '../context/ReadingContext';


const PDFUploader: React.FC = () => {
  // const { setText } = useReadingContext();
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { setText, setTitle, setParagraphs } = useReadingContext();


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
      setTitle(data.title);        // 🆕
      setParagraphs(data.paragraphs); // 🆕
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000); // resetting after 3s
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setLoading(false);
  };

  // commented out, however i can't call the backend to see if upload pdf btn turns green upon submitting PDF
  
//   return (
//     <div className="card">
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//         <h2>Story Time</h2>
//         <label className="upload-btn" style={{ cursor: "pointer" }}>
//           📄 Upload PDF
//           <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
//         </label>
//       </div>
//       {loading && <p>Loading PDF...</p>}
//     </div>
//   );
// };

return (
  <label className="upload-btn" style={{ cursor: "pointer" }}>
    {uploaded ? "✅ Uploaded!" : loading ? "Uploading..." : <>📄 Upload PDF</>}
    <input
      type="file"
      accept=".pdf"
      onChange={handleFileUpload}
      style={{ display: "none" }}
    />
  </label>
);
};

export default PDFUploader;
