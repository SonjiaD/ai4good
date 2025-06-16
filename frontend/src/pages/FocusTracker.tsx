import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils, NormalizedLandmark } from "@mediapipe/tasks-vision";

const EyeTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [status, setStatus] = useState("Loading model...");

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          numFaces: 1
        });

        startCamera();
      } catch (err) {
        console.error("Model loading failed:", err);
        setStatus("Model loading failed");
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && canvas) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            requestAnimationFrame(predict);
          };
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setStatus("Camera access failed");
      }
    };

    const predict = async () => {
      if (!faceLandmarkerRef.current || !videoRef.current) return;

      const results = await faceLandmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const drawingUtils = new DrawingUtils(ctx);

      let isFocused = false;

      results.faceLandmarks.forEach((landmarks) => {
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#FF2C35', lineWidth: 1.5 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#00FF00', lineWidth: 2 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#00FF00', lineWidth: 2 });

        const leftEyeEAR = calculateEyeAspectRatio(landmarks, "left");
        const rightEyeEAR = calculateEyeAspectRatio(landmarks, "right");

        const averageEAR = (leftEyeEAR + rightEyeEAR) / 2;

        // If eyes are open wide enough, consider user focused
        if (averageEAR > 0.2) {
          isFocused = true;
        }
      });

      setStatus(results.faceLandmarks.length === 0 ? "No face detected ❌" : isFocused ? "Focused ✅" : "Not focused ❌");

      requestAnimationFrame(predict);
    };

    init();

    return () => {
      faceLandmarkerRef.current?.close();
    };
  }, []);

  // Eye Aspect Ratio Calculation
  function calculateEyeAspectRatio(landmarks: NormalizedLandmark[], side: "left" | "right"): number {
    const indices = side === "left"
      ? [33, 160, 158, 133, 153, 144]
      : [362, 385, 387, 263, 373, 380];

    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];

    const distV1 = distance(p2, p6);
    const distV2 = distance(p3, p5);
    const distH = distance(p1, p4);

    const ear = (distV1 + distV2) / (2.0 * distH);
    return ear;
  }

  function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">🧠 Focus Detection</h2>
      <p>Status: <span className="font-mono">{status}</span></p>

      <div className="relative bg-slate-200 rounded-lg overflow-hidden" style={{ width: '640px', height: '480px' }}>
        <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0, width: '640px', height: '480px' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '640px', height: '480px' }} />
      </div>
    </div>
  );
};

export default EyeTracker;
