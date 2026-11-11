import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, X } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { openChatbot, toggleChatbot } from "../chatbotSlice";
import { useChatbot } from "../useChatbot";
import ChatbotConversation from "./ChatbotConversation";
import "./ChatbotWidget.css";

export const ChatbotWidget = () => {
  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.chatbot);
  const { user, isAuthenticated, isUser } = useAuth();
  const support = useChatbot();
  const {
    conversationId,
    supportContext,
    resetLocalState,
    startConversation,
    loadContext,
  } = support;

  useEffect(() => {
    if (!isAuthenticated) {
      resetLocalState();
      return;
    }
    if (!conversationId) startConversation();
    if (isUser && !supportContext) loadContext();
  }, [isAuthenticated, isUser, conversationId, supportContext, resetLocalState, startConversation, loadContext]);

  useEffect(() => {
    const handleOpenChatbot = () => dispatch(openChatbot());
    window.addEventListener("openChatbot", handleOpenChatbot);
    return () => window.removeEventListener("openChatbot", handleOpenChatbot);
  }, [dispatch]);

  return (
    <>
      <button
        className={`chatbot-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => dispatch(toggleChatbot())}
        title={isOpen ? "Close Mendly Support" : "Open Mendly Support"}
        aria-label={isOpen ? "Close Mendly Support" : "Open Mendly Support"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
        {!isOpen && <span className="chatbot-online-dot" />}
      </button>

      {isOpen && (
        <aside className="chatbot-widget-container" aria-label="Mendly customer support">
          <ChatbotConversation
            {...support}
            user={user}
            isAuthenticated={isAuthenticated}
            isCustomer={isUser}
          />
        </aside>
      )}
    </>
  );
};

export default ChatbotWidget;
