import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true, maxlength: 2000 },
        intent: { type: String, default: "general" },
        suggestedActions: [{ type: String }],
    },
    { timestamps: true, _id: false }
);

const supportConversationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messages: { type: [supportMessageSchema], default: [] },
        lastActivityAt: { type: Date, default: Date.now },
        closedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

supportConversationSchema.index({ user: 1, closedAt: 1, lastActivityAt: -1 });

export default mongoose.model("SupportConversation", supportConversationSchema);
