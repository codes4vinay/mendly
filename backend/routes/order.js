import express from "express";
import * as orderController from "../controllers/orderController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators.js";

const router = express.Router();

// protected — user role + verified email
router.post("/", protect, requireEmailVerified, authorize("user"), validate(createOrderSchema), orderController.createOrder);
router.get("/my", protect, requireEmailVerified, authorize("user"), orderController.getMyOrders);
router.get("/centre/:centreId", protect, requireEmailVerified, authorize("service"), orderController.getCentreOrders);
router.get("/:id", protect, requireEmailVerified, orderController.getOrder);
router.put("/:id/status", protect, requireEmailVerified, authorize("service"), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;