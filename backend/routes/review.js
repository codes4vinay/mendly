import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import protect from "../middleware/protect.js";
import validate from "../middleware/validate.js";
import { createReviewSchema } from "../validators/reviewValidators.js";

const router = express.Router();

// public
router.get("/service/:serviceId", reviewController.getServiceReviews);
router.get("/product/:productId", reviewController.getProductReviews);

// protected
router.post("/", protect, validate(createReviewSchema), reviewController.createReview);
router.delete("/:id", protect, reviewController.deleteReview);

export default router;