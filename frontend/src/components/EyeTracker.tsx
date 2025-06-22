import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { useReadingContext } from "../context/ReadingContext";

const EyeTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  // const [focusScore, setFocusScore] = useState(0);
  const { focusScore, setFocusScore } = useReadingContext();
  const [faceDetected, setFaceDetected] = useState(true);
  const [status, setStatus] = useState("Loading...");
  // const { setIsEyeTracking } = useReadingContext();
  const { setIsEyeTracking, mouseIdleTime, setFocusAlert, setAlertReason } =
    useReadingContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          numFaces: 1,
        }
      );

      startCamera();
    };

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          requestAnimationFrame(predict);
        };
      }
    };

    const predict = async () => {
      try {
        if (!faceLandmarkerRef.current || !videoRef.current) {
          requestAnimationFrame(predict);
          return;
        }

        const results = await faceLandmarkerRef.current.detectForVideo(
          videoRef.current,
          performance.now()
        );
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) {
          requestAnimationFrame(predict);
          return;
        }

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const drawingUtils = new DrawingUtils(ctx);

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          setStatus("No face detected ❌");
          setFaceDetected(false);
          setIsEyeTracking(false); // marked as inactive in focus analytics window
          setFocusScore(0); // focus score is 0 when no face is detected
          requestAnimationFrame(predict);
          return;
        }

        const landmarks = results.faceLandmarks[0];
        setFaceDetected(true);
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#00FF00", lineWidth: 2 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#00FF00", lineWidth: 2 }
        );

        const score = calculateFocusScore(landmarks);
        setFocusScore(score);
        setStatus("Tracking ✅");
        // setFaceDetected(true);
        setIsEyeTracking(true); // mark as active in focus analytics window
      } catch (err) {
        console.warn("Error during prediction:", err);
        setStatus("Prediction Error ❌");
        setIsEyeTracking(false); // handle prediction err as inactive
      }
      requestAnimationFrame(predict);
    };

    init();
    return () => {
      faceLandmarkerRef.current?.close();
    };
  }, [setIsEyeTracking]);

  // detecting whether face is in frame/mouse is too idle for focus alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const isMouseIdle = mouseIdleTime > 15;

      if (!faceDetected) {
        setFocusAlert(true);
        setAlertReason("face");
      } else if (isMouseIdle) {
        setFocusAlert(true);
        setAlertReason("mouse");
      } else {
        setFocusAlert(false);
        setAlertReason(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [faceDetected, mouseIdleTime, setFocusAlert, setAlertReason]);

  function calculateFocusScore(landmarks: NormalizedLandmark[]): number {
    if (landmarks.length < 470) return 0;

    // EAR calculation
    const EAR =
      (calculateEAR(landmarks, "left") + calculateEAR(landmarks, "right")) / 2;
    let score = Math.min(Math.max((EAR - 0.15) / 0.1, 0), 1);

    // Head pose penalty
    const nose = landmarks[1];
    const eyeCenterX = (landmarks[33].x + landmarks[263].x) / 2;
    const deviation = Math.abs(nose.x - eyeCenterX);
    score *= 1 - Math.min(deviation * 5, 1);

    // Iris visibility penalty
    const leftIris = landmarks[468];
    const rightIris = landmarks[473];
    const irisPenalty =
      isIrisVisible(leftIris) && isIrisVisible(rightIris) ? 1 : 0.5;
    score *= irisPenalty;

    return Math.round(score * 100);
  }

  function isIrisVisible(iris: NormalizedLandmark): boolean {
    return iris.z > -0.15; // heuristic depth check
  }

  function calculateEAR(
    landmarks: NormalizedLandmark[],
    side: "left" | "right"
  ): number {
    const indices =
      side === "left"
        ? [33, 160, 158, 133, 153, 144]
        : [362, 385, 387, 263, 373, 380];

    const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);

    const distV1 = distance(p2, p6);
    const distV2 = distance(p3, p5);
    const distH = distance(p1, p4);

    return (distV1 + distV2) / (2.0 * distH);
  }

  function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // return (
  //   <div className="card">
  //     <h2 className="text-xl font-semibold mb-4">Focus Detection</h2>
  //     <p>Status: {status}</p>
  //     <p>Focus Score: {focusScore}%</p>

  //     <div style={{ position: 'relative', width: '640px', height: '480px' }}>
  //       <video ref={videoRef} autoPlay muted style={{ position: 'absolute', top: 0, left: 0 }} width="640" height="480" />
  //       <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
  //     </div>
  //   </div>
  // );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">
        Focus Detection
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            float: "right",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
          }}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "▼" : "▲"}
        </button>
      </h2>

      <div
        className="focus-content"
        style={{
          visibility: isCollapsed ? "hidden" : "visible",
          height: isCollapsed ? 0 : "auto",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <p>Status: {status}</p>
        <p>Focus Score: {focusScore}%</p>
        <div style={{ position: "relative", width: "640px", height: "480px" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ position: "absolute", top: 0, left: 0 }}
            width="640"
            height="480"
          />
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default EyeTracker;
