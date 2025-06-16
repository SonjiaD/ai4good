// /src/components/AnalyticsPanel.tsx

import React from 'react';

const AnalyticsPanel: React.FC = () => {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Focus Analytics</h2>
      <div className="space-y-3">
        <div className="flex justify-between bg-slate-50 rounded-md p-3">
          <p className="text-sm font-medium">Eye Tracking</p>
          <span className="text-sm font-semibold text-green-500">Active</span>
        </div>
        <div className="flex justify-between bg-slate-50 rounded-md p-3">
          <p className="text-sm font-medium">Mouse Idle Time</p>
          <span className="text-sm text-gray-500">0s</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
