import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { createNotification } from "../utils/createNotification.js";
import { getIO } from "../utils/ioInstance.js";
import { buildRazorpayCheckoutPayload } from "../utils/paymentResponse.js";
import {
    createRazorpayOrder,
    getRazorpayPublicConfig,
    verifyRazorpaySignature,
} from "../utils/razorpay.js";

const ensureRazorpayConfigured = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(503, "Razorpay test mode is not configured on the server");
    }
};

const ensureStockAvailable = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) throw new ApiError(404, `Product ${item.product} not found`);
        if (product.stock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for ${product.name}`);
        }
    }
};

const reserveInventory = async (items) => {
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
        });
    }
};

// Create Order
export const createOrder = asyncHandler(async (req, res) => {
    const { serviceCentre, items, totalAmount, payment, deliveryAddress } = req.body;
    const paymentMethod = payment?.method || "cash";

    await ensureStockAvailable(items);

    const order = await Order.create({
        buyer: req.user._id,
        serviceCentre,
        items,
        totalAmount,
        payment: {
            status: "pending",
            method: paymentMethod,
            provider: paymentMethod === "razorpay" ? "razorpay" : null,
        },
        deliveryAddress,
    });

    if (paymentMethod === "cash") {
        await reserveInventory(items);
        order.inventoryReserved = true;
        await order.save();

        await createNotification({
            userId: req.user._id,
            type: "order_created",
            title: "Order Placed",
            message: `Your order has been placed successfully. Total amount: Rs. ${totalAmount}. Awaiting confirmation.`,
            relatedOrder: order._id,
            io: getIO(),
        });

        return apiResponse(res, 201, "Order placed successfully", {
            order,
            paymentRequired: false,
        });
    }

    ensureRazorpayConfigured();

    const razorpayOrder = await createRazorpayOrder({
        amount: Math.round(totalAmount * 100),
        receipt: `order_${order._id}`,
        notes: {
            entityType: "order",
            entityId: order._id.toString(),
            buyerId: req.user._id.toString(),
        },
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return apiResponse(res, 201, "Order created. Complete payment to confirm.", {
        order,
        paymentRequired: true,
        checkout: buildRazorpayCheckoutPayload({
            razorpayOrder,
            publicConfig: getRazorpayPublicConfig(),
            entityName: "RPAR Order",
        }),
    });
});

// Get My Orders
export const getMyOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { buyer: req.user._id };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate("items.product", "name photos price")
        .populate("serviceCentre", "name address phone")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Orders fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        orders,
    });
});

// Get Centre Orders
export const getCentreOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { serviceCentre: req.params.centreId };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate("buyer", "name email phone")
        .populate("items.product", "name price")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Orders fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        orders,
    });
});

// Get Single Order
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("buyer", "name email phone")
        .populate("items.product", "name photos price")
        .populate("serviceCentre", "name address phone");

    if (!order) throw new ApiError(404, "Order not found");

    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    if (!isBuyer && req.user.role !== "admin" && req.user.role !== "service") {
        throw new ApiError(403, "Not authorized to view this order");
    }

    return apiResponse(res, 200, "Order fetched successfully", { order });
});

// Update Order Status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, cancellationReason } = req.body;

    const order = await Order.findById(req.params.id)
        .populate("serviceCentre", "owner")
        .populate("buyer", "_id");
    if (!order) throw new ApiError(404, "Order not found");

    const oldStatus = order.status;

    if (req.user.role === "user") {
        if (order.buyer._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to cancel this order");
        }
        if (status !== "cancelled") throw new ApiError(400, "Users can only cancel orders");
        if (status === "cancelled" && order.payment?.status === "paid") {
            throw new ApiError(400, "Paid online orders cannot be cancelled automatically yet");
        }
    } else if (req.user.role === "service") {
        if (order.serviceCentre.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to update this order");
        }
    }

    if (status === "cancelled") {
        order.cancellationReason = cancellationReason;
        if (order.inventoryReserved) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
            order.inventoryReserved = false;
        }
    }

    if (status === "delivered") {
        order.deliveredAt = new Date();
        if (order.payment?.method === "cash" && order.payment?.status !== "paid") {
            order.payment.status = "paid";
            order.payment.paidAt = new Date();
        }
    }

    order.status = status;
    await order.save();

    if (status && status !== oldStatus) {
        const notificationMap = {
            confirmed: {
                title: "Order Confirmed",
                message: "Your order has been confirmed. It will be shipped soon.",
                type: "order_confirmed",
            },
            shipped: {
                title: "Order Shipped",
                message: "Your order has been shipped and is on the way to you.",
                type: "order_shipped",
            },
            delivered: {
                title: "Order Delivered",
                message: "Your order has been delivered successfully. Thank you for shopping with us!",
                type: "order_delivered",
            },
            cancelled: {
                title: "Order Cancelled",
                message: `Your order has been cancelled. Reason: ${cancellationReason || "No reason provided"}`,
                type: "order_cancelled",
            },
        };

        const notification = notificationMap[status];
        if (notification) {
            await createNotification({
                userId: order.buyer._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                relatedOrder: order._id,
                io: getIO(),
            });
        }
    }

    return apiResponse(res, 200, "Order status updated successfully", { order });
});

// Verify Order Payment
export const verifyOrderPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to verify this order payment");
    }
    if (order.payment?.method !== "razorpay") {
        throw new ApiError(400, "This order does not use Razorpay");
    }
    if (order.payment?.status === "paid") {
        return apiResponse(res, 200, "Order payment already verified", { order });
    }
    if (order.payment?.razorpayOrderId !== razorpayOrderId) {
        throw new ApiError(400, "Payment order mismatch");
    }

    const isValid = verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });
    if (!isValid) {
        order.payment.status = "failed";
        await order.save();
        throw new ApiError(400, "Payment verification failed");
    }

    await ensureStockAvailable(order.items);
    await reserveInventory(order.items);

    order.inventoryReserved = true;
    order.payment.status = "paid";
    order.payment.transactionId = razorpayPaymentId;
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();
    await order.save();

    await createNotification({
        userId: req.user._id,
        type: "order_created",
        title: "Payment Successful",
        message: `Payment received for your order of Rs. ${order.totalAmount}. Awaiting confirmation.`,
        relatedOrder: order._id,
        io: getIO(),
    });

    return apiResponse(res, 200, "Order payment verified successfully", { order });
});
