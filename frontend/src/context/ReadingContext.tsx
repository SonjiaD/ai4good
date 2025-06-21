// /src/context/ReadingContext.tsx

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ReadingContextProps {
  file: File | null;
  setFile: (file: File | null) => void;
  text: string;
  setText: (text: string) => void;
  questions: string[];
  setQuestions: (questions: string[]) => void;
  answers: string[];
  setAnswers: (answers: string[]) => void;
  feedbacks: string[];
  setFeedbacks: (feedbacks: string[]) => void;
  isEyeTracking: boolean;
  setIsEyeTracking: (isActive: boolean) => void;
  mouseIdleTime: number;
  setMouseIdleTime: (time: number) => void;
  focusAlert: boolean;
  setFocusAlert: (value: boolean) => void;
  focusScore: number;
  setFocusScore: (score: number) => void;
  alertReason: "face" | "mouse" | null;
  setAlertReason: (reason: "face" | "mouse" | null) => void;

  //interface ReadingContextProps
  title: string;
  setTitle: (t: string) => void;
  paragraphs: string[];
  setParagraphs: (p: string[]) => void;
}

const ReadingContext = createContext<ReadingContextProps | undefined>(
  undefined
);

export const ReadingProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [isEyeTracking, setIsEyeTracking] = useState(true);
  const [mouseIdleTime, setMouseIdleTime] = useState(0);
  const [focusAlert, setFocusAlert] = useState(false);
  const [focusScore, setFocusScore] = useState(0);
  const [alertReason, setAlertReason] = useState<"face" | "mouse" | null>(null);

  const [title,       setTitle]       = useState<string>("");
  const [paragraphs,  setParagraphs]  = useState<string[]>([]);
  return (
    <ReadingContext.Provider
      value={{
        file,
        setFile,
        text,
        setText,
        title, setTitle,
        paragraphs, setParagraphs,
        questions,
        setQuestions,
        answers,
        setAnswers,
        feedbacks,
        setFeedbacks,
        isEyeTracking,
        setIsEyeTracking,
        mouseIdleTime,
        setMouseIdleTime,
        focusAlert,
        setFocusAlert,
        focusScore,
        setFocusScore,
        alertReason,
        setAlertReason,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReadingContext = () => {
  const context = useContext(ReadingContext);
  if (!context)
    throw new Error("useReadingContext must be used within ReadingProvider");
  return context;
};
