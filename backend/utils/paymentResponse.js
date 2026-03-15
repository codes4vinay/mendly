export const buildRazorpayCheckoutPayload = ({ razorpayOrder, publicConfig, entityName }) => ({
    provider: "razorpay",
    key: publicConfig.keyId,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    razorpayOrderId: razorpayOrder.id,
    entityName,
});
