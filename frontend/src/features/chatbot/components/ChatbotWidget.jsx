import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleChatbot, setConversationId, openChatbot } from "../chatbotSlice";
import { useChatbot } from "../useChatbot";
import ChatbotConversation from "./ChatbotConversation";
import "./ChatbotWidget.css";

export const ChatbotWidget = () => {
  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.chatbot);

  const {
    messages,
    loading,
    error,
    conversationId,
    startConversation,
    sendMessage,
    clearConversation,
  } = useChatbot();

  // Initialize conversation on component mount
  useEffect(() => {
    if (!conversationId) {
      startConversation().then((id) => {
        if (id) {
          dispatch(setConversationId(id));
        }
      });
    }

    // Listen for greeting popup open event
    const handleOpenChatbot = () => {
      dispatch(openChatbot());
    };

    window.addEventListener("openChatbot", handleOpenChatbot);
    return () => window.removeEventListener("openChatbot", handleOpenChatbot);
  }, [conversationId, startConversation, dispatch]);

  const handleToggle = () => {
    if (!isOpen) {
      dispatch(openChatbot());
      // Ensure conversation is started
      if (!conversationId) {
        startConversation().then((id) => {
          if (id) {
            dispatch(setConversationId(id));
          }
        });
      }
    } else {
      dispatch(toggleChatbot());
    }
  };

  const handleSendMessage = async (message) => {
    await sendMessage(message);
  };

  const handleClearChat = async () => {
    await clearConversation();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
        title="Chat with RPAR Assistant"
        aria-label="Open RPAR Assistant"
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-widget-container">
          <ChatbotConversation
            messages={messages}
            loading={loading}
            error={error}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
          />
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
