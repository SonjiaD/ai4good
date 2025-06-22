import React from "react";
import "./VocabToggle.css";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export default function VocabToggle({ enabled, onChange }: Props) {
  return (
    <label className="rb-switch">
      <input
        type="checkbox"
        checked={enabled}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="rb-slider" />
      <span className="rb-label">Vocab Mode</span>
    </label>
  );
}
