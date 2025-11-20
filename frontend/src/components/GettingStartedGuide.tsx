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
      <Card step={1} title="Upload a Story">
        Click the <strong>📄 Upload PDF</strong> button in the top-right to pick a story to read.
      </Card>

      <Card step={2} title="Explore Words">
        Turn on <strong>Vocab Mode</strong>, then tap any word to highlight it. Press <strong>🔍 Search Definition</strong> to learn what it means!
      </Card>

      <Card step={3} title="Listen or Start Fresh">
        Press <strong>▶ Read Aloud</strong> to hear the story, or <strong>✖ Clear Highlights</strong> to try again!
      </Card>

      <Card step={4} title="Turn Story into Pictures">
      Click <strong>🖍️ Illustrate Story PDF</strong> to transform your story into fun and colourful illustrations!
        <br /><br />
      </Card>

    </div>
  );
}
