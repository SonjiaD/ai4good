import { useEffect, useState } from 'react';
import webgazer from 'webgazer';

const FocusTracker = () => {
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {


    let lastMouseMove = Date.now();

    const handleMouseMove = () => {
      lastMouseMove = Date.now();
    };

    

    window.addEventListener("mousemove", handleMouseMove);
    
    // Initialize WebGazer
    webgazer
      .setGazeListener((data: any, time: any) => {
        if (data == null) {
          setStatus("No face detected");
          return;
        }

        

        const now = Date.now();
        const secondsIdle = (now - lastMouseMove) / 1000;

        if (secondsIdle > 10) {
          setStatus("User not interacting (mouse idle)");
        } else {
          setStatus("User is focused");
        }

        //VERSION 2
        // const centerX = window.innerWidth / 2;
        // const centerY = window.innerHeight / 2;

        // // Shrink the "focus zone" for stricter detection
        // const toleranceX = 200; // Horizontal box half-width
        // const toleranceY = 150; // Vertical box half-height

        // const isFocused =
        // Math.abs(data.x - centerX) < toleranceX &&
        // Math.abs(data.y - centerY) < toleranceY;

        // if (isFocused) {
        // setStatus("Focused ✅");
        // } else {
        // setStatus("Not focused ❌");
        // }

      })
      .begin()
      .showPredictionPoints(false);
      // renders a floating canvas at the top of the page

    

    // Check for mouse inactivity 

    

    const idleChecker = setInterval(() => {
      const now = Date.now();
      const secondsIdle = (now - lastMouseMove) / 1000;
      if (secondsIdle > 10) {
        setStatus("User not interacting (mouse idle)");
      }
    }, 5000);

    // ✅ Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(idleChecker);

      try {
        if (webgazer && typeof webgazer.end === "function") {
          webgazer.end();
        }
      } catch (e) {
        console.warn("Error during webgazer cleanup:", e);
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-xl mx-20">
      <h1 className="text-2xl font-semibold mb-4">🧠 Focus Detection</h1>
      <p className="text-gray-700 mb-2">Status: <span className="font-mono">{status}</span></p>
      <p className="text-sm text-gray-500">
        This tool uses your webcam and mouse activity to detect whether you're paying attention to the screen.
      </p>
    </div>
  );
};

export default FocusTracker;
