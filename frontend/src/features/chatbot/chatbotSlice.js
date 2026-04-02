import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    conversationId: null,
    messages: [],
    loading: false,
    error: null,
};

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        openChatbot: (state) => {
            state.isOpen = true;
        },
        closeChatbot: (state) => {
            state.isOpen = false;
        },
        toggleChatbot: (state) => {
            state.isOpen = !state.isOpen;
        },
        setConversationId: (state, action) => {
            state.conversationId = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        resetChatbot: () => initialState,
    },
});

export const {
    openChatbot,
    closeChatbot,
    toggleChatbot,
    setConversationId,
    setMessages,
    addMessage,
    setLoading,
    setError,
    clearError,
    clearMessages,
    resetChatbot,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;
