import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// Get or create chat
export const getOrCreateChat = createAsyncThunk(
    "chat/getOrCreateChat",
    async (serviceCentreId, { rejectWithValue }) => {
        try {
            const res = await api.post("/chats", { serviceCentreId });
            return res.data.data.chat;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create chat"
            );
        }
    }
);

// Get all chats for user
export const fetchChats = createAsyncThunk(
    "chat/fetchChats",
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/chats", { params: { page, limit } });
            return res.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch chats"
            );
        }
    }
);

// Get single chat with messages
export const fetchChat = createAsyncThunk(
    "chat/fetchChat",
    async ({ chatId, page = 1, limit = 50 } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get(`/chats/${chatId}`, {
                params: { page, limit },
            });
            return res.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch chat"
            );
        }
    }
);

// Send message
export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async ({ chatId, message, attachments = [] }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/chats/${chatId}/messages`, {
                message,
                attachments,
            });
            return res.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to send message"
            );
        }
    }
);

// Mark messages as read
export const markChatAsRead = createAsyncThunk(
    "chat/markAsRead",
    async (chatId, { rejectWithValue }) => {
        try {
            await api.put(`/chats/${chatId}/read`);
            return chatId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark as read"
            );
        }
    }
);

// Delete chat
export const deleteChat = createAsyncThunk(
    "chat/deleteChat",
    async (chatId, { rejectWithValue }) => {
        try {
            await api.delete(`/chats/${chatId}`);
            return chatId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete chat"
            );
        }
    }
);

const initialState = {
    chats: [],
    currentChat: null,
    currentMessages: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
    typing: false,
    typingUser: null,
};

const upsertChat = (chats, nextChat) => {
    const existingIndex = chats.findIndex((chat) => chat._id === nextChat._id);

    if (existingIndex >= 0) {
        const updatedChat = {
            ...chats[existingIndex],
            ...nextChat,
        };
        chats.splice(existingIndex, 1);
        chats.unshift(updatedChat);
        return;
    }

    chats.unshift(nextChat);
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            const isCurrentChat = state.currentChat && state.currentChat._id === action.payload.chatId;

            if (isCurrentChat) {
                state.currentMessages.push(action.payload.message);
            }

            const chat = state.chats.find((item) => item._id === action.payload.chatId);
            if (chat) {
                chat.lastMessage = action.payload.message.message;
                chat.lastMessageAt = action.payload.message.createdAt;
                if (isCurrentChat) {
                    chat.userUnreadCount = 0;
                    chat.ownerUnreadCount = 0;
                } else if (action.payload.message.senderRole === "user") {
                    chat.ownerUnreadCount = (chat.ownerUnreadCount || 0) + 1;
                } else {
                    chat.userUnreadCount = (chat.userUnreadCount || 0) + 1;
                }
            }
        },
        setTyping: (state, action) => {
            if (state.currentChat?._id !== action.payload.chatId) {
                return;
            }
            state.typing = action.payload.isTyping;
            state.typingUser = action.payload.userName;
        },
        clearTyping: (state) => {
            state.typing = false;
            state.typingUser = null;
        },
    },
    extraReducers: (builder) => {
        // Get or create chat
        builder
            .addCase(getOrCreateChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrCreateChat.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChat = action.payload;
                upsertChat(state.chats, action.payload);
            })
            .addCase(getOrCreateChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch chats
        builder
            .addCase(fetchChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload.chats;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch single chat
        builder
            .addCase(fetchChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChat.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChat = action.payload.chat;
                state.currentMessages = action.payload.chat.messages;
                state.total = action.payload.messageCount;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                upsertChat(state.chats, action.payload.chat);
            })
            .addCase(fetchChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Send message
        builder
            .addCase(sendMessage.fulfilled, (state, action) => {
                if (state.currentChat) {
                    state.currentChat = action.payload.chat;
                    state.currentMessages.push(action.payload.message);
                }

                upsertChat(state.chats, action.payload.chat);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Mark as read
        builder
            .addCase(markChatAsRead.fulfilled, (state, action) => {
                const chat = state.chats.find((c) => c._id === action.payload);
                if (chat) {
                    chat.userUnreadCount = 0;
                    chat.ownerUnreadCount = 0;
                }
                if (state.currentChat && state.currentChat._id === action.payload) {
                    state.currentChat.userUnreadCount = 0;
                    state.currentChat.ownerUnreadCount = 0;
                }
            });

        // Delete chat
        builder
            .addCase(deleteChat.fulfilled, (state, action) => {
                state.chats = state.chats.filter((c) => c._id !== action.payload);
                if (state.currentChat?._id === action.payload) {
                    state.currentChat = null;
                    state.currentMessages = [];
                }
            });
    },
});

export const { addMessage, setTyping, clearTyping } = chatSlice.actions;
export default chatSlice.reducer;
