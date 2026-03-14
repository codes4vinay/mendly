import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    photos: [{ type: String }], 
    videos: [{ type: String }], 
    availableAt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCentre' }], 
    serviceCentres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCentre' }], 
    contact: { type: String, required: true },
    mostBooked: { type: Boolean, default: false }, 
    ratings: { type: Number, min: 0, max: 5, default: 0 }, 
    reviews: [{ type: String }], 
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Service", serviceSchema);
