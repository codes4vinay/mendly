import express from "express";
import * as serviceController from "../controllers/serviceController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createServiceSchema, updateServiceSchema } from "../validators/serviceValidators.js";

const router = express.Router();

// public
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getService);

// protected — service role + verified email
router.post("/", protect, requireEmailVerified, authorize("service"), validate(createServiceSchema), serviceController.createService);
router.get("/my/services", protect, requireEmailVerified, authorize("service"), serviceController.getMyServices);
router.put("/:id", protect, requireEmailVerified, authorize("service"), validate(updateServiceSchema), serviceController.updateService);
router.delete("/:id", protect, requireEmailVerified, authorize("service"), serviceController.deleteService);

export default router;