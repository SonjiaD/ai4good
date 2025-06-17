import React from 'react';

const AnalyticsPanel: React.FC = () => {
  return (
    <div className="card">
      <h2>Focus Analytics</h2>
      <div className="space-y-3">
        <div className="flex justify-between p-3 bg-slate-50 rounded">
          <div className="flex items-center gap-2">
            👁️ Eye Tracking
          </div>
          <span className="text-green-600 font-semibold">Active</span>
        </div>

        <div className="flex justify-between p-3 bg-slate-50 rounded">
          <div className="flex items-center gap-2">
            🖱️ Mouse Idle
          </div>
          <span className="text-gray-500">2 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
