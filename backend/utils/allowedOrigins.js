const defaultOrigins = [
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
    return allowedOrigins.includes(origin);
};
