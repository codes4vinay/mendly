import express from 'express';
import {
    sendChatbotMessage,
    getChatbotConversation,
    startNewConversation,
    indexDocumentation,
    testGroqAPI,
    clearConversation,
} from '../controllers/chatbotController.js';

const router = express.Router();

/**
 * Public routes - No authentication required
 */

// Start a new conversation
router.post('/new', startNewConversation);

// Send message to chatbot
router.post('/message', sendChatbotMessage);

// Get conversation history
router.get('/conversation/:conversationId', getChatbotConversation);

// Clear conversation
router.delete('/conversation/:conversationId', clearConversation);

/**
 * Admin routes - These should be protected with admin middleware
 * Uncomment and add protect/authorize middleware as needed
 */

// Index documentation into vector store
router.post('/admin/index-docs', indexDocumentation);

// Test Groq API connection
router.get('/admin/test-groq', testGroqAPI);

export default router;
