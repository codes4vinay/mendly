import { z } from "zod";

const orderItemSchema = z.object({
    product: z.string({ required_error: "Product is required" }),
    quantity: z.number({ required_error: "Quantity is required" }).min(1, "Minimum quantity is 1"),
    price: z.number({ required_error: "Price is required" }).min(0),
});

export const createOrderSchema = z.object({
    serviceCentre: z.string({ required_error: "Service centre is required" }),
    items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
    totalAmount: z.number({ required_error: "Total amount is required" }).min(0),
    payment: z.object({
        method: z.enum(["cash", "upi", "card", "netbanking", "razorpay"]).default("cash"),
    }),
    deliveryAddress: z.object({
        street: z.string().optional(),
        city: z.string({ required_error: "City is required" }),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(
        ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        { message: "Invalid status" }
    ),
    cancellationReason: z.string().optional(),
});

export const verifyOrderPaymentSchema = z.object({
    razorpayOrderId: z.string({ required_error: "Razorpay order ID is required" }),
    razorpayPaymentId: z.string({ required_error: "Razorpay payment ID is required" }),
    razorpaySignature: z.string({ required_error: "Razorpay signature is required" }),
});
