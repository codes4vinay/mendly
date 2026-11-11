import Booking from "../models/Booking.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import SupportConversation from "../models/SupportConversation.js";
import SupportTicket from "../models/SupportTicket.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { createNotification } from "../utils/createNotification.js";
import { getIO } from "../utils/ioInstance.js";
import { getSupportResponse, testGroqConnection } from "../utils/groqChat.js";
import { inspectSupportMessage } from "../utils/supportGuardrails.js";
import { findApprovedSupportArticle } from "../utils/supportKnowledge.js";

const MAX_CONVERSATION_MESSAGES = 60;

const ensureConversationOwner = async (conversationId, userId, allowClosed = false) => {
    const filter = { _id: conversationId, user: userId };
    if (!allowClosed) filter.closedAt = null;
    const conversation = await SupportConversation.findOne(filter);
    if (!conversation) throw new ApiError(404, "Support conversation not found");
    return conversation;
};

const saveMessage = (conversation, message) => {
    conversation.messages.push(message);
    if (conversation.messages.length > MAX_CONVERSATION_MESSAGES) {
        conversation.messages = conversation.messages.slice(-MAX_CONVERSATION_MESSAGES);
    }
    conversation.lastActivityAt = new Date();
};

const priorityForTicket = (type) => {
    if (["refund_request", "cancellation_request"].includes(type)) return "high";
    if (type === "feedback") return "low";
    return "medium";
};

const verifyLinkedRecord = async ({ userId, relatedOrder, relatedBooking }) => {
    if (relatedOrder) {
        const order = await Order.findOne({ _id: relatedOrder, buyer: userId }).select("_id");
        if (!order) throw new ApiError(404, "Order not found in your account");
    }
    if (relatedBooking) {
        const booking = await Booking.findOne({ _id: relatedBooking, customer: userId }).select("_id");
        if (!booking) throw new ApiError(404, "Repair booking not found in your account");
    }
};

const createTicketRecord = async ({ userId, payload }) => {
    await verifyLinkedRecord({ userId, ...payload });
    return SupportTicket.create({
        customer: userId,
        ...payload,
        priority: payload.priority || priorityForTicket(payload.type),
        updates: [{
            message: "Request received. The Mendly support team will review it.",
            author: userId,
            visibility: "customer",
        }],
    });
};

const createCancellationReviewTicket = async ({ userId, resourceType, resourceId, reason }) => {
    const isOrder = resourceType === "order";
    return createTicketRecord({
        userId,
        payload: {
            type: "cancellation_request",
            subject: `${isOrder ? "Order" : "Repair"} cancellation review`,
            message: reason,
            relatedOrder: isOrder ? resourceId : null,
            relatedBooking: isOrder ? null : resourceId,
            contactPreference: "email",
            priority: "high",
        },
    });
};

export const startNewConversation = asyncHandler(async (req, res) => {
    const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let conversation = await SupportConversation.findOne({
        user: req.user._id,
        closedAt: null,
        lastActivityAt: { $gte: recentCutoff },
    }).sort({ lastActivityAt: -1 });

    if (!conversation) {
        conversation = await SupportConversation.create({ user: req.user._id });
    }

    return apiResponse(res, 200, "Secure support conversation ready", {
        conversationId: conversation._id,
        messages: conversation.messages,
    });
});

export const sendChatbotMessage = asyncHandler(async (req, res) => {
    const { message, conversationId } = req.body;
    const conversation = await ensureConversationOwner(conversationId, req.user._id);
    const history = conversation.messages.map(({ role, content }) => ({ role, content }));
    const inspection = inspectSupportMessage(message);

    const storedUserMessage = inspection.intent === "sensitive_data"
        ? "[Sensitive content removed for customer security]"
        : message;
    saveMessage(conversation, { role: "user", content: storedUserMessage, intent: inspection.intent });

    const article = inspection.blocked
        ? null
        : await findApprovedSupportArticle(message, inspection.intent, "customer");

    let response = inspection.response;
    if (article) {
        const result = await getSupportResponse(message, history, article);
        response = result.response;
    } else if (!response) {
        response = "I don’t have an approved Mendly article for that yet. I can still help you track an order or repair, register a support request, or connect the issue to a human review.";
    }

    saveMessage(conversation, {
        role: "assistant",
        content: response,
        intent: inspection.intent,
        suggestedActions: inspection.suggestedActions,
        knowledgeArticle: article ? {
            slug: article.slug,
            title: article.title,
            version: article.version,
        } : undefined,
    });
    await conversation.save();

    return apiResponse(res, 200, "Message processed", {
        conversationId: conversation._id,
        response,
        intent: inspection.intent,
        blocked: inspection.blocked,
        suggestedActions: inspection.suggestedActions,
        sourceArticle: article ? {
            slug: article.slug,
            title: article.title,
            version: article.version,
        } : null,
    });
});

export const getChatbotConversation = asyncHandler(async (req, res) => {
    const conversation = await ensureConversationOwner(req.params.conversationId, req.user._id, true);
    return apiResponse(res, 200, "Conversation retrieved", {
        conversationId: conversation._id,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        closedAt: conversation.closedAt,
    });
});

export const clearConversation = asyncHandler(async (req, res) => {
    const conversation = await ensureConversationOwner(req.params.conversationId, req.user._id);
    conversation.closedAt = new Date();
    await conversation.save();
    return apiResponse(res, 200, "Conversation closed");
});

export const getSupportContext = asyncHandler(async (req, res) => {
    const [orders, bookings, tickets] = await Promise.all([
        Order.find({ buyer: req.user._id })
            .select("items totalAmount status payment.status payment.method inventoryReserved deliveredAt createdAt serviceCentre")
            .populate("items.product", "name")
            .populate("serviceCentre", "name phone")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Booking.find({ customer: req.user._id })
            .select("service serviceCentre scheduledAt status trackingStatus totalAmount isPaid payment.status tracking.timeline createdAt")
            .populate("service", "name category")
            .populate("serviceCentre", "name phone")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        SupportTicket.find({ customer: req.user._id })
            .select("ticketNumber type subject status priority relatedOrder relatedBooking rating createdAt updatedAt")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
    ]);

    return apiResponse(res, 200, "Support account data fetched", {
        customer: { name: req.user.name, email: req.user.email, emailVerified: req.user.isEmailVerified },
        orders,
        bookings,
        tickets,
    });
});

export const createSupportTicket = asyncHandler(async (req, res) => {
    const ticket = await createTicketRecord({ userId: req.user._id, payload: req.body });
    await createNotification({
        userId: req.user._id,
        type: "general",
        title: "Support request received",
        message: `Ticket ${ticket.ticketNumber} has been created.`,
        relatedOrder: ticket.relatedOrder,
        relatedBooking: ticket.relatedBooking,
        io: getIO(),
    });

    return apiResponse(res, 201, "Support request registered", { ticket });
});

export const getMySupportTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ customer: req.user._id })
        .populate("relatedOrder", "status totalAmount")
        .populate("relatedBooking", "status trackingStatus scheduledAt")
        .select("-updates.author")
        .sort({ createdAt: -1 })
        .limit(50);
    return apiResponse(res, 200, "Support requests fetched", { tickets });
});

export const getMySupportTicket = asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, customer: req.user._id })
        .populate("relatedOrder", "status totalAmount payment.status")
        .populate("relatedBooking", "status trackingStatus scheduledAt payment.status")
        .populate("assignedTo", "name");
    if (!ticket) throw new ApiError(404, "Support request not found");
    ticket.updates = ticket.updates.filter((update) => update.visibility === "customer");
    return apiResponse(res, 200, "Support request fetched", { ticket });
});

export const cancelSupportResource = asyncHandler(async (req, res) => {
    const { resourceType, resourceId, reason } = req.body;

    if (resourceType === "order") {
        const order = await Order.findOne({ _id: resourceId, buyer: req.user._id });
        if (!order) throw new ApiError(404, "Order not found in your account");
        if (["cancelled", "delivered"].includes(order.status)) {
            throw new ApiError(400, `This order is already ${order.status}`);
        }

        if (order.payment?.status === "paid" || order.status === "shipped") {
            const ticket = await createCancellationReviewTicket({
                userId: req.user._id, resourceType, resourceId, reason,
            });
            return apiResponse(res, 202, "Cancellation needs support review", {
                outcome: "review_required",
                ticket,
            });
        }

        if (order.inventoryReserved) {
            await Promise.all(order.items.map((item) =>
                Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
            ));
            order.inventoryReserved = false;
        }
        order.status = "cancelled";
        order.cancellationReason = reason;
        await order.save();
        await createNotification({
            userId: req.user._id,
            type: "order_cancelled",
            title: "Order cancelled",
            message: `Your order #${order._id.toString().slice(-6).toUpperCase()} was cancelled through Mendly Support.`,
            relatedOrder: order._id,
            io: getIO(),
        });
        return apiResponse(res, 200, "Order cancelled", { outcome: "cancelled", order });
    }

    const booking = await Booking.findOne({ _id: resourceId, customer: req.user._id });
    if (!booking) throw new ApiError(404, "Repair booking not found in your account");
    if (["cancelled", "completed"].includes(booking.status)) {
        throw new ApiError(400, `This repair is already ${booking.status}`);
    }

    if (booking.payment?.status === "paid" || booking.status === "in_progress") {
        const ticket = await createCancellationReviewTicket({
            userId: req.user._id, resourceType, resourceId, reason,
        });
        return apiResponse(res, 202, "Cancellation needs support review", {
            outcome: "review_required",
            ticket,
        });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    await booking.save();
    await createNotification({
        userId: req.user._id,
        type: "booking_cancelled",
        title: "Repair booking cancelled",
        message: `Your repair booking #${booking._id.toString().slice(-6).toUpperCase()} was cancelled through Mendly Support.`,
        relatedBooking: booking._id,
        io: getIO(),
    });
    return apiResponse(res, 200, "Repair booking cancelled", { outcome: "cancelled", booking });
});

export const getAllSupportTickets = asyncHandler(async (req, res) => {
    const { status, type, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    const safeLimit = Math.min(Number(limit) || 20, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const [total, tickets] = await Promise.all([
        SupportTicket.countDocuments(filter),
        SupportTicket.find(filter)
            .populate("customer", "name email phone")
            .populate("relatedOrder", "status totalAmount")
            .populate("relatedBooking", "status trackingStatus scheduledAt")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit),
    ]);
    return apiResponse(res, 200, "Support requests fetched", {
        total, page: safePage, pages: Math.ceil(total / safeLimit), tickets,
    });
});

export const updateSupportTicket = asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw new ApiError(404, "Support request not found");
    const { status, priority, message, visibility } = req.body;

    if (status) {
        ticket.status = status;
        ticket.resolvedAt = ["resolved", "closed"].includes(status) ? new Date() : null;
    }
    if (priority) ticket.priority = priority;
    if (!ticket.assignedTo) ticket.assignedTo = req.user._id;
    if (message) ticket.updates.push({ message, author: req.user._id, visibility });
    await ticket.save();

    if (status || (message && visibility === "customer")) {
        await createNotification({
            userId: ticket.customer,
            type: "general",
            title: `Support ticket ${ticket.ticketNumber} updated`,
            message: message && visibility === "customer"
                ? message
                : `Your support request is now ${ticket.status.replace(/_/g, " ")}.`,
            relatedOrder: ticket.relatedOrder,
            relatedBooking: ticket.relatedBooking,
            io: getIO(),
        });
    }
    return apiResponse(res, 200, "Support request updated", { ticket });
});

export const testGroqAPI = asyncHandler(async (req, res) => {
    const result = await testGroqConnection();
    return apiResponse(res, result.success ? 200 : 503, result.message || result.error);
});
