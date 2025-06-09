import React, { useEffect, useRef, useState } from 'react';

/**
 * This component shows a webcam feed and monitors the user's focus
 * based on mouse/keyboard inactivity for now.
 */
const FocusTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);  // Used to display webcam
  const [focused, setFocused] = useState(true);      // Whether user is active or idle
  const [lastInteraction, setLastInteraction] = useState(Date.now());  // Timestamp of last movement

  // 🧠 Idle detection: if no movement for 5 seconds, mark as unfocused
  useEffect(() => {
    const checkIdle = () => {
      const now = Date.now();
      const isActive = now - lastInteraction < 5000;
      setFocused(isActive);
    };
    const interval = setInterval(checkIdle, 1000);  // Check every second
    return () => clearInterval(interval);           // Cleanup
  }, [lastInteraction]);

  // 🖱️ Register mouse & keyboard activity
  useEffect(() => {
    const updateActivity = () => setLastInteraction(Date.now());

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);

  // 🎥 Get the webcam feed and attach it to <video>
  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Could not access webcam:', err);
      }
    };

    getVideo();
  }, []);

  useEffect(() => {
    const logStatus = async () => {
        await fetch('http://localhost:5000/api/log-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: focused ? 'focused' : 'unfocused',
            timestamp: new Date().toISOString(),
        }),
        });
    };

    logStatus();
    }, [focused]); // re-run when focus changes


  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">👁️ Focus Tracker</h1>
      <video ref={videoRef} autoPlay playsInline className="mx-auto border rounded w-96 h-72" />
      <p className={`mt-4 text-lg font-semibold ${focused ? 'text-green-600' : 'text-red-500'}`}>
        {focused ? 'You are focused! ✅' : 'Looks like you’re distracted... 👀'}
      </p>
    </div>
  );
};

export default FocusTracker;
