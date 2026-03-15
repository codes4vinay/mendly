import { z } from "zod";

const PRODUCT_CATEGORIES = [
    "mobile", "laptop", "tv", "gaming_console",
    "appliance", "tablet", "smartwatch",
    "accessories", "spare_parts", "other",
];

export const createProductSchema = z.object({
    name: z.string({ required_error: "Product name is required" }).min(3).max(100).trim(),
    description: z.string().max(1000).optional(),
    category: z.enum(PRODUCT_CATEGORIES, { message: "Invalid category" }),
    condition: z.enum(["new", "like_new", "good", "fair"], { message: "Invalid condition" }),
    price: z.number({ required_error: "Price is required" }).min(0),
    stock: z.number().min(0).default(1),
    photos: z.array(z.string().url()).optional(),
});

export const updateProductSchema = createProductSchema.partial();
