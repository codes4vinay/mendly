import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Loader2, Trash2, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/shared/Layout";
import {
  fetchChat,
  sendMessage,
  markChatAsRead,
  deleteChat,
} from "@/features/chat/chatSlice";
import { emitTyping, emitStopTyping } from "@/services/socketService";
import useAuth from "@/hooks/useAuth";
import { formatDateTime } from "@/utils/helpers";
import { toast } from "sonner";

const ChatWindow = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentChat = useSelector((state) => state.chat.currentChat);
  const currentMessages = useSelector((state) => state.chat.currentMessages);
  const loading = useSelector((state) => state.chat.loading);
  const typing = useSelector((state) => state.chat.typing);
  const typingUser = useSelector((state) => state.chat.typingUser);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch chat on mount
  useEffect(() => {
    if (chatId) {
      dispatch(fetchChat({ chatId, page: 1, limit: 50 }));
      dispatch(markChatAsRead(chatId));
    }
  }, [chatId, dispatch]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Get other user (recipient)
  const getOtherUser = () => {
    if (!currentChat) return null;
    return user?.role === "user" ? currentChat.serviceOwner : currentChat.user;
  };

  const getCallNumber = () => {
    if (!currentChat) return null;

    if (user?.role === "user") {
      return currentChat.serviceCentre?.phone || currentChat.serviceOwner?.phone;
    }

    return currentChat.user?.phone;
  };

  // Handle typing
  const handleTyping = () => {
    if (!chatId) return;

    if (!isTyping) {
      setIsTyping(true);
      emitTyping({ chatId, userName: user?.name });
    }

    // Clear existing timeout
    clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping({ chatId });
    }, 3000);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    try {
      await dispatch(sendMessage({ chatId, message })).unwrap();
      setMessage("");
      setIsTyping(false);
      emitStopTyping({ chatId });
    } catch (error) {
      toast.error(error || "Failed to send message");
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId || deleting) return;

    const confirmed = window.confirm(
      "Delete this chat permanently?"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await dispatch(deleteChat(chatId)).unwrap();
      toast.success("Chat deleted");
      navigate("/chats");
    } catch (error) {
      toast.error(error || "Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !currentChat) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  const otherUser = getOtherUser();
  const callNumber = getCallNumber();

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        {currentChat && (
          <div className="border-b bg-card sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  {otherUser?.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt="User"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-indigo-600">
                      {otherUser?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{otherUser?.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {otherUser?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!callNumber}
                  onClick={() => {
                    if (callNumber) {
                      window.location.href = `tel:${callNumber}`;
                    }
                  }}
                  aria-label={callNumber ? `Call ${callNumber}` : "Call unavailable"}
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deleting}
                  onClick={handleDeleteChat}
                  aria-label="Delete chat"
                >
                  {deleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-20">
                <Info className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              currentMessages.map((msg, idx) => {
                const isOwnMessage =
                  msg.sender === user?._id || msg.sender?._id === user?._id;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${isOwnMessage ? "text-indigo-200" : "text-muted-foreground"}`}
                      >
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-2 px-4 py-2 bg-muted rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-2 self-center">
                  {typingUser} is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t bg-card sticky bottom-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto p-4 flex gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!message.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatWindow;
