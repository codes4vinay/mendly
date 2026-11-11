import express from "express";
import authorize from "../middleware/authorize.js";
import protect from "../middleware/protect.js";
import { supportLimiter, supportWriteLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import {
    createArticle,
    getPublishedArticle,
    listAdminArticles,
    listPublishedArticles,
    updateArticle,
} from "../controllers/supportArticleController.js";
import {
    createSupportArticleSchema,
    updateSupportArticleSchema,
} from "../validators/supportArticleValidators.js";

const router = express.Router();

router.get("/", supportLimiter, listPublishedArticles);
router.get("/admin", protect, authorize("admin"), supportLimiter, listAdminArticles);
router.post(
    "/admin",
    protect,
    authorize("admin"),
    supportWriteLimiter,
    validate(createSupportArticleSchema),
    createArticle
);
router.put(
    "/admin/:id",
    protect,
    authorize("admin"),
    supportWriteLimiter,
    validate(updateSupportArticleSchema),
    updateArticle
);
router.get("/:slug", supportLimiter, getPublishedArticle);

export default router;
