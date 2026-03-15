import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new ApiError(401, "Not authorized, no token");

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) throw new ApiError(401, "User no longer exists");
        if (!user.isActive) throw new ApiError(401, "Account has been deactivated");
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") throw new ApiError(401, "Token expired");
        if (error.name === "JsonWebTokenError") throw new ApiError(401, "Invalid token");
        throw new ApiError(401, "Not authorized");
    }
});

// separate middleware for email verification
export const requireEmailVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email first");
    }
    next();
};

export default protect;