import express from "express";
import * as orderController from "../controllers/orderController.js";
import protect from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators.js";

const router = express.Router();

// all order routes are protected
router.post("/", protect, authorize("user"), validate(createOrderSchema), orderController.createOrder);
router.get("/my", protect, authorize("user"), orderController.getMyOrders);
router.get("/centre/:centreId", protect, authorize("service"), orderController.getCentreOrders);
router.get("/:id", protect, orderController.getOrder);
router.put("/:id/status", protect, authorize("service"), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;