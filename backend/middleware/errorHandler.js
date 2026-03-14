import ApiError from "../utils/apiError.js";

// 404 handler — catches requests to routes that don't exist
export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Global error handler — catches everything passed via next(error)
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
        // only show error stack in development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};