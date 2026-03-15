import { z } from "zod";

export const createBookingSchema = z.object({
    service: z.string({ required_error: "Service is required" }),
    serviceCentre: z.string({ required_error: "Service centre is required" }),
    scheduledAt: z
        .string({ required_error: "Scheduled date is required" })
        .refine((val) => new Date(val) > new Date(), {
            message: "Scheduled date must be in the future",
        }),
    totalAmount: z.number({ required_error: "Total amount is required" }).min(0),
    notes: z.string().max(500).optional(),
    // Pickup details
    pickupAddress: z
        .object({
            street: z.string().optional(),
            city: z.string({ required_error: "City is required" }),
            state: z.string().optional(),
            pincode: z.string({ required_error: "Pincode is required" }),
        })
        .optional(),
    pickupContact: z.string({ required_error: "Pickup contact is required" }),
    paymentMethod: z.enum(["cash", "upi", "card", "netbanking", "razorpay"]).optional(),
    devicePhotos: z.array(z.string().url()).optional(),
    // Device details
    deviceDetails: z
        .object({
            brand: z.string().optional(),
            model: z.string().optional(),
            issue: z.string({ required_error: "Device issue is required" }),
        })
        .optional(),
});

export const updateBookingStatusSchema = z.object({
    status: z
        .enum(
            ["pending", "confirmed", "in_progress", "completed", "cancelled"],
            { message: "Invalid status" }
        )
        .optional(),
    trackingStatus: z
        .enum(
            [
                "booking_placed",
                "pickup_scheduled",
                "device_picked_up",
                "under_repair",
                "repair_done",
                "out_for_delivery",
                "delivered",
            ],
            { message: "Invalid tracking status" }
        )
        .optional(),
    trackingMessage: z.string().optional(),
    isPaid: z.boolean().optional(),
    paymentMethod: z.enum(["cash", "upi", "card", "netbanking", "razorpay"]).optional(),
    cancellationReason: z.string().max(300).optional(),
});

export const verifyBookingPaymentSchema = z.object({
    razorpayOrderId: z.string({ required_error: "Razorpay order ID is required" }),
    razorpayPaymentId: z.string({ required_error: "Razorpay payment ID is required" }),
    razorpaySignature: z.string({ required_error: "Razorpay signature is required" }),
});
