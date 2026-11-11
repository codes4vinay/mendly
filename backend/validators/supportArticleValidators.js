import { z } from "zod";

const slug = z.string().trim().min(3).max(80).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and single hyphens only"
);

const articleFields = {
    slug,
    title: z.string().trim().min(4).max(120),
    summary: z.string().trim().min(10).max(240),
    content: z.string().trim().min(30).max(5000),
    category: z.enum(["account", "orders", "repairs", "payments", "returns_refunds", "support", "safety", "general"]),
    intents: z.array(z.string().trim().min(2).max(50)).max(12).default([]),
    keywords: z.array(z.string().trim().min(2).max(60)).max(30).default([]),
    audience: z.enum(["all", "customer", "provider"]).default("all"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
};

export const createSupportArticleSchema = z.object(articleFields);

export const updateSupportArticleSchema = z.object({
    slug: articleFields.slug.optional(),
    title: articleFields.title.optional(),
    summary: articleFields.summary.optional(),
    content: articleFields.content.optional(),
    category: articleFields.category.optional(),
    intents: z.array(z.string().trim().min(2).max(50)).max(12).optional(),
    keywords: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    audience: articleFields.audience.optional(),
    status: articleFields.status.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "Add at least one article change",
});
