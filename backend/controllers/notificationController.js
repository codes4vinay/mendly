import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Get My Notifications ─────────────────────────────────────
export const getMyNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const total = await Notification.countDocuments({ user: req.user._id });
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    return apiResponse(res, 200, "Notifications fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        notifications,
    });
});

// ─── Mark As Read ─────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!notification) throw new ApiError(404, "Notification not found");

    notification.isRead = true;
    await notification.save();

    return apiResponse(res, 200, "Notification marked as read");
});

// ─── Mark All As Read ─────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );

    return apiResponse(res, 200, "All notifications marked as read");
});

// ─── Delete Notification ──────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!notification) throw new ApiError(404, "Notification not found");

    await notification.deleteOne();

    return apiResponse(res, 200, "Notification deleted successfully");
});