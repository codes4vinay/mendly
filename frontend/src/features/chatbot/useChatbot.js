import { useCallback, useState } from "react";
import api from "../../utils/axios";

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [supportContext, setSupportContext] = useState(null);

  const startConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/chatbot/new");
      const data = response.data.data;
      setConversationId(data.conversationId);
      setMessages(data.messages || []);
      return data.conversationId;
    } catch (err) {
      setError(err.response?.data?.message || "Support is temporarily unavailable");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContext = useCallback(async () => {
    try {
      const response = await api.get("/chatbot/context");
      setSupportContext(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your support details");
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || !conversationId) return null;
    const optimisticMessage = {
      role: "user",
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimisticMessage]);
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/chatbot/message", {
        message: message.trim(),
        conversationId,
      });
      const data = response.data.data;
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.response,
        intent: data.intent,
        suggestedActions: data.suggestedActions || [],
        createdAt: new Date().toISOString(),
      }]);
      return data;
    } catch (err) {
      setMessages((current) => current.filter((item) => item !== optimisticMessage));
      setError(err.response?.data?.message || "Message could not be sent");
      return null;
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const createTicket = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/chatbot/tickets", payload);
      await loadContext();
      return response.data.data.ticket;
    } catch (err) {
      setError(err.response?.data?.message || "Support request could not be created");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadContext]);

  const cancelResource = useCallback(async ({ resourceType, resourceId, reason }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/chatbot/actions/cancel", {
        resourceType,
        resourceId,
        reason,
        confirmation: "CONFIRM_CANCEL",
      });
      await loadContext();
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation could not be completed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadContext]);

  const clearConversation = useCallback(async () => {
    if (conversationId) await api.delete(`/chatbot/conversation/${conversationId}`);
    setConversationId(null);
    setMessages([]);
    return startConversation();
  }, [conversationId, startConversation]);

  const resetLocalState = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setSupportContext(null);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    conversationId,
    supportContext,
    startConversation,
    loadContext,
    sendMessage,
    createTicket,
    cancelResource,
    clearConversation,
    resetLocalState,
  };
};
