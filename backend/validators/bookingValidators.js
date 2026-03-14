import { z } from "zod";

export const createBookingSchema = z.object({
    service: z.string({ required_error: "Service is required" }),
    serviceCentre: z.string({ required_error: "Service centre is required" }),
    scheduledAt: z
        .string({ required_error: "Scheduled date is required" })
        .refine((val) => new Date(val) > new Date(), {
            message: "Scheduled date must be in the future",
        }),
    totalAmount: z.number({ required_error: "Total amount is required" }).min(0),
    notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
    status: z.enum(
        ["pending", "confirmed", "in_progress", "completed", "cancelled"],
        { message: "Invalid status" }
    ),
    cancellationReason: z.string().max(300).optional(),
});