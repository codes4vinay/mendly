import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema(
    {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        scheduledAt: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
            default: "pending",
        },
        trackingStatus: {
            type: String,
            enum: [
                "booking_placed",
                "pickup_scheduled",
                "device_picked_up",
                "under_repair",
                "repair_done",
                "out_for_delivery",
                "delivered",
            ],
            default: "booking_placed",
        },
        totalAmount: { type: Number, required: true, min: 0 },
        notes: { type: String },
        // Pickup details
        pickupAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        pickupContact: String,
        // Device details
        deviceDetails: {
            brand: String,
            model: String,
            issue: String,
        },
        devicePhotos: [{ type: String }],
        // Payment
        isPaid: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: ["cash", "upi", "card", "netbanking", "razorpay"], default: "cash" },
        paidAt: { type: Date, default: null },
        payment: {
            status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
            method: { type: String, enum: ["cash", "upi", "card", "netbanking", "razorpay"], default: "cash" },
            provider: { type: String, default: null },
            transactionId: { type: String, default: null },
            razorpayOrderId: { type: String, default: null },
            razorpayPaymentId: { type: String, default: null },
            razorpaySignature: { type: String, default: null },
            paidAt: { type: Date, default: null },
        },
        // Tracking timeline
        tracking: {
            timeline: [timelineEntrySchema],
        },
        cancellationReason: { type: String },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ serviceCentre: 1, status: 1 });
bookingSchema.index({ scheduledAt: 1 });
bookingSchema.index({ "payment.status": 1 });

export default mongoose.model("Booking", bookingSchema);
