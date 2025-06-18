import React, { useEffect, useState } from "react";
import { useReadingContext } from "../context/ReadingContext";

const AnalyticsPanel: React.FC = () => {
  const { isEyeTracking, mouseIdleTime, setMouseIdleTime } =
    useReadingContext();
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  useEffect(() => {
    const handleMouseMove = () => {
      setLastMouseMove(Date.now());
      setMouseIdleTime(0); // reset context idle time on movement
    };

    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      const secondsIdle = Math.floor((Date.now() - lastMouseMove) / 1000);
      setMouseIdleTime(secondsIdle); // update context every second
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [lastMouseMove, setMouseIdleTime]);

  return (
    <div className="focus-analytics-card">
      <h2 className="analytics-title">Focus Analytics</h2>

      <div className="analytics-row">
        <div className="analytics-left">
          <span role="img" aria-label="eye">
            👁️
          </span>{" "}
          Eye Tracking
        </div>
        {/* <div className="status-pill">Active</div> */}
        <div className={`status-pill ${isEyeTracking ? "active" : "inactive"}`}>
          {isEyeTracking ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="analytics-row">
        <div className="analytics-left">
          <span role="img" aria-label="mouse">
            🖱️
          </span>{" "}
          Mouse Idle Time
        </div>
        <div className="analytics-right">{mouseIdleTime} seconds</div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
