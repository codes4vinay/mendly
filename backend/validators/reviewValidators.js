import { z } from "zod";

export const createReviewSchema = z.object({
    rating: z.number({ required_error: "Rating is required" }).min(1).max(5),
    comment: z.string().max(500).optional(),

    // one of these must be present
    service: z.string().optional(),
    product: z.string().optional(),

    // one of these must be present
    booking: z.string().optional(),
    order: z.string().optional(),
}).refine(
    (data) => data.service || data.product,
    { message: "Either service or product is required" }
).refine(
    (data) => data.booking || data.order,
    { message: "Either booking or order is required" }
);
