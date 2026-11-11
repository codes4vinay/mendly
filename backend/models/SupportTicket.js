import crypto from "crypto";
import mongoose from "mongoose";

const ticketUpdateSchema = new mongoose.Schema(
    {
        message: { type: String, required: true, maxlength: 1000 },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        visibility: { type: String, enum: ["customer", "internal"], default: "customer" },
    },
    { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
    {
        ticketNumber: { type: String, unique: true, index: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: [
                "complaint",
                "feedback",
                "order_issue",
                "repair_issue",
                "refund_request",
                "return_request",
                "cancellation_request",
                "account_help",
                "general",
            ],
            required: true,
        },
        subject: { type: String, required: true, trim: true, maxlength: 120 },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        status: {
            type: String,
            enum: ["open", "in_progress", "waiting_on_customer", "resolved", "closed"],
            default: "open",
        },
        priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
        relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
        rating: { type: Number, min: 1, max: 5, default: null },
        contactPreference: { type: String, enum: ["email", "phone"], default: "email" },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        updates: { type: [ticketUpdateSchema], default: [] },
        resolvedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

supportTicketSchema.pre("validate", function setTicketNumber(next) {
    if (!this.ticketNumber) {
        const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
        this.ticketNumber = `MND-${new Date().getUTCFullYear()}-${suffix}`;
    }
    next();
});

supportTicketSchema.index({ customer: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
