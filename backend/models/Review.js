import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", default: null },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
        booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

reviewSchema.index({ service: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ customer: 1 });

export default mongoose.model("Review", reviewSchema);