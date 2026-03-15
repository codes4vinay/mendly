import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.js";
import serviceCentreRoutes from "./routes/serviceCentre.js";
import serviceRoutes from "./routes/service.js";
import bookingRoutes from "./routes/booking.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import reviewRoutes from "./routes/review.js";
import notificationRoutes from "./routes/notification.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security ──────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Core Middleware ───────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());         // parses cookies so we can read req.cookies
app.use(globalLimiter);

// ─── Static Files ──────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/service-centres", serviceCentreRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Mendly API running ✅" }));

// ─── Error Handling — must be last ────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;