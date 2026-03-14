import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Order ─────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
    const { serviceCentre, items, totalAmount, payment, deliveryAddress } = req.body;

    // verify all products exist and have enough stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) throw new ApiError(404, `Product ${item.product} not found`);
        if (product.stock < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    const order = await Order.create({
        buyer: req.user._id,
        serviceCentre,
        items,
        totalAmount,
        payment,
        deliveryAddress,
    });

    // reduce stock for each product
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
        });
    }

    return apiResponse(res, 201, "Order placed successfully", { order });
});

// ─── Get My Orders (buyer) ────────────────────────────────────
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

// ─── Get Centre Orders (service owner) ───────────────────────
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

// ─── Get Single Order ─────────────────────────────────────────
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

// ─── Update Order Status ──────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, cancellationReason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    if (status === "cancelled") {
        order.cancellationReason = cancellationReason;
        // restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }
    }

    if (status === "delivered") {
        order.deliveredAt = new Date();
        order.payment.status = "paid";
        order.payment.paidAt = new Date();
    }

    order.status = status;
    await order.save();

    return apiResponse(res, 200, "Order status updated successfully", { order });
});