import Product from "../models/Product.js";
import ServiceCentre from "../models/ServiceCentre.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Product ───────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre");

    const product = await Product.create({
        serviceCentre: serviceCentre._id,
        seller: req.user._id,
        ...req.body,
    });

    return apiResponse(res, 201, "Product created successfully", { product });
});

// ─── Get All Products ─────────────────────────────────────────
export const getAllProducts = asyncHandler(async (req, res) => {
    const { category, condition, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .populate("serviceCentre", "name address phone")
        .populate("seller", "name")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Products fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        products,
    });
});

// ─── Get Single Product ───────────────────────────────────────
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("serviceCentre", "name address phone workingHours")
        .populate("seller", "name");

    if (!product) throw new ApiError(404, "Product not found");

    return apiResponse(res, 200, "Product fetched successfully", { product });
});

// ─── Get My Products ──────────────────────────────────────────
export const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id });
    return apiResponse(res, 200, "Products fetched successfully", { products });
});

// ─── Update Product ───────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        seller: req.user._id,
    });
    if (!product) throw new ApiError(404, "Product not found");

    const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
    );

    return apiResponse(res, 200, "Product updated successfully", { product: updated });
});

// ─── Delete Product ───────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        seller: req.user._id,
    });
    if (!product) throw new ApiError(404, "Product not found");

    product.isActive = false;
    await product.save();

    return apiResponse(res, 200, "Product deleted successfully");
});