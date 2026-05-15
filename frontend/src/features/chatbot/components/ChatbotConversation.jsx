import React, { useEffect, useRef, useState } from "react";
import ChatbotMessage from "./ChatbotMessage";
import "./ChatbotConversation.css";

export const ChatbotConversation = ({
  messages,
  loading,
  error,
  onSendMessage,
  onClearChat,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");
    await onSendMessage(message);
  };

  return (
    <div className="chatbot-conversation">
      {/* Header */}
      <div className="chatbot-header">
        <h3>RPAR Assistant</h3>
        <button
          className="clear-btn"
          onClick={onClearChat}
          title="Clear conversation"
        >
          ↻
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="greeting-icon">💬</div>
            <h4>Start a Conversation</h4>
            <p>Ask me anything about RPAR</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatbotMessage
            key={index}
            message={msg}
            isUser={msg.role === "user"}
          />
        ))}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>RPAR is thinking...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          disabled={loading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="send-btn"
          title="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatbotConversation;
