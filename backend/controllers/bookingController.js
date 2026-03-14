import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Booking ───────────────────────────────────────────
export const createBooking = asyncHandler(async (req, res) => {
    const { service: serviceId, serviceCentre, scheduledAt, totalAmount, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) throw new ApiError(404, "Service not found");
    if (!service.isActive) throw new ApiError(400, "Service is not available");

    const booking = await Booking.create({
        customer: req.user._id,
        service: serviceId,
        serviceCentre,
        scheduledAt,
        totalAmount,
        notes,
    });

    return apiResponse(res, 201, "Booking created successfully", { booking });
});

// ─── Get My Bookings (customer) ───────────────────────────────
export const getMyBookings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
        .populate("service", "name category price")
        .populate("serviceCentre", "name address phone")
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

// ─── Get Centre Bookings (service owner) ──────────────────────
export const getCentreBookings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { serviceCentre: req.params.centreId };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
        .populate("customer", "name email phone")
        .populate("service", "name category price")
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

// ─── Get Single Booking ───────────────────────────────────────
export const getBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("service", "name category price")
        .populate("serviceCentre", "name address phone")
        .populate("customer", "name email phone");

    if (!booking) throw new ApiError(404, "Booking not found");

    // only customer or service centre owner can view
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isCentre = booking.serviceCentre.toString() === req.user._id.toString();
    if (!isCustomer && !isCentre && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to view this booking");
    }

    return apiResponse(res, 200, "Booking fetched successfully", { booking });
});

// ─── Update Booking Status ────────────────────────────────────
export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");

    // only service centre can confirm/complete, customer can cancel
    if (status === "cancelled") {
        booking.cancellationReason = cancellationReason;
    }

    if (status === "completed") {
        booking.completedAt = new Date();
    }

    booking.status = status;
    await booking.save();

    return apiResponse(res, 200, "Booking status updated successfully", { booking });
});