import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        // Participants
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        serviceCentre: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCentre", required: true },
        serviceOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Messages
        messages: [
            {
                sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                senderRole: { type: String, enum: ["user", "service"], required: true },
                message: { type: String, required: true },
                isRead: { type: Boolean, default: false },
                attachments: [{ type: String }],
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // Metadata
        lastMessage: { type: String },
        lastMessageAt: { type: Date },
        userUnreadCount: { type: Number, default: 0 },
        ownerUnreadCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes for faster queries
chatSchema.index({ user: 1, serviceCentre: 1 });
chatSchema.index({ user: 1 });
chatSchema.index({ serviceOwner: 1 });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Chat", chatSchema);
