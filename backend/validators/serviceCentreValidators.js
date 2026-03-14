import { z } from "zod";

export const createServiceCentreSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(3, "Name too short").max(100, "Name too long").trim(),
    email: z.string({ required_error: "Email is required" }).email("Invalid email").toLowerCase().trim(),
    phone: z.string({ required_error: "Phone is required" }).regex(/^\+?[\d\s\-]{7,15}$/, "Invalid phone number"),
    gstin: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string({ required_error: "City is required" }),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }),
    workingHours: z.object({
        open: z.string().default("09:00"),
        close: z.string().default("18:00"),
    }).optional(),
});

export const updateServiceCentreSchema = createServiceCentreSchema.partial();
// .partial() makes all fields optional for updates