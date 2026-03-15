import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addNotification, fetchNotifications } from "@/features/notification/notificationSlice";
import { addMessage, setTyping, clearTyping } from "@/features/chat/chatSlice";
import {
    initializeSocket,
    onNotification,
    offNotification,
    disconnectSocket,
    getSocket,
} from "@/services/socketService";
import useAuth from "@/hooks/useAuth";

/**
 * Custom hook to handle real-time notifications and chat
 * Connects to socket server and listens for notification and chat events
 */
export const useNotifications = () => {
    const dispatch = useDispatch();
    const { user, accessToken, isAuthenticated } = useAuth();
    const notifications = useSelector((state) => state.notification.notifications);
    const unreadCount = useSelector((state) => state.notification.unreadCount);

    // Handle new notification from socket
    const handleNewNotification = useCallback(
        (notification) => {
            // Add to Redux store
            dispatch(addNotification(notification));

            // Show toast notification
            toast.success(notification.title, {
                description: notification.message,
                duration: 5000,
            });
        },
        [dispatch]
    );

    // Handle new chat message from socket
    const handleNewChatMessage = useCallback(
        (messageData) => {
            dispatch(addMessage({
                chatId: messageData.chatId,
                message: {
                    sender: messageData.senderId,
                    senderRole: messageData.senderRole,
                    message: messageData.message,
                    createdAt: messageData.createdAt,
                },
            }));

            // Show toast for new message
            toast.success(`New message from ${messageData.sender}`, {
                duration: 3000,
            });
        },
        [dispatch]
    );

    // Handle typing indicator
    const handleTyping = useCallback(
        (data) => {
            dispatch(setTyping({
                chatId: data.chatId,
                isTyping: true,
                userName: data.userName,
            }));
        },
        [dispatch]
    );

    // Handle stop typing
    const handleStopTyping = useCallback(
        () => {
            dispatch(clearTyping());
        },
        [dispatch]
    );

    // Initialize socket on mount
    useEffect(() => {
        if (!isAuthenticated || !user || !accessToken) return;

        try {
            // Initialize socket connection
            initializeSocket(accessToken);

            // Listen for notifications
            onNotification(handleNewNotification);

            // Listen for chat events
            onChatMessage(handleNewChatMessage);
            onTyping(handleTyping);
            onStopTyping(handleStopTyping);

            // Fetch initial notifications
            dispatch(fetchNotifications({ page: 1, limit: 20 }));

            return () => {
                // Cleanup on unmount
                offNotification();
                offChatMessage();
                offTyping();
                offStopTyping();
                disconnectSocket();
            };
        } catch (error) {
            console.error("Error initializing services:", error);
        }
    }, [isAuthenticated, user, accessToken, dispatch, handleNewNotification, handleNewChatMessage, handleTyping, handleStopTyping]);

    // Polling fallback
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const pollInterval = setInterval(() => {
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [isAuthenticated, accessToken, dispatch]);

    return {
        notifications,
        unreadCount,
    };
};

// Socket event listeners for chat
export const onChatMessage = (callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("chat:new-message", callback);
};

export const offChatMessage = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("chat:new-message");
};

export const onTyping = (callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("chat:typing", callback);
};

export const offTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("chat:typing");
};

export const onStopTyping = (callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("chat:stop-typing", callback);
};

export const offStopTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("chat:stop-typing");
};
