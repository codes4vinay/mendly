import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import serviceRoutes from "./routes/service.js";
import bookingRoutes from "./routes/booking.js";
import adminRoutes from "./routes/admin.js";
import notificationRoutes from './routes/notification.js';


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.use('/api/notifications', notificationRoutes);


app.get("/", (req, res) => {
    res.send("Mendly backend running..");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
