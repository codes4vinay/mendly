import mongoose from "mongoose";

const serviceCentreSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        gstin: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
        },
        workingHours: {
            open: { type: String, default: "09:00" },
            close: { type: String, default: "18:00" },
        },
        photos: [{ type: String }],
        rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

serviceCentreSchema.index({ owner: 1 });
serviceCentreSchema.index({ "address.city": 1 });
serviceCentreSchema.index({ isActive: 1 });

export default mongoose.model("ServiceCentre", serviceCentreSchema);