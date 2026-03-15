import Chat from "../models/Chat.js";
import ServiceCentre from "../models/ServiceCentre.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { getIO } from "../utils/ioInstance.js";

// ─── Get or Create Chat Session ────────────────────────────
export const getOrCreateChat = asyncHandler(async (req, res) => {
    const { serviceCentreId } = req.body;

    const serviceCentre = await ServiceCentre.findById(serviceCentreId).populate("owner", "_id name email phone avatar");
    if (!serviceCentre) throw new ApiError(404, "Service centre not found");

    let chat = await Chat.findOne({
        user: req.user._id,
        serviceCentre: serviceCentreId,
    }).populate("user", "name avatar email phone")
        .populate("serviceCentre", "name avatar phone")
        .populate("serviceOwner", "name avatar email phone");

    if (!chat) {
        chat = await Chat.create({
            user: req.user._id,
            serviceCentre: serviceCentreId,
            serviceOwner: serviceCentre.owner._id,
            messages: [],
        });

        chat = await chat.populate("user", "name avatar email phone");
        chat = await chat.populate("serviceCentre", "name avatar phone");
        chat = await chat.populate("serviceOwner", "name avatar email phone");
    }

    return apiResponse(res, 200, "Chat session active", { chat });
});

// ─── Send Message ─────────────────────────────────────────
export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { message, attachments = [] } = req.body;

    if (!message?.trim()) {
        throw new ApiError(400, "Message is required");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found");

    // Authorization: user can only chat if they're the initiator or owner
    const isUser = chat.user.toString() === req.user._id.toString();
    const isOwner = chat.serviceOwner.toString() === req.user._id.toString();
    if (!isUser && !isOwner) {
        throw new ApiError(403, "Not authorized to message in this chat");
    }

    // Push new message
    const newMessage = {
        sender: req.user._id,
        senderRole: req.user.role === "service" ? "service" : "user",
        message: message.trim(),
        attachments,
        isRead: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessage = newMessage.message;
    chat.lastMessageAt = new Date();

    // Update unread counts
    if (isUser) {
        chat.ownerUnreadCount = (chat.ownerUnreadCount || 0) + 1;
    } else {
        chat.userUnreadCount = (chat.userUnreadCount || 0) + 1;
    }

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    // Real-time socket notification
    const io = getIO();
    if (io) {
        const recipientId = isUser ? chat.serviceOwner : chat.user;
        io.to(`user:${recipientId}`).emit("chat:new-message", {
            chatId: chat._id,
            sender: req.user.name,
            message: savedMessage.message,
            senderId: req.user._id,
            senderRole: savedMessage.senderRole,
            createdAt: savedMessage.createdAt,
        });
    }

    const populatedChat = await Chat.findById(chatId)
        .populate("user", "name avatar email phone")
        .populate("serviceCentre", "name avatar phone")
        .populate("serviceOwner", "name avatar email phone");

    return apiResponse(res, 201, "Message sent", {
        chat: populatedChat,
        message: savedMessage
    });
});

// ─── Get All Chats for User ────────────────────────────────
export const getMyChats = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    let filter = {};

    // If user is regular user, get chats where they're the user
    if (req.user.role === "user") {
        filter = { user: req.user._id };
    }
    // If service owner, get chats where they're the owner
    else if (req.user.role === "service") {
        filter = { serviceOwner: req.user._id };
    }

    const total = await Chat.countDocuments(filter);
    const chats = await Chat.find(filter)
        .populate("user", "name avatar email phone")
        .populate("serviceCentre", "name avatar phone")
        .populate("serviceOwner", "name avatar email phone")
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    return apiResponse(res, 200, "Chats fetched", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        chats,
    });
});

// ─── Get Single Chat with Messages ─────────────────────────
export const getChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId)
        .populate("user", "name avatar email phone")
        .populate("serviceCentre", "name avatar phone")
        .populate("serviceOwner", "name avatar email phone")
        .populate("messages.sender", "name avatar email phone");

    if (!chat) throw new ApiError(404, "Chat not found");

    // Authorization
    const isUser = chat.user._id.toString() === req.user._id.toString();
    const isOwner = chat.serviceOwner._id.toString() === req.user._id.toString();
    if (!isUser && !isOwner) {
        throw new ApiError(403, "Not authorized to view this chat");
    }

    // Paginate messages
    const totalMessages = chat.messages.length;
    const startIdx = Math.max(0, totalMessages - page * limit);
    const paginatedMessages = chat.messages.slice(startIdx, startIdx + Number(limit));

    return apiResponse(res, 200, "Chat fetched", {
        chat: {
            ...chat.toObject(),
            messages: paginatedMessages,
        },
        messageCount: totalMessages,
        page: Number(page),
        pages: Math.ceil(totalMessages / limit),
    });
});

// ─── Mark Messages as Read ──────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found");

    const isUser = chat.user.toString() === req.user._id.toString();
    const isOwner = chat.serviceOwner.toString() === req.user._id.toString();
    if (!isUser && !isOwner) {
        throw new ApiError(403, "Not authorized");
    }

    // Mark unread messages from other user as read
    chat.messages.forEach((msg) => {
        if (isUser && msg.senderRole === "service") {
            msg.isRead = true;
        } else if (isOwner && msg.senderRole === "user") {
            msg.isRead = true;
        }
    });

    // Reset unread count
    if (isUser) {
        chat.userUnreadCount = 0;
    } else {
        chat.ownerUnreadCount = 0;
    }

    await chat.save();

    return apiResponse(res, 200, "Messages marked as read");
});

// ─── Delete Chat ────────────────────────────────────────────
export const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found");

    const isUser = chat.user.toString() === req.user._id.toString();
    const isOwner = chat.serviceOwner.toString() === req.user._id.toString();
    if (!isUser && !isOwner) {
        throw new ApiError(403, "Not authorized to delete this chat");
    }

    await chat.deleteOne();

    return apiResponse(res, 200, "Chat deleted");
});
