import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            required: true,
            enum: [
                "booking_created",
                "booking_confirmed",
                "booking_cancelled",
                "booking_completed",
                "order_created",
                "order_confirmed",
                "order_shipped",
                "order_delivered",
                "order_cancelled",
                "new_review",
                "general",
            ],
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
        relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);