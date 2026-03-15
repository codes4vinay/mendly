import express from "express";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import upload from "../middleware/upload.js";
import * as uploadController from "../controllers/uploadController.js";

const router = express.Router();

router.post(
    "/images",
    protect,
    requireEmailVerified,
    upload.array("images", 6),
    uploadController.uploadImages
);

export default router;
