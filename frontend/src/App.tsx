import React from "react";
import ReadingAssistant from "./pages/ReadingAssistant";
import { ReadingProvider } from "./context/ReadingContext";
import "./App.css";

const App: React.FC = () => {
  return (
    <ReadingProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex flex-1 p-6 gap-6 @container/main bg-[var(--background-light)]">
          <ReadingAssistant />
        </main>
      </div>
    </ReadingProvider>
  );
};

const Header: React.FC = () => (
  <header className="sticky top-0 z-20 flex items-center justify-between whitespace-nowrap border-b border-[var(--border-color)] bg-[var(--card-background)] px-6 py-4 shadow-sm">
    <div className="flex items-center gap-3 text-[var(--text-primary)]">
      <span className="material-symbols-outlined text-[var(--primary-color)] text-3xl">
        auto_stories
      </span>
      <h1 className="text-2xl font-bold">ReadWise</h1>
    </div>
    <nav className="flex items-center gap-6">
      <a className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)]" href="#">My Library</a>
      <a className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)]" href="#">Explore</a>
      <a className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)]" href="#">Settings</a>
    </nav>
  </header>
);

export default App;
