import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES",
    "REFRESH_TOKEN_EXPIRES",
    "CLIENT_URL",
    "NODE_ENV",
    "PORT",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }
    console.log("✅ Environment variables validated");
};

export default validateEnv;
