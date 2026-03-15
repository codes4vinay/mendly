import express from "express";
import * as serviceCentreController from "../controllers/serviceCentreController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createServiceCentreSchema, updateServiceCentreSchema } from "../validators/serviceCentreValidators.js";

const router = express.Router();

// public
router.get("/my/centre", protect, requireEmailVerified, authorize("service"), serviceCentreController.getMyServiceCentre);
router.get("/", serviceCentreController.getAllServiceCentres);
router.get("/:id", serviceCentreController.getServiceCentre);

// protected — service role + verified email
router.post("/", protect, requireEmailVerified, authorize("service"), validate(createServiceCentreSchema), serviceCentreController.createServiceCentre);
router.put("/my/centre", protect, requireEmailVerified, authorize("service"), validate(updateServiceCentreSchema), serviceCentreController.updateServiceCentre);
router.delete("/my/centre", protect, requireEmailVerified, authorize("service"), serviceCentreController.deleteServiceCentre);

export default router;
