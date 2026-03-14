import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        description: { type: String },
        category: {
            type: String,
            required: true,
            enum: [
                "mobile",
                "laptop",
                "tv",
                "gaming_console",
                "appliance",
                "tablet",
                "smartwatch",
                "accessories",
                "spare_parts",
                "other",
            ],
        },
        condition: {
            type: String,
            required: true,
            enum: ["new", "like_new", "good", "fair"],
        },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, default: 1, min: 0 },
        photos: [{ type: String }],
        rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productSchema.index({ serviceCentre: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);