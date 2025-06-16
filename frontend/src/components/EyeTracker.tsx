import { useEffect, useRef, useState } from 'react';
import webgazer from 'webgazer';

const EyeTracker = () => {
  const [status, setStatus] = useState("Initializing...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setStatus("Webcam access denied");
      }
    };

    const startWebGazer = async () => {
      webgazer.setGazeListener((data: { x: number; y: number } | null, timestamp: number) => {
        if (data == null) {
          setStatus("No face detected");
          return;
        }
        setStatus("Tracking...");
        drawDot(data.x, data.y);
      });

      webgazer.showVideo(false);
      webgazer.showPredictionPoints(false);
      await webgazer.begin();
    };

    const drawDot = (x: number, y: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    };

    startWebcam();
    startWebGazer();

    return () => {
      webgazer.end();
    };
  }, []);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">🧠 Focus Detection</h2>
      <p>Status: <span className="font-mono">{status}</span></p>

      <div className="relative w-full aspect-video bg-slate-200 rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay muted className="absolute top-0 left-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} width={640} height={360} className="absolute top-0 left-0 w-full h-full" />
      </div>
    </div>
  );
};

export default EyeTracker;
