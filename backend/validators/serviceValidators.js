import { z } from "zod";

const SERVICE_CATEGORIES = [
    "mobile_repair",
    "laptop_repair",
    "tv_repair",
    "gaming_console_repair",
    "appliance_repair",
    "tablet_repair",
    "smartwatch_repair",
    "printer_repair",
    "other_electronics",
];

export const createServiceSchema = z.object({
    name: z.string({ required_error: "Service name is required" }).min(3).max(100).trim(),
    description: z.string().max(1000).optional(),
    category: z.enum(SERVICE_CATEGORIES, { message: "Invalid category" }),
    price: z.number({ required_error: "Price is required" }).min(0, "Price cannot be negative"),
    priceType: z.enum(["fixed", "hourly"]).default("fixed"),
});

export const updateServiceSchema = createServiceSchema.partial();