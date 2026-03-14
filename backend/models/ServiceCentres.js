import mongoose from "mongoose";

const serviceCentreSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    ownerName: { type: String, required: true },
    ownerContact: { type: String, required: true }, 
    address: { type: String, required: true },
    servicesAvailable: [{ type: String }], 
    contact: { type: String, required: true }, 
    rating: { type: Number, min: 0, max: 5, default: 0 }, 
    starRating: { type: Number, min: 0, max: 5, default: 0 }, 
    mainServices: [{ type: String }], 
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true }, 
    reviews: [{ type: String }],
    email: { type: String, required: true, unique: true },
    gstin: { type: String }, 
    photos: [{ type: String }], 
    videos: [{ type: String }], 
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ServiceCentre", serviceCentreSchema);
