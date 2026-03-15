import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
    ensureCloudinaryConfigured,
    uploadBufferToCloudinary,
} from "../utils/cloudinary.js";

export const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Please upload at least one image");
    }

    try {
        ensureCloudinaryConfigured();
    } catch {
        throw new ApiError(503, "Cloudinary is not configured on the server");
    }

    const folder = req.query.folder || "mendly";
    const uploads = await Promise.all(
        req.files.map((file) =>
            uploadBufferToCloudinary(file.buffer, { folder })
        )
    );
    const images = uploads.map((upload) => upload.secure_url);

    return apiResponse(res, 201, "Images uploaded successfully", { images });
});
