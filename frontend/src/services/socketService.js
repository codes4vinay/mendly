import io from "socket.io-client";

let socket = null;
const serverUrl = "https://mendly-backend-fnbdhxakadhvezet.centralindia-01.azurewebsites.net";

/**
 * Initialize socket connection with authentication
 * @param {string} token - JWT token for authentication
 * @returns {Socket} socket instance
 */
export const initializeSocket = (token) => {
    if (socket) {
        return socket;
    }

    socket = io(serverUrl, {
        auth: {
            token: `Bearer ${token}`,
        },
        withCredentials: true,
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("Socket connected");
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => {
    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Listen to notification events
 * @param {function} callback - Function to call when notification received
 */
export const onNotification = (callback) => {
    if (!socket) return;

    socket.on("notification:new", (notification) => {
        console.log("New notification received:", notification);
        callback(notification);
    });
};

/**
 * Stop listening to notification events
 */
export const offNotification = () => {
    if (!socket) return;
    socket.off("notification:new");
};

/**
 * Emit typing event
 * @param {Object} data - Data including chatId and userName
 */
export const emitTyping = (data) => {
    if (!socket) return;
    socket.emit("chat:typing", data);
};

/**
 * Emit stop typing event
 * @param {Object} data - Data including chatId
 */
export const emitStopTyping = (data) => {
    if (!socket) return;
    socket.emit("chat:stop-typing", data);
};
