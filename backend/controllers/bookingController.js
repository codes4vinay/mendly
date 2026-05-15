import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
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

// Create Booking
export const createBooking = asyncHandler(async (req, res) => {
    const {
        service: serviceId,
        serviceCentre,
        scheduledAt,
        totalAmount,
        notes,
        pickupAddress,
        pickupContact,
        deviceDetails,
        devicePhotos,
        paymentMethod = "cash",
    } = req.body;

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
        pickupAddress,
        pickupContact,
        deviceDetails,
        devicePhotos,
        isPaid: false,
        paymentMethod,
        payment: {
            status: "pending",
            method: paymentMethod,
            provider: paymentMethod === "razorpay" ? "razorpay" : null,
        },
        tracking: {
            timeline: [
                {
                    status: "booking_placed",
                    message: "Booking placed successfully",
                    timestamp: new Date(),
                },
            ],
        },
    });

    if (paymentMethod === "cash") {
        await createNotification({
            userId: req.user._id,
            type: "booking_created",
            title: "Booking Created",
            message: `Your service booking has been created successfully. Scheduled for ${new Date(scheduledAt).toLocaleDateString()}.`,
            relatedBooking: booking._id,
            io: getIO(),
        });

        return apiResponse(res, 201, "Booking created successfully", {
            booking,
            paymentRequired: false,
        });
    }

    ensureRazorpayConfigured();

    const razorpayOrder = await createRazorpayOrder({
        amount: Math.round(totalAmount * 100),
        receipt: `booking_${booking._id}`,
        notes: {
            entityType: "booking",
            entityId: booking._id.toString(),
            customerId: req.user._id.toString(),
        },
    });

    booking.payment.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return apiResponse(res, 201, "Booking created. Complete payment to confirm.", {
        booking,
        paymentRequired: true,
        checkout: buildRazorpayCheckoutPayload({
            razorpayOrder,
            publicConfig: getRazorpayPublicConfig(),
            entityName: "RPAR Booking",
        }),
    });
});

// Get My Bookings
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

// Get Centre Bookings
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

// Get Single Booking
export const getBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("service", "name category price")
        .populate("serviceCentre", "name address phone")
        .populate("customer", "name email phone");

    if (!booking) throw new ApiError(404, "Booking not found");

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isCentre = booking.serviceCentre.toString() === req.user._id.toString();
    if (!isCustomer && !isCentre && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to view this booking");
    }

    return apiResponse(res, 200, "Booking fetched successfully", { booking });
});

// Update Booking Status
export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, trackingStatus, trackingMessage, isPaid, paymentMethod, cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id)
        .populate("serviceCentre", "owner")
        .populate("customer", "_id");
    if (!booking) throw new ApiError(404, "Booking not found");

    if (req.user.role === "user") {
        if (booking.customer._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to update this booking");
        }
        if (status && status !== "cancelled") {
            throw new ApiError(400, "Users can only cancel bookings");
        }
        if (status === "cancelled" && booking.payment?.status === "paid") {
            throw new ApiError(400, "Paid online bookings cannot be cancelled automatically yet");
        }
    } else if (req.user.role === "service") {
        if (booking.serviceCentre.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to update this booking");
        }
    }

    const oldStatus = booking.status;

    if (status === "cancelled") {
        booking.cancellationReason = cancellationReason;
    }

    if (status === "completed") {
        booking.completedAt = new Date();
    }

    if (status) {
        booking.status = status;
    }

    if (trackingStatus) {
        booking.trackingStatus = trackingStatus;
        if (!booking.tracking) {
            booking.tracking = { timeline: [] };
        }
        booking.tracking.timeline.push({
            status: trackingStatus,
            message: trackingMessage || trackingStatus.replace(/_/g, " "),
            timestamp: new Date(),
        });
    }

    if (isPaid !== undefined) {
        booking.isPaid = isPaid;
        if (isPaid) {
            booking.paidAt = new Date();
            if (booking.payment) {
                booking.payment.status = "paid";
                booking.payment.paidAt = booking.paidAt;
            }
        }
    }

    if (paymentMethod) {
        booking.paymentMethod = paymentMethod;
        if (booking.payment) {
            booking.payment.method = paymentMethod;
        }
    }

    await booking.save();

    if (status && status !== oldStatus) {
        const notificationMap = {
            confirmed: {
                title: "Booking Confirmed",
                message: "Your service booking has been confirmed by the service centre.",
                type: "booking_confirmed",
                notifyCustomer: true,
            },
            cancelled: {
                title: "Booking Cancelled",
                message: `Your booking has been cancelled. Reason: ${cancellationReason || "No reason provided"}`,
                type: "booking_cancelled",
                notifyCustomer: true,
            },
            completed: {
                title: "Booking Completed",
                message: "Your service booking has been completed successfully.",
                type: "booking_completed",
                notifyCustomer: true,
            },
            in_progress: {
                title: "Service In Progress",
                message: "Your service is now in progress.",
                type: "booking_confirmed",
                notifyCustomer: true,
            },
        };

        const notification = notificationMap[status];
        if (notification && notification.notifyCustomer) {
            await createNotification({
                userId: booking.customer._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                relatedBooking: booking._id,
                io: getIO(),
            });
        }
    }

    return apiResponse(res, 200, "Booking status updated successfully", { booking });
});

// Verify Booking Payment
export const verifyBookingPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.customer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to verify this booking payment");
    }
    if (booking.payment?.method !== "razorpay") {
        throw new ApiError(400, "This booking does not use Razorpay");
    }
    if (booking.payment?.status === "paid") {
        return apiResponse(res, 200, "Booking payment already verified", { booking });
    }
    if (booking.payment?.razorpayOrderId !== razorpayOrderId) {
        throw new ApiError(400, "Payment order mismatch");
    }

    const isValid = verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });
    if (!isValid) {
        booking.payment.status = "failed";
        await booking.save();
        throw new ApiError(400, "Payment verification failed");
    }

    booking.isPaid = true;
    booking.paymentMethod = "razorpay";
    booking.paidAt = new Date();
    booking.payment.status = "paid";
    booking.payment.transactionId = razorpayPaymentId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.payment.paidAt = booking.paidAt;
    await booking.save();

    await createNotification({
        userId: req.user._id,
        type: "booking_created",
        title: "Payment Successful",
        message: `Payment received for your service booking scheduled on ${new Date(booking.scheduledAt).toLocaleDateString()}.`,
        relatedBooking: booking._id,
        io: getIO(),
    });

    return apiResponse(res, 200, "Booking payment verified successfully", { booking });
});
