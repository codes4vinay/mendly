import express from "express";
import * as productController from "../controllers/productController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../validators/productValidators.js";

const router = express.Router();

// public
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

// protected — service role + verified email
router.post("/", protect, requireEmailVerified, authorize("service"), validate(createProductSchema), productController.createProduct);
router.get("/my/products", protect, requireEmailVerified, authorize("service"), productController.getMyProducts);
router.put("/:id", protect, requireEmailVerified, authorize("service"), validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", protect, requireEmailVerified, authorize("service"), productController.deleteProduct);

export default router;