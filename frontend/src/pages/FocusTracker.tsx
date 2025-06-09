import React, { useEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

const FocusTracker = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [focused, setFocused] = useState<boolean | null>(null);

  useEffect(() => {
    let faceLandmarker: FaceLandmarker;
    let animationFrameId: number;

    const initFaceTracking = async () => {
      // Load the vision task model
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Create the landmarker
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      await setupCamera();
      requestAnimationFrame(detectFace);
    };

    const setupCamera = async () => {
      const video = videoRef.current!;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(true);
        };
      });
    };

    const detectFace = async () => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const drawingUtils = new DrawingUtils(ctx);

      if (
        !video ||
        !faceLandmarker ||
        video.paused ||
        video.ended ||
        video.readyState < 2
      ) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const now = performance.now();
      const results = await faceLandmarker.detectForVideo(video, now);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        drawingUtils.drawConnectors(
          results.faceLandmarks[0],
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: '#00FF00', lineWidth: 1 }
        );
        setFocused(true);
      } else {
        setFocused(false);
      }

      animationFrameId = requestAnimationFrame(detectFace);
    };

    initFaceTracking();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Focus Tracker</h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video ref={videoRef} style={{ width: 640, height: 480 }} />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 640,
            height: 480,
          }}
        />
      </div>
      <p>
        Status:{' '}
        <strong style={{ color: focused ? 'green' : 'red' }}>
          {focused === null ? 'Loading...' : focused ? 'Focused' : 'Distracted'}
        </strong>
      </p>
    </div>
  );
};

export default FocusTracker;
