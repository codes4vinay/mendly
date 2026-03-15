import express from "express";
import * as adminController from "../controllers/adminController.js";
import protect from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.use(protect, authorize("admin"));

// stats
router.get("/stats", adminController.getDashboardStats);

// users
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/toggle", adminController.toggleUserStatus);

// service centres
router.get("/service-centres", adminController.getAllServiceCentres);
router.put("/service-centres/:id/toggle", adminController.toggleServiceCentreStatus);

// services
router.get("/services", adminController.getAllServices);
router.put("/services/:id/toggle", adminController.toggleServiceStatus);

// products
router.get("/products", adminController.getAllProducts);
router.put("/products/:id/toggle", adminController.toggleProductStatus);

// bookings
router.get("/bookings", adminController.getAllBookings);

// orders
router.get("/orders", adminController.getAllOrders);

// reviews
router.get("/reviews", adminController.getAllReviews);
router.put("/reviews/:id/toggle", adminController.toggleReviewVisibility);

export default router;
