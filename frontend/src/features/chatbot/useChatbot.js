import { useCallback, useState } from 'react';
import API from '../../services/axios';

export const useChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationId, setConversationId] = useState(null);

    // Start a new conversation
    const startConversation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await API.post('/chatbot/new');
            const newConversationId = response.data.data.conversationId;
            setConversationId(newConversationId);
            setMessages([]); // Clear messages for new conversation
            return newConversationId;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to start conversation';
            setError(errorMessage);
            console.error('Error starting conversation:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Send message to chatbot
    const sendMessage = useCallback(
        async (message) => {
            if (!message.trim() || !conversationId) {
                setError('Please start a conversation first');
                return null;
            }

            try {
                setLoading(true);
                setError(null);

                // Add user message to UI immediately
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'user',
                        content: message,
                        timestamp: new Date(),
                    },
                ]);

                // Send to API
                const response = await API.post('/chatbot/message', {
                    message,
                    conversationId,
                });

                const botResponse = response.data.data.response;

                // Add bot response to UI
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: botResponse,
                        timestamp: new Date(),
                    },
                ]);

                return botResponse;
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to send message';
                setError(errorMessage);
                console.error('Error sending message:', err);

                // Remove the user message if request failed
                setMessages((prev) => prev.slice(0, -1));
                return null;
            } finally {
                setLoading(false);
            }
        },
        [conversationId]
    );

    // Get conversation history
    const getConversationHistory = useCallback(async () => {
        if (!conversationId) {
            setError('No active conversation');
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await API.get(`/chatbot/conversation/${conversationId}`);
            const history = response.data.data.messages;
            setMessages(history);
            return history;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch conversation';
            setError(errorMessage);
            console.error('Error fetching conversation:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    // Clear conversation
    const clearConversation = useCallback(async () => {
        if (!conversationId) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await API.delete(`/chatbot/conversation/${conversationId}`);
            const newConversationId = await startConversation();
            return newConversationId;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to clear conversation';
            setError(errorMessage);
            console.error('Error clearing conversation:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [conversationId, startConversation]);

    return {
        messages,
        loading,
        error,
        conversationId,
        startConversation,
        sendMessage,
        getConversationHistory,
        clearConversation,
        setMessages,
        setError,
    };
};
