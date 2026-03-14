import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        name: { type: String, required: true },
        description: { type: String },
        category: {
            type: String,
            required: true,
            enum: [
                "mobile_repair",
                "laptop_repair",
                "tv_repair",
                "gaming_console_repair",
                "appliance_repair",
                "tablet_repair",
                "smartwatch_repair",
                "printer_repair",
                "other_electronics",
            ],
        },
        price: { type: Number, required: true, min: 0 },
        priceType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
        photos: [{ type: String }],
        rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        isMostBooked: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

serviceSchema.index({ serviceCentre: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

export default mongoose.model("Service", serviceSchema);