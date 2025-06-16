// /src/context/ReadingContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

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
}

const ReadingContext = createContext<ReadingContextProps | undefined>(undefined);

export const ReadingProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  return (
    <ReadingContext.Provider value={{
      file, setFile,
      text, setText,
      questions, setQuestions,
      answers, setAnswers,
      feedbacks, setFeedbacks
    }}>
      {children}
    </ReadingContext.Provider>
  );
};

export const useReadingContext = () => {
  const context = useContext(ReadingContext);
  if (!context) throw new Error("useReadingContext must be used within ReadingProvider");
  return context;
};
