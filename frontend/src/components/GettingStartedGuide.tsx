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
      <Card step={1} title="Upload a PDF Story">
        Click the <strong>📄 Upload PDF</strong> button in the top-right corner to load a story.
      </Card>

      <Card step={2} title="Turn on Vocab Mode">
        Use the <strong>Vocab Mode toggle</strong> (green switch) to enable word lookup. Then click any word in the story.
      </Card>

      <Card step={3} title="Look Up a Word">
        Press <strong>🔍 Search Definition</strong> to get a kid-friendly meaning of your selected word.
      </Card>

      <Card step={4} title="Listen to the Story">
        Press <strong>▶ Read Aloud</strong> to hear the full story read out loud.
      </Card>

      <Card step={5} title="Start Over">
        Press <strong>✖︎ Clear Highlights</strong> to reset the story and try again!
      </Card>
    </div>
  );
}
