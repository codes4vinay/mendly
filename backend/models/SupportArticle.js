import mongoose from "mongoose";

const supportArticleSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        summary: { type: String, required: true, trim: true, maxlength: 240 },
        content: { type: String, required: true, trim: true, maxlength: 5000 },
        category: {
            type: String,
            enum: ["account", "orders", "repairs", "payments", "returns_refunds", "support", "safety", "general"],
            required: true,
        },
        intents: [{ type: String, trim: true, lowercase: true }],
        keywords: [{ type: String, trim: true, lowercase: true }],
        audience: { type: String, enum: ["all", "customer", "provider"], default: "all" },
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        version: { type: Number, min: 1, default: 1 },
        publishedAt: { type: Date, default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        isSystemDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

supportArticleSchema.pre("save", function manageVersion(next) {
    const contentChanged = !this.isNew && [
        "title", "summary", "content", "category", "intents", "keywords", "audience",
    ].some((path) => this.isModified(path));
    if (contentChanged) this.version += 1;
    if (this.status === "published" && (!this.publishedAt || contentChanged)) this.publishedAt = new Date();
    if (this.status !== "published") this.publishedAt = null;
    next();
});

supportArticleSchema.index({ status: 1, audience: 1, category: 1 });
supportArticleSchema.index({ title: "text", summary: "text", content: "text", keywords: "text" });

export default mongoose.model("SupportArticle", supportArticleSchema);
