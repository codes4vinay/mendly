import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import generateTokens from "../utils/generateTokens.js";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import { verifyEmailTemplate, forgotPasswordTemplate } from "../utils/emailTemplates.js";
import { refreshCookieClearOptions } from "../utils/refreshCookieOptions.js";

// ─── Register ─────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) throw new ApiError(400, "Email already registered");

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        role,
    });

    // send verification OTP automatically after register
    const { otp, otpExpires } = generateOtp();
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    user.otpPurpose = "verify_email";
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user.email,
        subject: "Verify your RPAR account",
        html: verifyEmailTemplate(otp),
    });

    const { accessToken } = await generateTokens(user._id, req.ip, res);

    return apiResponse(res, 201, "Registered successfully. OTP sent to your email.", {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
        },
        accessToken,
    });
});

// ─── Login ────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) throw new ApiError(401, "Invalid email or password");
    if (!user.isActive) throw new ApiError(401, "Account has been deactivated");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const { accessToken } = await generateTokens(user._id, req.ip, res);

    return apiResponse(res, 200, "Logged in successfully", {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
        },
        accessToken,
    });
});

// ─── Refresh Token ────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refresh_token;

    if (!token) throw new ApiError(401, "No refresh token found");

    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) throw new ApiError(401, "Invalid refresh token");
    if (savedToken.isRevoked) throw new ApiError(401, "Refresh token has been revoked");
    if (savedToken.expiresAt < new Date()) throw new ApiError(401, "Refresh token expired");

    savedToken.isRevoked = true;
    await savedToken.save();

    const { accessToken } = await generateTokens(savedToken.user, req.ip, res);

    return apiResponse(res, 200, "Token refreshed successfully", { accessToken });
});

// ─── Logout ───────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.refresh_token;

    if (token) {
        await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
    }

    res.clearCookie("refresh_token", refreshCookieClearOptions);

    return apiResponse(res, 200, "Logged out successfully");
});

// ─── Get Me ───────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) throw new ApiError(404, "User not found");

    return apiResponse(res, 200, "User fetched successfully", { user });
});

// ─── Update Profile ───────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone },
        { new: true }
    ).select("-__v");
    if (!user) throw new ApiError(404, "User not found");

    return apiResponse(res, 200, "Profile updated successfully", { user });
});

// ─── Change Password ──────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    await user.save();

    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    res.clearCookie("refresh_token", refreshCookieClearOptions);

    return apiResponse(res, 200, "Password changed successfully");
});

// ─── Send OTP ─────────────────────────────────────────────────
export const sendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, "User not found");

    if (purpose === "verify_email" && user.isEmailVerified) {
        throw new ApiError(400, "Email already verified");
    }

    const { otp, otpExpires } = generateOtp();

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    user.otpPurpose = purpose;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user.email,
        subject: purpose === "verify_email" ? "Verify your email" : "Reset your password",
        html: purpose === "verify_email"
            ? verifyEmailTemplate(otp)
            : forgotPasswordTemplate(otp),
    });

    return apiResponse(res, 200, "OTP sent successfully");
});

// ─── Verify OTP ───────────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select("+otpCode +otpExpires +otpPurpose");

    if (!user) throw new ApiError(404, "User not found");
    if (user.otpPurpose !== purpose) throw new ApiError(400, "Invalid OTP purpose");
    if (user.otpCode !== otp) throw new ApiError(400, "Invalid OTP");
    if (user.otpExpires < new Date()) throw new ApiError(400, "OTP has expired");

    if (purpose === "verify_email") {
        user.isEmailVerified = true;
    }

    // clear otp fields after successful verification
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = undefined;
    await user.save({ validateBeforeSave: false });

    return apiResponse(res, 200,
        purpose === "verify_email"
            ? "Email verified successfully"
            : "OTP verified successfully"
    );
});

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select("+otpCode +otpExpires +otpPurpose");
    if (!user) throw new ApiError(404, "User not found");

    // otpCode must be cleared — means OTP was verified
    if (user.otpCode) throw new ApiError(400, "Please verify OTP first");

    user.password = newPassword;
    await user.save();

    // revoke all refresh tokens — force re-login on all devices
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    res.clearCookie("refresh_token", refreshCookieClearOptions);

    return apiResponse(res, 200, "Password reset successfully");
});
