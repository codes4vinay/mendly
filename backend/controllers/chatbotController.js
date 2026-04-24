import { getGroqResponse, testGroqConnection } from '../utils/groqChat.js';
import { indexMendlyDocumentation } from '../utils/prepare.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Store conversations in memory (can be expanded to database)
const conversations = new Map();

const CONVERSATION_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create a conversation session
 */
const getOrCreateConversation = (conversationId) => {
    if (!conversations.has(conversationId)) {
        conversations.set(conversationId, {
            id: conversationId,
            messages: [],
            createdAt: Date.now(),
        });
    }
    return conversations.get(conversationId);
};

/**
 * Add message to conversation history
 */
const addMessageToHistory = (conversationId, role, content) => {
    const conversation = getOrCreateConversation(conversationId);
    conversation.messages.push({
        role,
        content,
        timestamp: Date.now(),
    });
    // Keep only last 20 messages for context
    if (conversation.messages.length > 20) {
        conversation.messages = conversation.messages.slice(-20);
    }
};

/**
 * Get conversation history
 */
const getConversationHistory = (conversationId) => {
    const conversation = getOrCreateConversation(conversationId);
    return conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
};

/**
 * Clean expired conversations
 */
const cleanExpiredConversations = () => {
    const now = Date.now();
    for (const [id, conversation] of conversations.entries()) {
        if (now - conversation.createdAt > CONVERSATION_TTL) {
            conversations.delete(id);
        }
    }
};

/**
 * Send message to chatbot and get response
 */
export const sendChatbotMessage = asyncHandler(async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json(apiResponse(400, 'Message cannot be empty'));
    }

    if (!conversationId) {
        return res.status(400).json(apiResponse(400, 'Conversation ID is required'));
    }

    try {
        // Clean expired conversations
        cleanExpiredConversations();

        // Get conversation history
        const history = getConversationHistory(conversationId);

        // Add user message to history
        addMessageToHistory(conversationId, 'user', message);

        // Get response from Groq
        const result = await getGroqResponse(message, history);

        if (!result.success) {
            return res.status(500).json(apiResponse(500, result.error || 'Failed to get response'));
        }

        // Add assistant message to history
        addMessageToHistory(conversationId, 'assistant', result.response);

        return res.status(200).json(
            apiResponse(200, 'Message processed successfully', {
                conversationId,
                response: result.response,
                messageCount: getOrCreateConversation(conversationId).messages.length,
            })
        );
    } catch (error) {
        console.error('Chatbot Error:', error);
        return res.status(500).json(apiResponse(500, 'Failed to process message'));
    }
});

/**
 * Get conversation history
 */
export const getChatbotConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json(apiResponse(400, 'Conversation ID is required'));
    }

    try {
        const conversation = getOrCreateConversation(conversationId);

        return res.status(200).json(
            apiResponse(200, 'Conversation retrieved successfully', {
                conversationId,
                messages: conversation.messages,
                createdAt: conversation.createdAt,
            })
        );
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return res.status(500).json(apiResponse(500, 'Failed to fetch conversation'));
    }
});

/**
 * Start new conversation
 */
export const startNewConversation = asyncHandler(async (req, res) => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        getOrCreateConversation(conversationId);

        return res.status(200).json(
            apiResponse(200, 'Conversation started successfully', {
                conversationId,
            })
        );
    } catch (error) {
        console.error('Error starting conversation:', error);
        return res.status(500).json(apiResponse(500, 'Failed to start conversation'));
    }
});

/**
 * Index Mendly documentation into vector store
 */
export const indexDocumentation = asyncHandler(async (req, res) => {
    try {
        await indexMendlyDocumentation();

        return res.status(200).json(
            apiResponse(200, 'Mendly documentation indexed successfully')
        );
    } catch (error) {
        console.error('Error indexing documentation:', error);
        return res.status(500).json(apiResponse(500, 'Failed to index documentation'));
    }
});

/**
 * Test Groq connection
 */
export const testGroqAPI = asyncHandler(async (req, res) => {
    try {
        const result = await testGroqConnection();

        if (result.success) {
            return res.status(200).json(apiResponse(200, result.message));
        } else {
            return res.status(500).json(apiResponse(500, result.error));
        }
    } catch (error) {
        console.error('Error testing Groq connection:', error);
        return res.status(500).json(apiResponse(500, 'Failed to test Groq connection'));
    }
});

/**
 * Clear conversation
 */
export const clearConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json(apiResponse(400, 'Conversation ID is required'));
    }

    try {
        conversations.delete(conversationId);

        return res.status(200).json(apiResponse(200, 'Conversation cleared successfully'));
    } catch (error) {
        console.error('Error clearing conversation:', error);
        return res.status(500).json(apiResponse(500, 'Failed to clear conversation'));
    }
});
