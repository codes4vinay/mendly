import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }, 
    serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCentre', required: true }, 
    date: { type: Date, required: true }, 
    time: { type: String, required: true }, 
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" }, 
    notes: { type: String }, 
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
