import express from "express";
import * as chatController from "../controllers/chatController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get or create chat with service centre
router.post("/", chatController.getOrCreateChat);

// Get all chats for user
router.get("/", chatController.getMyChats);

// Send message in chat
router.post("/:chatId/messages", chatController.sendMessage);

// Get single chat with messages
router.get("/:chatId", chatController.getChat);

// Mark messages as read
router.put("/:chatId/read", chatController.markAsRead);

// Delete chat
router.delete("/:chatId", chatController.deleteChat);

export default router;
