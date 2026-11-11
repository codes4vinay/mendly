import express from "express";
import authorize from "../middleware/authorize.js";
import protect, { requireEmailVerified } from "../middleware/protect.js";
import validate from "../middleware/validate.js";
import { supportLimiter, supportWriteLimiter } from "../middleware/rateLimiter.js";
import {
    cancelSupportResource,
    clearConversation,
    createSupportTicket,
    getAllSupportTickets,
    getChatbotConversation,
    getMySupportTicket,
    getMySupportTickets,
    getSupportContext,
    sendChatbotMessage,
    startNewConversation,
    testGroqAPI,
    updateSupportTicket,
} from "../controllers/chatbotController.js";
import {
    cancelSupportResourceSchema,
    createSupportTicketSchema,
    sendSupportMessageSchema,
    updateSupportTicketSchema,
} from "../validators/chatbotValidators.js";

const router = express.Router();

router.use(protect, supportLimiter);

router.post("/new", startNewConversation);
router.post("/message", validate(sendSupportMessageSchema), sendChatbotMessage);
router.get("/conversation/:conversationId", getChatbotConversation);
router.delete("/conversation/:conversationId", clearConversation);

router.get("/context", authorize("user"), getSupportContext);
router.get("/tickets", authorize("user"), getMySupportTickets);
router.get("/tickets/:id", authorize("user"), getMySupportTicket);
router.post(
    "/tickets",
    requireEmailVerified,
    authorize("user"),
    supportWriteLimiter,
    validate(createSupportTicketSchema),
    createSupportTicket
);
router.post(
    "/actions/cancel",
    requireEmailVerified,
    authorize("user"),
    supportWriteLimiter,
    validate(cancelSupportResourceSchema),
    cancelSupportResource
);

router.get("/admin/tickets", authorize("admin"), getAllSupportTickets);
router.put(
    "/admin/tickets/:id",
    authorize("admin"),
    validate(updateSupportTicketSchema),
    updateSupportTicket
);
router.get("/admin/test-ai", authorize("admin"), testGroqAPI);

export default router;
