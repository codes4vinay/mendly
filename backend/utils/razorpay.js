import crypto from "crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

const getCredentials = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay is not configured");
    }

    return { keyId, keySecret };
};

const getAuthHeader = () => {
    const { keyId, keySecret } = getCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`; // Encode credentials in Base64 for Basic Auth
};

export const getRazorpayPublicConfig = () => {
    const { keyId } = getCredentials();
    return { keyId };
};

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
    const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
        method: "POST",
        headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount,
            currency: "INR",
            receipt,
            notes,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.description || "Failed to create Razorpay order");
    }

    return data;
};

export const verifyRazorpaySignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    const { keySecret } = getCredentials();

    const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    return generatedSignature === razorpaySignature;
};
