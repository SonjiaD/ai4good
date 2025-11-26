import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useReadingContext } from "../context/ReadingContext";
import { useNavigate } from "react-router-dom";

interface Story {
  id: string;
  title: string;
  uploadDate: string;
  coverUrl?: string; // URL to cover image
  author?: string;
}

const StoryHistory: React.FC = () => {
  // Use localStorage for user id if not in context
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();
  const { setFile, setText, setTitle, setParagraphs } = useReadingContext();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-stories?userId=${userId}`);
        const data = await response.json();
        setStories(data.stories || []);
      } catch (err) {
        console.error("Failed to fetch story history", err);
      }
      setLoading(false);
    };
    if (userId) fetchStories();
  }, [userId]);

  // Handler for clicking a book
  const handleBookClick = async (story: Story) => {
    try {
      // Fetch PDF and images for this story
      const res = await fetch(`${API_BASE_URL}/api/story-details?storyId=${story.id}`);
      const data = await res.json();
      // Set context for reading tab
      setTitle(data.title || story.title);
      setText(data.text || "");
      setParagraphs(data.paragraphs || []);
      // If you store the PDF as a blob, you can setFile(new File([blob], ...))
      // For now, just set text and images
      // Optionally, setFile if you fetch the PDF blob
      // setFile(pdfFile);
      // Navigate to reading tab
      navigate("/reading");
    } catch (err) {
      console.error("Failed to load story details", err);
    }
  };

  return (
    <div className="story-history-card">
      <h2>Your Library</h2>
      <p>Browse and revisit your uploaded stories.</p>
      <button className="upload-btn" onClick={() => navigate("/reading")}>Upload New Story</button>
      {loading ? (
        <div>Loading...</div>
      ) : stories.length === 0 ? (
        <div>No stories uploaded yet. Click 'Upload New Story' to get started!</div>
      ) : (
        <div className="story-grid">
          {stories.map((story) => (
            <div key={story.id} className="story-card" onClick={() => handleBookClick(story)} style={{ cursor: "pointer" }}>
              <img src={story.coverUrl || "/default-cover.png"} alt={story.title} className="story-cover" style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "8px" }} />
              <div className="story-info">
                <strong>{story.title}</strong><br />
                {story.author && <span>{story.author}</span>}<br />
                <span style={{ color: "#888" }}>Uploaded: {new Date(story.uploadDate).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryHistory;
