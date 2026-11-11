import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 1000 : 100,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 50 : 10,
    message: { success: false, message: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

export const supportLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 120 : 30,
    message: { success: false, message: "Too many support requests. Please wait a moment." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const supportWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 40 : 8,
    message: { success: false, message: "Too many support actions. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
