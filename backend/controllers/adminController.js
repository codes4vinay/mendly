import User from "../models/User.js";
import ServiceCentre from "../models/ServiceCentre.js";
import Booking from "../models/Booking.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Dashboard Stats ──────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalCentres, totalBookings, totalOrders] = await Promise.all([
        User.countDocuments(),
        ServiceCentre.countDocuments(),
        Booking.countDocuments(),
        Order.countDocuments(),
    ]);

    return apiResponse(res, 200, "Stats fetched successfully", {
        totalUsers,
        totalCentres,
        totalBookings,
        totalOrders,
    });
});

// ─── Get All Users ────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Users fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        users,
    });
});

// ─── Toggle User Status ───────────────────────────────────────
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.isActive = !user.isActive;
    await user.save();

    return apiResponse(res, 200, `User ${user.isActive ? "activated" : "deactivated"} successfully`);
});

// ─── Get All Service Centres ──────────────────────────────────
export const getAllServiceCentres = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const total = await ServiceCentre.countDocuments();
    const centres = await ServiceCentre.find()
        .populate("owner", "name email")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Service centres fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        serviceCentres: centres,
    });
});

// ─── Toggle Service Centre Status ─────────────────────────────
export const toggleServiceCentreStatus = asyncHandler(async (req, res) => {
    const centre = await ServiceCentre.findById(req.params.id);
    if (!centre) throw new ApiError(404, "Service centre not found");

    centre.isActive = !centre.isActive;
    await centre.save();

    return apiResponse(res, 200, `Service centre ${centre.isActive ? "activated" : "deactivated"} successfully`);
});

// ─── Get All Bookings ─────────────────────────────────────────
export const getAllBookings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
        .populate("customer", "name email phone")
        .populate("service", "name category")
        .populate("serviceCentre", "name address")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Bookings fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        bookings,
    });
});

// ─── Get All Orders ───────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate("buyer", "name email phone")
        .populate("serviceCentre", "name address")
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

// ─── Get All Reviews ──────────────────────────────────────────
export const getAllReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
        .populate("customer", "name email")
        .populate("service", "name")
        .populate("product", "name")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Reviews fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        reviews,
    });
});

// ─── Toggle Review Visibility ─────────────────────────────────
export const toggleReviewVisibility = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, "Review not found");

    review.isVisible = !review.isVisible;
    await review.save();

    return apiResponse(res, 200, `Review ${review.isVisible ? "shown" : "hidden"} successfully`);
});