import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    "notification/fetchNotifications",
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/notifications", {
                params: { page, limit },
            });
            return res.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch notifications"
            );
        }
    }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
    "notification/markAsRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            return notificationId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark as read"
            );
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    "notification/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            await api.put("/notifications/read-all");
            return true;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark all as read"
            );
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    "notification/deleteNotification",
    async (notificationId, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            return notificationId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete notification"
            );
        }
    }
);

const initialState = {
    notifications: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        updateUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.unreadCount = action.payload.notifications.filter(
                    (n) => !n.isRead
                ).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Mark as read
        builder
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(
                    (n) => n._id === action.payload
                );
                if (notification) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAsRead.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Mark all as read
        builder
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach((n) => {
                    n.isRead = true;
                });
                state.unreadCount = 0;
            })
            .addCase(markAllAsRead.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Delete notification
        builder
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.notifications = state.notifications.filter(
                    (n) => n._id !== action.payload
                );
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { updateUnreadCount, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
