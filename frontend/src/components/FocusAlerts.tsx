import React from "react";
import { useReadingContext } from "../context/ReadingContext";

const FocusAlerts: React.FC = () => {
  const { focusAlert, alertReason } = useReadingContext();

  return (
    <div className="focus-alerts-card">
      <h2 className="analytics-title">Focus Alerts</h2>
      <div className={`focus-alert-box ${focusAlert ? "alert" : "normal"}`}>
        <span className="bell-icon" role="img" aria-label="bell">
          🔔
        </span>
        <span className="alert-text">
          {focusAlert
            ? alertReason === "face"
              ? "No face detected. Please stay visible on camera."
              : "Mouse has been idle for too long."
            : "No alerts right now. Keep up the great work!"}
        </span>
      </div>
    </div>
  );
};

export default FocusAlerts;
