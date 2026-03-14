import ServiceCentre from "../models/ServiceCentre.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Service Centre ────────────────────────────────────
export const createServiceCentre = asyncHandler(async (req, res) => {
    const existing = await ServiceCentre.findOne({ owner: req.user._id });
    if (existing) throw new ApiError(400, "You already have a service centre");

    const serviceCentre = await ServiceCentre.create({
        owner: req.user._id,
        ...req.body,
    });

    return apiResponse(res, 201, "Service centre created successfully", { serviceCentre });
});

// ─── Get All Service Centres ──────────────────────────────────
export const getAllServiceCentres = asyncHandler(async (req, res) => {
    const { city, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (city) filter["address.city"] = new RegExp(city, "i");

    const total = await ServiceCentre.countDocuments(filter);
    const serviceCentres = await ServiceCentre.find(filter)
        .populate("owner", "name email phone")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return apiResponse(res, 200, "Service centres fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        serviceCentres,
    });
});

// ─── Get Single Service Centre ────────────────────────────────
export const getServiceCentre = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findById(req.params.id)
        .populate("owner", "name email phone");

    if (!serviceCentre) throw new ApiError(404, "Service centre not found");

    return apiResponse(res, 200, "Service centre fetched successfully", { serviceCentre });
});

// ─── Get My Service Centre ────────────────────────────────────
export const getMyServiceCentre = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre yet");

    return apiResponse(res, 200, "Service centre fetched successfully", { serviceCentre });
});

// ─── Update Service Centre ────────────────────────────────────
export const updateServiceCentre = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "Service centre not found");

    const updated = await ServiceCentre.findByIdAndUpdate(
        serviceCentre._id,
        { ...req.body },
        { new: true }
    );

    return apiResponse(res, 200, "Service centre updated successfully", { serviceCentre: updated });
});

// ─── Delete Service Centre ────────────────────────────────────
export const deleteServiceCentre = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "Service centre not found");

    serviceCentre.isActive = false;
    await serviceCentre.save();

    return apiResponse(res, 200, "Service centre deleted successfully");
});