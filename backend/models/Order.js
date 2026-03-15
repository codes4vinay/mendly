import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
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
        inventoryReserved: { type: Boolean, default: false },
        deliveryAddress: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
        },
        cancellationReason: { type: String },
        deliveredAt: { type: Date, default: null },
    },
    { timestamps: true }
);

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ serviceCentre: 1, status: 1 });
orderSchema.index({ "payment.status": 1 });

export default mongoose.model("Order", orderSchema);
