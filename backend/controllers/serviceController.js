import Service from "../models/Service.js";
import ServiceCentre from "../models/ServiceCentre.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// ─── Create Service ───────────────────────────────────────────
export const createService = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre");

    const service = await Service.create({
        serviceCentre: serviceCentre._id,
        ...req.body,
    });

    return apiResponse(res, 201, "Service created successfully", { service });
});

// ─── Get All Services ─────────────────────────────────────────
export const getAllServices = asyncHandler(async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
        .populate("serviceCentre", "name address phone")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ "rating.average": -1 });

    return apiResponse(res, 200, "Services fetched successfully", {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        services,
    });
});

// ─── Get Single Service ───────────────────────────────────────
export const getService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id)
        .populate("serviceCentre", "name address phone workingHours");

    if (!service) throw new ApiError(404, "Service not found");

    return apiResponse(res, 200, "Service fetched successfully", { service });
});

// ─── Get My Services ──────────────────────────────────────────
export const getMyServices = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre");

    const services = await Service.find({ serviceCentre: serviceCentre._id });

    return apiResponse(res, 200, "Services fetched successfully", { services });
});

// ─── Update Service ───────────────────────────────────────────
export const updateService = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre");

    const service = await Service.findOne({
        _id: req.params.id,
        serviceCentre: serviceCentre._id,
    });
    if (!service) throw new ApiError(404, "Service not found");

    const updated = await Service.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
    );

    return apiResponse(res, 200, "Service updated successfully", { service: updated });
});

// ─── Delete Service ───────────────────────────────────────────
export const deleteService = asyncHandler(async (req, res) => {
    const serviceCentre = await ServiceCentre.findOne({ owner: req.user._id });
    if (!serviceCentre) throw new ApiError(404, "You don't have a service centre");

    const service = await Service.findOne({
        _id: req.params.id,
        serviceCentre: serviceCentre._id,
    });
    if (!service) throw new ApiError(404, "Service not found");

    service.isActive = false;
    await service.save();

    return apiResponse(res, 200, "Service deleted successfully");
});