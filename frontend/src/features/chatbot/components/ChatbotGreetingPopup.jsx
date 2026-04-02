import React, { useState, useEffect } from "react";
import "./ChatbotGreetingPopup.css";

export const ChatbotGreetingPopup = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Show message after 1 second (every time user visits/refreshes)
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowMessage(false);
  };

  if (!showMessage) return null;

  return (
    <div className="chatbot-simple-message">
      <span className="message-icon">💬</span>
      <span className="message-text">How can I help you?</span>
      <button className="message-close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

export default ChatbotGreetingPopup;
