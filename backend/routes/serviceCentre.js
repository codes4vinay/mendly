import express from "express";
import * as serviceCentreController from "../controllers/serviceCentreController.js";
import protect from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createServiceCentreSchema, updateServiceCentreSchema } from "../validators/serviceCentreValidators.js";

const router = express.Router();

// public
router.get("/", serviceCentreController.getAllServiceCentres);
router.get("/:id", serviceCentreController.getServiceCentre);

// protected — service role only
router.post("/", protect, authorize("service"), validate(createServiceCentreSchema), serviceCentreController.createServiceCentre);
router.get("/my/centre", protect, authorize("service"), serviceCentreController.getMyServiceCentre);
router.put("/my/centre", protect, authorize("service"), validate(updateServiceCentreSchema), serviceCentreController.updateServiceCentre);
router.delete("/my/centre", protect, authorize("service"), serviceCentreController.deleteServiceCentre);

export default router;