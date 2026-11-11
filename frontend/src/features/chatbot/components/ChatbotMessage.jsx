import { Bot, UserRound } from "lucide-react";
import "./ChatbotMessage.css";

const ACTION_LABELS = {
  track_order: "Track an order",
  track_repair: "Track a repair",
  complaint: "Report a problem",
  feedback: "Give feedback",
  my_tickets: "My support requests",
  refund_request: "Request a refund",
  return_request: "Request a return",
  account_help: "Account help",
  order_issue: "Order issue",
  repair_issue: "Repair issue",
};

export const ChatbotMessage = ({ message, isUser, onAction }) => {
  const timestamp = message.createdAt || message.timestamp;
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`chatbot-message ${isUser ? "user-message" : "bot-message"}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? <UserRound /> : <Bot />}
      </div>
      <div className="message-stack">
        <div className="message-content">
          <p>{message.content}</p>
          {message.knowledgeArticle?.title && (
            <span className="message-source">
              Approved article · {message.knowledgeArticle.title} · v{message.knowledgeArticle.version}
            </span>
          )}
          {time && <span className="message-time">{time}</span>}
        </div>
        {!isUser && message.suggestedActions?.length > 0 && (
          <div className="message-actions">
            {message.suggestedActions.map((action) => (
              <button type="button" key={action} onClick={() => onAction(action)}>
                {ACTION_LABELS[action] || action.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotMessage;
