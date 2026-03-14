import express from "express";
import * as bookingController from "../controllers/bookingController.js";
import protect from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createBookingSchema, updateBookingStatusSchema } from "../validators/bookingValidators.js";

const router = express.Router();

// all booking routes are protected
router.post("/", protect, authorize("user"), validate(createBookingSchema), bookingController.createBooking);
router.get("/my", protect, authorize("user"), bookingController.getMyBookings);
router.get("/centre/:centreId", protect, authorize("service"), bookingController.getCentreBookings);
router.get("/:id", protect, bookingController.getBooking);
router.put("/:id/status", protect, validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

export default router;