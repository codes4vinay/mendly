import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    centre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
