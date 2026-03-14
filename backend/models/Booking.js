import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        scheduledAt: { type: Date, required: true },
        status: { type: String, enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"], default: "pending" },
        totalAmount: { type: Number, required: true, min: 0 },
        notes: { type: String },
        cancellationReason: { type: String },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ serviceCentre: 1, status: 1 });
bookingSchema.index({ scheduledAt: 1 });

export default mongoose.model("Booking", bookingSchema);