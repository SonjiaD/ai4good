import React from "react";
import StoryHistory from "../components/StoryHistory";
import { ReadingProvider } from "../context/ReadingContext";

const StoryHistoryPage: React.FC = () => (
  <ReadingProvider>
    <StoryHistory />
  </ReadingProvider>
);

export default StoryHistoryPage;
