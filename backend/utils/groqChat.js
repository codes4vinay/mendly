import Groq from 'groq-sdk';
import { getVectorStore } from './prepare.js';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for Mendly, a service platform that connects users with professional services and products.

IMPORTANT INSTRUCTIONS:
- Provide clear, concise, and helpful answers based on the provided documentation
- Use the context from Mendly documentation to answer questions accurately
- If information is not in the context, politely inform the user and suggest contacting support at support@mendly.com
- Be friendly, professional, and empathetic in your tone
- Do NOT include markdown formatting symbols (**, *, #, etc.) in your response - use plain text
- Format lists using numbers or dashes without extra symbols
- Keep responses under 500 words for clarity`;

export async function getGroqResponse(userMessage, conversationHistory = []) {
    try {
        // Get vector store and retrieve relevant context
        const vectorStore = await getVectorStore();
        const relevantChunks = await vectorStore.similaritySearch(userMessage, 3);
        const context = relevantChunks.map((chunk) => chunk.pageContent).join('\n\n');

        // Build messages array with conversation history
        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            ...conversationHistory,
            {
                role: 'user',
                content: `Context from Mendly documentation:\n${context}\n\nUser Question: ${userMessage}`,
            },
        ];

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        const assistantMessage = completion.choices[0].message.content;

        return {
            success: true,
            response: assistantMessage,
            usage: completion.usage,
        };
    } catch (error) {
        console.error('Groq API Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get response from AI',
        };
    }
}

export async function testGroqConnection() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Say hello',
                },
            ],
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        });

        return {
            success: true,
            message: 'Groq connection successful',
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}
