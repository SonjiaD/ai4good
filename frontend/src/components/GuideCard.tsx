// components/GuideCard.tsx
import React from 'react';
import './GettingStartedGuide.css';

interface CardProps {
  step: number;
  title: string;
  children: React.ReactNode;
}

const GuideCard: React.FC<CardProps> = ({ step, title, children }) => {
  return (
    <div className="rb-guide-card">
      <div className="rb-step-badge">{step}</div>
      <h3 style={{ marginBottom: "0.5rem", fontWeight: 600 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default GuideCard;
