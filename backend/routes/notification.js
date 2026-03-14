import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// all notification routes are protected
router.get("/", protect, notificationController.getMyNotifications);
router.put("/read-all", protect, notificationController.markAllAsRead);
router.put("/:id/read", protect, notificationController.markAsRead);
router.delete("/:id", protect, notificationController.deleteNotification);

export default router;