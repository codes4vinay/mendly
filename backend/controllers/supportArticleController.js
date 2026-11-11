import SupportArticle from "../models/SupportArticle.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const publicFields = "slug title summary content category audience version publishedAt updatedAt";

export const listPublishedArticles = asyncHandler(async (req, res) => {
    const { category, q } = req.query;
    const filter = { status: "published", audience: { $in: ["all", "customer"] } };
    if (category) filter.category = category;
    if (q?.trim()) filter.$text = { $search: q.trim().slice(0, 120) };

    const articles = await SupportArticle.find(filter)
        .select(publicFields)
        .sort({ category: 1, title: 1 })
        .limit(100)
        .lean();
    return apiResponse(res, 200, "Support articles fetched", { articles });
});

export const getPublishedArticle = asyncHandler(async (req, res) => {
    const article = await SupportArticle.findOne({
        slug: req.params.slug,
        status: "published",
        audience: { $in: ["all", "customer"] },
    }).select(publicFields).lean();
    if (!article) throw new ApiError(404, "Support article not found");
    return apiResponse(res, 200, "Support article fetched", { article });
});

export const listAdminArticles = asyncHandler(async (req, res) => {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const articles = await SupportArticle.find(filter)
        .populate("updatedBy", "name email")
        .sort({ updatedAt: -1 })
        .lean();
    return apiResponse(res, 200, "Knowledge base articles fetched", { articles });
});

export const createArticle = asyncHandler(async (req, res) => {
    const existing = await SupportArticle.findOne({ slug: req.body.slug }).select("_id");
    if (existing) throw new ApiError(409, "An article with this slug already exists");
    const article = await SupportArticle.create({ ...req.body, updatedBy: req.user._id });
    return apiResponse(res, 201, "Knowledge base article created", { article });
});

export const updateArticle = asyncHandler(async (req, res) => {
    const article = await SupportArticle.findById(req.params.id);
    if (!article) throw new ApiError(404, "Knowledge base article not found");

    if (req.body.slug && req.body.slug !== article.slug) {
        const duplicate = await SupportArticle.findOne({ slug: req.body.slug, _id: { $ne: article._id } }).select("_id");
        if (duplicate) throw new ApiError(409, "An article with this slug already exists");
    }

    for (const [key, value] of Object.entries(req.body)) article[key] = value;
    article.updatedBy = req.user._id;
    await article.save();
    return apiResponse(res, 200, "Knowledge base article updated", { article });
});
