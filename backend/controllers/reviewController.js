import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Order from "../models/Order.js";
import Service from "../models/Service.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Review ────────────────────────────────────────────
export const createReview = asyncHandler(async (req, res) => {
    const { rating, comment, service, product, booking, order } = req.body;

    // verify booking is completed before reviewing service
    if (booking) {
        const b = await Booking.findById(booking);
        if (!b) throw new ApiError(404, "Booking not found");
        if (b.status !== "completed") throw new ApiError(400, "Can only review completed bookings");
        if (b.customer.toString() !== req.user._id.toString()) throw new ApiError(403, "Not your booking");
    }

    // verify order is delivered before reviewing product
    if (order) {
        const o = await Order.findById(order);
        if (!o) throw new ApiError(404, "Order not found");
        if (o.status !== "delivered") throw new ApiError(400, "Can only review delivered orders");
        if (o.buyer.toString() !== req.user._id.toString()) throw new ApiError(403, "Not your order");
    }

    // check if already reviewed
    const existing = await Review.findOne({
        customer: req.user._id,
        ...(service ? { service } : { product }),
    });
    if (existing) throw new ApiError(400, "You have already reviewed this");

    const review = await Review.create({
        customer: req.user._id,
        rating, comment, service, product, booking, order,
    });

    // update rating on service or product
    if (service) await updateRating(Service, service);
    if (product) await updateRating(Product, product);

    return apiResponse(res, 201, "Review created successfully", { review });
});

// helper to recalculate rating
const updateRating = async (Model, id) => {
    const reviews = await Review.find({
        ...(Model.modelName === "Service" ? { service: id } : { product: id }),
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Model.findByIdAndUpdate(id, {
        "rating.average": Math.round(avg * 10) / 10,
        "rating.count": reviews.length,
    });
};

// ─── Get Reviews For Service ──────────────────────────────────
export const getServiceReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ service: req.params.serviceId, isVisible: true })
        .populate("customer", "name avatar")
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Reviews fetched successfully", { reviews });
});

// ─── Get Reviews For Product ──────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId, isVisible: true })
        .populate("customer", "name avatar")
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Reviews fetched successfully", { reviews });
});

// ─── Delete Review ────────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, "Review not found");

    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to delete this review");
    }

    await review.deleteOne();

    if (review.service) await updateRating(Service, review.service);
    if (review.product) await updateRating(Product, review.product);

    return apiResponse(res, 200, "Review deleted successfully");
});