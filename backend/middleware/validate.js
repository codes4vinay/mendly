import ApiError from "../utils/apiError.js";

// Takes a zod schema and returns a middleware
// Usage in routes: router.post("/register", validate(registerSchema), authController.register)
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        // pulls first error message from zod and sends it back
        const message = result.error.errors[0].message;
        return next(new ApiError(400, message));
    }

    req.body = result.data; // replaces body with cleaned/parsed zod data
    next();
};

export default validate;