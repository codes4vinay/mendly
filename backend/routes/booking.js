import express from "express";
import * as bookingController from "../controllers/bookingController.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { createBookingSchema, updateBookingStatusSchema, verifyBookingPaymentSchema } from "../validators/bookingValidators.js";

const router = express.Router();

// protected — user role + verified email
router.post("/", protect, requireEmailVerified, authorize("user"), validate(createBookingSchema), bookingController.createBooking);
router.post("/:id/verify-payment", protect, requireEmailVerified, authorize("user"), validate(verifyBookingPaymentSchema), bookingController.verifyBookingPayment);
router.get("/my", protect, requireEmailVerified, authorize("user"), bookingController.getMyBookings);
router.get("/centre/:centreId", protect, requireEmailVerified, authorize("service"), bookingController.getCentreBookings);
router.get("/:id", protect, requireEmailVerified, bookingController.getBooking);
router.put("/:id/status", protect, requireEmailVerified, validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

export default router;
