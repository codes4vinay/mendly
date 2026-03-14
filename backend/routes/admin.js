import express from "express";
import * as adminController from "../controllers/adminController.js";
import protect from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// all admin routes — protected + admin role only
router.use(protect, authorize("admin"));

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/toggle", adminController.toggleUserStatus);
router.put("/service-centres/:id/toggle", adminController.toggleServiceCentreStatus);
router.put("/reviews/:id/toggle", adminController.toggleReviewVisibility);

export default router;
