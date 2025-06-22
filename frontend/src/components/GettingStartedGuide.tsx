import React from "react";
import "./GettingStartedGuide.css";

/** Shown only when no story is loaded */
export default function GettingStartedGuide() {
  const Card = ({
    step,
    title,
    children,
  }: {
    step: number;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rb-guide-card">
      <span className="rb-step-badge">{step}</span>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );

  return (
    <div className="rb-guide-wrapper">
      <Card step={1} title="Upload a PDF">
        Click the&nbsp;<strong>📄 Upload PDF</strong> button to load a story.
      </Card>

      <Card step={2} title="Turn on Vocab Mode">
        • Press <strong>Vocab</strong> then click <strong>🔍 Search Definition</strong> to get a kid-friendly
        meaning. <br />
      </Card>

      <Card step={3} title="Listen to the Story">
        • Press <strong>▶ Read Aloud</strong> to hear the story.
      </Card>
    </div>
  );
}
