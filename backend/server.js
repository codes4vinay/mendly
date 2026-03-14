import dotenv from "dotenv";
dotenv.config();                 // must be first line before anything else

import validateEnv from "./config/env.js";
validateEnv();                   // crash early if any env var is missing

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();           // wait for DB before accepting requests

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
        });

        // ─── Graceful Shutdown ────────────────────────────────────
        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Shutting down...");
            server.close(() => {
                console.log("Server closed.");
                process.exit(0);
            });
        });

    } catch (error) {
        console.error(`Server failed to start: ${error.message}`);
        process.exit(1);
    }
};

startServer();