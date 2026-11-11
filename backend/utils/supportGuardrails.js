const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /reveal\s+(the\s+)?(system|developer|hidden)\s+(prompt|instructions|message)/i,
    /show\s+(me\s+)?(api|secret)\s*(key|token)/i,
    /bypass\s+(security|guardrails|authentication|authorization)/i,
    /jailbreak|prompt\s*injection/i,
];

const sensitiveValuePatterns = [
    /\b(my\s+)?(password|passcode|otp|one[- ]time password|cvv|pin)\s+(is|:)/i,
    /\b(?:\d[ -]*?){13,19}\b/,
];

const intents = [
    { intent: "track_order", pattern: /\b(track|where|status|delivery|shipped).{0,30}\border\b|\border.{0,30}\b(track|where|status|delivery|shipped)\b/i },
    { intent: "track_repair", pattern: /\b(track|where|status|progress).{0,30}\b(repair|booking|device|service)\b|\b(repair|booking|device).{0,30}\b(track|where|status|progress)\b/i },
    { intent: "refund", pattern: /\b(refund|money back|charged twice|payment dispute)\b/i },
    { intent: "return", pattern: /\b(return|replace|replacement|damaged product|wrong item)\b/i },
    { intent: "cancel", pattern: /\bcancel(led|lation)?\b/i },
    { intent: "complaint", pattern: /\b(complaint|complain|bad service|unhappy|terrible|escalate)\b/i },
    { intent: "feedback", pattern: /\b(feedback|suggestion|rate|rating|review)\b/i },
    { intent: "human", pattern: /\b(human|agent|representative|someone|call me)\b/i },
    { intent: "account", pattern: /\b(account|login|sign in|email|profile|password)\b/i },
    { intent: "payment", pattern: /\b(payment|paid|razorpay|cash|card|upi|invoice)\b/i },
];

const guidedResponses = {
    track_order: {
        response: "I can show orders from your signed-in account and their latest delivery status. Choose Track an order below; I will never ask for an OTP or payment credential.",
        suggestedActions: ["track_order"],
    },
    track_repair: {
        response: "I can show your repair bookings, current stage, service centre, and repair timeline. Choose Track a repair below.",
        suggestedActions: ["track_repair"],
    },
    refund: {
        response: "I can register a refund request for the support team. Refunds are reviewed against the linked order or repair and are never promised automatically.",
        suggestedActions: ["refund_request", "my_tickets"],
    },
    return: {
        response: "I can register a return or replacement request and link it to your order so the support team has the correct details.",
        suggestedActions: ["return_request", "track_order"],
    },
    cancel: {
        response: "I can help cancel an eligible unpaid order or repair after you explicitly confirm. Paid or already-in-progress requests are sent to support for manual review.",
        suggestedActions: ["track_order", "track_repair"],
    },
    complaint: {
        response: "I’m sorry this has been frustrating. I can create a traceable complaint and link it to the relevant order or repair.",
        suggestedActions: ["complaint", "my_tickets"],
    },
    feedback: {
        response: "Thanks for helping Mendly improve. You can send rated feedback here and receive a reference number.",
        suggestedActions: ["feedback"],
    },
    human: {
        response: "I can create a support ticket for a person to review. Include what happened and the result you need; do not include passwords, OTPs, card numbers, or identity documents.",
        suggestedActions: ["complaint", "my_tickets"],
    },
    account: {
        response: "For account help, use the secure sign-in, profile, or password-reset pages. Mendly support will never ask you to send your password or OTP in chat.",
        suggestedActions: ["account_help"],
    },
    payment: {
        response: "I can help with a payment issue by linking a ticket to your order or repair. Never share card numbers, CVV, UPI PINs, passwords, or OTPs here.",
        suggestedActions: ["order_issue", "repair_issue"],
    },
};

export function inspectSupportMessage(rawMessage) {
    const message = String(rawMessage || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();

    if (injectionPatterns.some((pattern) => pattern.test(message))) {
        return {
            blocked: true,
            intent: "blocked",
            response: "I can’t help bypass security or reveal private system information. I can help with your Mendly orders, repairs, payments, complaints, feedback, or account support.",
            suggestedActions: ["track_order", "track_repair", "complaint"],
        };
    }

    if (sensitiveValuePatterns.some((pattern) => pattern.test(message))) {
        return {
            blocked: true,
            intent: "sensitive_data",
            response: "For your security, please do not share passwords, OTPs, PINs, CVVs, or full card numbers. I did not process that message. You can describe the problem without including secret values.",
            suggestedActions: ["account_help", "complaint"],
        };
    }

    const match = intents.find(({ pattern }) => pattern.test(message));
    if (match) {
        return { blocked: false, intent: match.intent, ...guidedResponses[match.intent] };
    }

    return { blocked: false, intent: "general", response: null, suggestedActions: [] };
}

export const SUPPORT_FALLBACK =
    "I can help with order tracking, repair progress, cancellations, returns, refunds, complaints, feedback, payments, and account support. Choose an option below or tell me what went wrong.";
