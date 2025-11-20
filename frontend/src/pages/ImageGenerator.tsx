// import React, { useState } from "react";
// import { generateImagesFromPdf } from "../lib/api";

// export default function ImageGenerator() {
//   const [file, setFile] = useState<File | null>(null);
//   const [images, setImages] = useState<{ url: string; page: number }[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     try {
//       const data = await generateImagesFromPdf(file);
//       setImages(data.images ?? []);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="p-8 space-y-4">
//       <h1 className="text-xl font-semibold text-center">Story Illustration Generator</h1>

//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//           disabled={!file || loading}
//         >
//           {loading ? "Generating..." : "Generate Images"}
//         </button>
//       </form>

//       {error && <p className="text-red-600">{error}</p>}

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
//         {images.map((img) => (
//           <div key={img.page} className="border rounded p-2">
//             <img src={img.url} alt={`Page ${img.page}`} className="w-full rounded" />
//             <p className="text-sm text-center">Page {img.page}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { generateImagesFromPdf, type StoryImage, startStoryImageJob, getStoryImageJob, type StoryJobStatus } from "../api/images"; // <-- match path & names

export default function ImageGenerator() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [maxPages, setMaxPages] = useState(2);
  const [size, setSize] = useState("1024x1024");
  const [images, setImages] = useState<StoryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<StoryJobStatus | null>(null);
  const [progress, setProgress] = useState<string[]>([]);

  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPdf(e.target.files[0]);
  };

  const onGenerate = async () => {
    if (!pdf) return setError("Please choose a PDF first.");
    setError(null);
    setLoading(true);
    setImages([]);
    setJobId(null);
    setJobStatus(null);
    setProgress([]);
    try {
      const start = await startStoryImageJob(pdf, { max_pages: maxPages, size });
      // const result = await generateImagesFromPdf(pdf, { max_pages: maxPages, size });
      setJobId(start.job_id);
      setJobStatus(start.status);
      // setImages(result.images ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      setLoading(false);
    } 
    // finally {
    //   setLoading(false);
    // }
  };
  // polling effect
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const job = await getStoryImageJob(jobId);
        if (cancelled) return;
        setJobStatus(job.status);
        if(job.progress){
          setProgress(job.progress);
        }

        if (job.status === "done" && job.result) {
          setImages(job.result.images ?? []);
          setLoading(false);
          clearInterval(interval);
        } else if (job.status === "error") {
          setError(job.error ?? "Job failed.");
          setLoading(false);
          clearInterval(interval);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Error polling job.");
        setLoading(false);
        clearInterval(interval);
      }
    },6000); // poll every 5s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <h2 style={{ marginBottom: 8 }}>Story Illustration Generator</h2>
      <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 20 }}>
        Upload a PDF story and generate kid-friendly illustrations 🌈
      </p>

      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 20,
          background: "#fafafa",
          display: "inline-block",
          textAlign: "left",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <input type="file" accept="application/pdf" onChange={onChoose} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <label>
              Max pages:
              <input
                type="number"
                min={1}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                style={{ width: 90, marginLeft: 6 }}
              />
            </label>

            <label>
              Size:
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ marginLeft: 6 }}
              >
                <option>512x512</option>
                <option>768x768</option>
                <option>1024x1024</option>
              </select>
            </label>

            <button
              onClick={onGenerate}
              disabled={loading || !pdf}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#007bff",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate Images"}
            </button>
          </div>

          {error && <div style={{ color: "#b00020" }}>{error}</div>}
        </div>
      </section>
   {/* Loading + status box */}
   {(jobStatus === "queued" || jobStatus === "running") && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fffaf0",
            maxWidth: 500,
            marginInline: "auto",
            textAlign: "left",
          }}
        >
          <strong>Generating your illustrations…</strong>
          <p style={{ fontSize: 13, marginTop: 4, marginBottom: 4 }}>
            This can take 2–4 minutes for 3 images, depending on story complexity.
          </p>
          <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
            Status: {jobStatus}
          </p>

          {progress.length > 0 && (
            <p
              style={{
                fontSize: 12,
                marginTop: 8,
                marginBottom: 0,
                padding: 8,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid #eee",
              }}
            >
              Latest update: {progress[progress.length - 1]}
            </p>
          )}
        </div>
      )}

      {/* 🌀 spinner while loading */}
      {loading && (
        <div
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid #ccc",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {images.length > 0 && !loading && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ margin: "8px 0" }}>Results</h3>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {images.map((img, idx) => (
              <figure key={idx} style={{ margin: 0 }}>
              <div
              style={{
                width: "100%",
                height: 260,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              >
                <img
                  src={img.url}
                  alt={`Generated page ${img.page ?? idx + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    // objectFit: "cover",
                    // borderRadius: 10,
                    // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                </div>
                <figcaption style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                  Page {img.page ?? idx + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
