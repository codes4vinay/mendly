import express from "express";
import * as authController from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import protect from "../middleware/protect.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

// ─── Public routes ─────────────────────────────────────────────
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/send-otp", authLimiter, authController.sendOtp);
router.post("/verify-otp", authLimiter, authController.verifyOtp);
router.post("/reset-password", authLimiter, authController.resetPassword);

// ─── Protected routes ──────────────────────────────────────────
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);

export default router;