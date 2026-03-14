import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name too long")
        .trim(),
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[!@#$%^&*]/, "Must contain at least one special character"),
    phone: z
        .string()
        .regex(/^\+?[\d\s\-]{7,15}$/, "Invalid phone number")
        .optional(),
    role: z
        .enum(["user", "service"], { message: "Role must be user or service" })
        .default("user"),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required"),
});

export const sendOtpSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    purpose: z.enum(["verify_email", "forgot_password"], {
        message: "Purpose must be verify_email or forgot_password",
    }),
});

export const verifyOtpSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    otp: z
        .string({ required_error: "OTP is required" })
        .length(6, "OTP must be 6 digits"),
    purpose: z.enum(["verify_email", "forgot_password"], {
        message: "Purpose must be verify_email or forgot_password",
    }),
});

export const resetPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[!@#$%^&*]/, "Must contain at least one special character"),
});


