import express from "express";
import * as orderController from "../controllers/orderController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema, verifyOrderPaymentSchema } from "../validators/orderValidators.js";

const router = express.Router();

// protected — user role + verified email
router.post("/", protect, requireEmailVerified, authorize("user"), validate(createOrderSchema), orderController.createOrder);
router.post("/:id/verify-payment", protect, requireEmailVerified, authorize("user"), validate(verifyOrderPaymentSchema), orderController.verifyOrderPayment);
router.get("/my", protect, requireEmailVerified, authorize("user"), orderController.getMyOrders);
router.get("/centre/:centreId", protect, requireEmailVerified, authorize("service"), orderController.getCentreOrders);
router.get("/:id", protect, requireEmailVerified, orderController.getOrder);
router.put("/:id/status", protect, requireEmailVerified, authorize("user", "service", "admin"), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
