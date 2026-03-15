import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";
import { isOriginAllowed } from "./allowedOrigins.js";

/**
 * Initialize Socket.IO with HTTP server
 * @param {Server} server - Express server instance
 * @returns {Object} Socket.IO instance
 */
export const initIO = (server) => {

    const io = new SocketIOServer(server, {
        cors: {
            origin: (origin, callback) => {
                if (isOriginAllowed(origin)) {
                    return callback(null, true);
                }

                return callback(new Error(`Origin not allowed by CORS: ${origin}`));
            },
            credentials: true,
        },
    });

    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            // Extract token from "Bearer TOKEN"
            const actualToken = token.replace("Bearer ", "");
            const decoded = jwt.verify(actualToken, process.env.ACCESS_TOKEN_SECRET);

            socket.userId = decoded.id;
            socket.userRole = decoded.role;

            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    // Connection handler
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        // ─── Chat Events ──────────────────────────────────────
        socket.on("chat:typing", (data) => {
            // Notify other user that someone is typing
            const { chatId, userName } = data;
            socket.broadcast.emit("chat:typing", {
                chatId,
                userName,
            });
        });

        socket.on("chat:stop-typing", (data) => {
            const { chatId } = data;
            socket.broadcast.emit("chat:stop-typing", { chatId });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });

        socket.on("error", (error) => {
            console.error(`Socket error for user ${socket.userId}:`, error);
        });
    });

    return io;
};

/**
 * Send notification to specific user via socket
 */
export const notifyUser = (io, userId, notification) => {
    io.to(`user:${userId}`).emit("notification:new", notification);
};

/**
 * Send notification to multiple users via socket
 */
export const notifyUsers = (io, userIds, notification) => {
    userIds.forEach((userId) => {
        io.to(`user:${userId}`).emit("notification:new", notification);
    });
};

/**
 * Broadcast notification to all connected users
 */
export const broadcastNotification = (io, notification) => {
    io.emit("notification:new", notification);
};

export default { initIO, notifyUser, notifyUsers, broadcastNotification };
