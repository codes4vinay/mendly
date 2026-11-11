import { useEffect, useState } from "react";
import "./ChatbotGreetingPopup.css";

export const ChatbotGreetingPopup = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!showMessage) return null;

  return (
    <div className="chatbot-simple-message">
      <span className="message-icon" aria-hidden="true">●</span>
      <button className="message-text" onClick={() => {
        window.dispatchEvent(new Event("openChatbot"));
        setShowMessage(false);
      }}>
        Track, repair, resolve — we’re here.
      </button>
      <button className="message-close" onClick={() => setShowMessage(false)} aria-label="Dismiss support message">×</button>
    </div>
  );
};

export default ChatbotGreetingPopup;
