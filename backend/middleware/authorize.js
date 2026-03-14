import ApiError from "../utils/apiError.js";

// Role based access control
// Usage in routes: router.post("/", protect, authorize("service", "admin"), controller)
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new ApiError(403, `Role '${req.user.role}' is not allowed to access this route`);
    }
    next();
};

export default authorize;