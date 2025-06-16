import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils, NormalizedLandmark } from "@mediapipe/tasks-vision";

const EyeTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [focusScore, setFocusScore] = useState(0);
  const [gazePos, setGazePos] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const init = async () => {
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

      await startCamera();
    };

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          // Wait until video fully loads before starting prediction loop
          const waitUntilVideoReady = () => {
            if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
              requestAnimationFrame(predict);
            } else {
              requestAnimationFrame(waitUntilVideoReady);
            }
          };

          waitUntilVideoReady();
        };
      }
    };

    const predict = async () => {
      if (!faceLandmarkerRef.current || !videoRef.current) return;

      const results = await faceLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const drawingUtils = new DrawingUtils(ctx);

      if (results.faceLandmarks.length === 0) {
        setStatus("No face detected ❌");
        requestAnimationFrame(predict);
        return;
      }

      const landmarks = results.faceLandmarks[0];

      // Draw eyes, lips, and facial mesh lightly
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#00FF00', lineWidth: 2 });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#00FF00', lineWidth: 2 });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: '#FF0000', lineWidth: 2 });

      // Focus score calculation (eye + head orientation)
      const leftEAR = calculateEyeAspectRatio(landmarks, "left");
      const rightEAR = calculateEyeAspectRatio(landmarks, "right");
      const averageEAR = (leftEAR + rightEAR) / 2;
      const EARScore = Math.min((averageEAR - 0.15) / 0.1, 1);
      const headPoseScore = estimateHeadFocus(landmarks);
      const totalFocusScore = Math.max(0, Math.min(1, EARScore * 0.6 + headPoseScore * 0.4));
      setFocusScore(totalFocusScore);

      // Gaze estimation
      const leftEye = getEyeCenter(landmarks, "left");
      const rightEye = getEyeCenter(landmarks, "right");
      const gazeX = (leftEye.x + rightEye.x) / 2;
      const gazeY = (leftEye.y + rightEye.y) / 2;
      setGazePos({ x: gazeX, y: gazeY });

      setStatus("Face detected ✅");
      requestAnimationFrame(predict);
    };

    init();
    return () => { faceLandmarkerRef.current?.close(); };
  }, []);

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

    return (distV1 + distV2) / (2.0 * distH);
  }

  function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function getEyeCenter(landmarks: NormalizedLandmark[], side: "left" | "right") {
    const indices = side === "left" ? [33, 133] : [362, 263];
    const centerX = (landmarks[indices[0]].x + landmarks[indices[1]].x) / 2;
    const centerY = (landmarks[indices[0]].y + landmarks[indices[1]].y) / 2;
    return { x: centerX, y: centerY };
  }

  function estimateHeadFocus(landmarks: NormalizedLandmark[]): number {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const deviation = Math.abs(nose.x - eyeCenterX);
    return Math.max(0, 1 - deviation * 5);
  }

  const pointerX = gazePos.x * 640;
  const pointerY = gazePos.y * 480;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">🧠 Focus Detection</h2>
      <p>Status: {status}</p>
      <p>Focus Score: {(focusScore * 100).toFixed(1)}%</p>

      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0 }} width="640" height="480" />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{
          position: 'absolute',
          top: pointerY - 5,
          left: pointerX - 5,
          width: 10,
          height: 10,
          backgroundColor: 'blue',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
};

export default EyeTracker;
