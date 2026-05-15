const defaultOrigins = [
    "https://mendly-eight.vercel.app",
    "https://mendly.vinaydev.in",
    "https://www.mendly.vinaydev.in",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const allowedOrigins = [...new Set([
    ...configuredOrigins,
    ...defaultOrigins,
])];

export const isOriginAllowed = (origin) => {
    if (!origin) return true;

    // Exact match
    if (allowedOrigins.includes(origin)) return true;

    // Case-insensitive match
    const normalizedOrigin = origin.toLowerCase();
    return allowedOrigins.some(allowed => allowed.toLowerCase() === normalizedOrigin);
};
