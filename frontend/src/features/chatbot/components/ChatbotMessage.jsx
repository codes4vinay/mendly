import React from "react";
import "./ChatbotMessage.css";

export const ChatbotMessage = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`chatbot-message ${isUser ? "user-message" : "bot-message"}`}
    >
      <div className="message-content">
        <p>{message.content}</p>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatbotMessage;
