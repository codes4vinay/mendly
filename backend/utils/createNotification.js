import Notification from "../models/Notification.js";

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} options.userId - User ID to notify
 * @param {string} options.type - Notification type (booking_created, order_delivered, etc)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.relatedBooking] - Related booking ID
 * @param {string} [options.relatedOrder] - Related order ID
 * @param {Object} [options.io] - Socket.IO instance for real-time notification
 * @returns {Promise<Object>} Created notification document
 */
export const createNotification = async ({
    userId,
    type,
    title,
    message,
    relatedBooking = null,
    relatedOrder = null,
    io = null,
}) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            relatedBooking,
            relatedOrder,
        });

        // Emit real-time notification via socket
        if (io) {
            io.to(`user:${userId}`).emit("notification:new", {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
                relatedBooking: notification.relatedBooking,
                relatedOrder: notification.relatedOrder,
            });
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        // Don't throw error here so it doesn't break the main operation
        return null;
    }
};

/**
 * Create notifications for multiple users
 * @param {Array} userIds - Array of user IDs to notify
 * @param {Object} options - Notification options (same as createNotification)
 * @param {Object} [options.io] - Socket.IO instance
 * @returns {Promise<Array>} Array of created notification documents
 */
export const createBulkNotifications = async (userIds, options) => {
    try {
        const notifications = await Notification.insertMany(
            userIds.map((userId) => ({
                user: userId,
                type: options.type,
                title: options.title,
                message: options.message,
                relatedBooking: options.relatedBooking || null,
                relatedOrder: options.relatedOrder || null,
            }))
        );

        // Emit real-time notifications via socket
        if (options.io) {
            notifications.forEach((notification) => {
                options.io.to(`user:${notification.user}`).emit("notification:new", {
                    _id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    isRead: notification.isRead,
                    createdAt: notification.createdAt,
                });
            });
        }

        return notifications;
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
        return [];
    }
};

export default createNotification;
