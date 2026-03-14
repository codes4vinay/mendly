import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        phone: { type: String },
        role: { type: String, enum: ["user", "service", "admin"], default: "user" },
        avatar: { type: String, default: null },
        isActive: { type: Boolean, default: true },

        // email verification
        isEmailVerified: { type: Boolean, default: false },

        // otp fields — select: false so never returned in queries
        otpCode: { type: String, select: false },
        otpExpires: { type: Date, select: false },
        otpPurpose: { type: String, select: false }, 
    },
    { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export default mongoose.model("User", userSchema);