import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils, NormalizedLandmark } from "@mediapipe/tasks-vision";

const EyeTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [focusScore, setFocusScore] = useState(0);
  const [smoothedScore, setSmoothedScore] = useState(0);
  const [prevLandmarks, setPrevLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [status, setStatus] = useState("Loading...");

  // EMA smoothing memory
  const lastSmoothed = useRef<number>(0);

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
      setStatus("Face detected ✅");

      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#00FF00', lineWidth: 2 });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#00FF00', lineWidth: 2 });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: '#FF0000', lineWidth: 2 });

      const leftEAR = calculateEyeAspectRatio(landmarks, "left");
      const rightEAR = calculateEyeAspectRatio(landmarks, "right");
      const averageEAR = (leftEAR + rightEAR) / 2;
      const EARScore = Math.min((averageEAR - 0.15) / 0.1, 1);

      const headPoseScore = estimateHeadFocus(landmarks);
      const irisScore = estimateIrisVisibility(landmarks);
      const jitterPenalty = estimateJitterPenalty(landmarks, prevLandmarks);

      setPrevLandmarks(landmarks);

      const rawScore = Math.max(0, Math.min(1,
        EARScore * 0.4 + headPoseScore * 0.3 + irisScore * 0.3 - jitterPenalty * 0.1
      ));

      setFocusScore(rawScore);

      // Exponential Moving Average smoothing
      const alpha = 0.25; // smoothing factor (adjust to make more or less responsive)
      const smooth = alpha * rawScore + (1 - alpha) * lastSmoothed.current;
      lastSmoothed.current = smooth;
      setSmoothedScore(smooth);

      requestAnimationFrame(predict);
    };

    init();
    return () => { faceLandmarkerRef.current?.close(); };
  }, []);

  // ---- Helper Functions ----

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

  function estimateHeadFocus(landmarks: NormalizedLandmark[]): number {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const deviation = Math.abs(nose.x - eyeCenterX);

    const threshold = 0.03;  // dead zone tolerance
    const normalizedDeviation = Math.max(0, deviation - threshold);
    return Math.max(0, 1 - normalizedDeviation * 10);
  }

  function estimateIrisVisibility(landmarks: NormalizedLandmark[]): number {
    const irisLeft = landmarks[468];
    const irisRight = landmarks[473];
    const leftEyeCenter = getEyeCenter(landmarks, "left");
    const rightEyeCenter = getEyeCenter(landmarks, "right");

    const irisLeftDist = distance(irisLeft, leftEyeCenter);
    const irisRightDist = distance(irisRight, rightEyeCenter);

    if (irisLeftDist < 0.005 || irisRightDist < 0.005) return 0;
    return 1;
  }

  function getEyeCenter(landmarks: NormalizedLandmark[], side: "left" | "right"): NormalizedLandmark {
    const indices = side === "left" ? [33, 133] : [362, 263];
    const centerX = (landmarks[indices[0]].x + landmarks[indices[1]].x) / 2;
    const centerY = (landmarks[indices[0]].y + landmarks[indices[1]].y) / 2;
    const centerZ = (landmarks[indices[0]].z + landmarks[indices[1]].z) / 2;
    return { x: centerX, y: centerY, z: centerZ, visibility: 1.0 };
  }

  function estimateJitterPenalty(current: NormalizedLandmark[], previous: NormalizedLandmark[] | null): number {
    if (!previous) return 0;
    const deltas = current.map((p, i) => distance(p, previous[i]));
    const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    return Math.min(avgDelta * 50, 1);
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">🧠 Focus Detection v3.0</h2>
      <p>Status: {status}</p>
      <p>Raw Score: {(focusScore * 100).toFixed(1)}%</p>
      <p>Smoothed Focus Score: {(smoothedScore * 100).toFixed(1)}%</p>

      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0 }} width="640" height="480" />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
};

export default EyeTracker;
