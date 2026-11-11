import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid record ID");

export const sendSupportMessageSchema = z.object({
    conversationId: objectId,
    message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long"),
});

export const createSupportTicketSchema = z
    .object({
        type: z.enum([
            "complaint",
            "feedback",
            "order_issue",
            "repair_issue",
            "refund_request",
            "return_request",
            "cancellation_request",
            "account_help",
            "general",
        ]),
        subject: z.string().trim().min(4, "Please add a short subject").max(120),
        message: z.string().trim().min(10, "Please describe the issue in a little more detail").max(2000),
        relatedOrder: objectId.optional().nullable(),
        relatedBooking: objectId.optional().nullable(),
        rating: z.number().int().min(1).max(5).optional().nullable(),
        contactPreference: z.enum(["email", "phone"]).default("email"),
    })
    .refine((data) => !(data.relatedOrder && data.relatedBooking), {
        message: "A ticket can be linked to either an order or a repair, not both",
    })
    .refine((data) => data.type !== "feedback" || Boolean(data.rating), {
        message: "Please include a rating with feedback",
    });

export const cancelSupportResourceSchema = z.object({
    resourceType: z.enum(["order", "booking"]),
    resourceId: objectId,
    reason: z.string().trim().min(5, "Please provide a cancellation reason").max(500),
    confirmation: z.literal("CONFIRM_CANCEL", {
        errorMap: () => ({ message: "Explicit cancellation confirmation is required" }),
    }),
});

export const updateSupportTicketSchema = z.object({
    status: z.enum(["open", "in_progress", "waiting_on_customer", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    message: z.string().trim().min(2).max(1000).optional(),
    visibility: z.enum(["customer", "internal"]).default("customer"),
}).refine((data) => data.status || data.priority || data.message, {
    message: "Add a status, priority, or update message",
});
