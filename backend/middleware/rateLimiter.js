import rateLimit from "express-rate-limit";

// Global limiter — applied to all routes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per 15 min
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth limiter — stricter, only on login and register
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // only 10 attempts per 15 min
    message: { success: false, message: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});