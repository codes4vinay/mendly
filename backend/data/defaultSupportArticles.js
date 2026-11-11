export const DEFAULT_SUPPORT_ARTICLES = [
    {
        slug: "account-access-and-security",
        title: "Account access and security",
        summary: "How to register, verify your email, recover access, and keep your Mendly account secure.",
        category: "account",
        intents: ["account"],
        keywords: ["login", "sign in", "register", "password", "forgot password", "otp", "verify email", "account"],
        content: `Create a Mendly account with your name, email, and password, then complete email verification using the OTP sent to your registered email address.

If you cannot sign in, use Forgot password from the login page. Mendly Support will never ask for your password, OTP, UPI PIN, CVV, full card number, access token, or refresh token.

Account-specific support actions require you to be signed in. Creating support requests and cancellations also requires a verified email address. Report suspicious activity through a support ticket without including secret credentials.`,
    },
    {
        slug: "track-and-manage-orders",
        title: "Track and manage product orders",
        summary: "Understand order statuses, payment state, delivery progress, and cancellation options.",
        category: "orders",
        intents: ["track_order", "cancel"],
        keywords: ["order", "track order", "delivery", "pending", "confirmed", "shipped", "delivered", "cancel order"],
        content: `Open Mendly Support and choose Track an order to view orders belonging to your signed-in account. Order statuses are pending, confirmed, shipped, delivered, or cancelled.

Eligible unpaid orders can be cancelled after explicit confirmation. A paid order or an order that has already shipped is sent to the support team for manual cancellation review instead of being cancelled automatically.

Use Report an issue on an order to create a traceable support request. The bot will link the request to the selected order so the support team can review the correct record.`,
    },
    {
        slug: "repair-booking-and-tracking",
        title: "Book and track a repair",
        summary: "Follow repair bookings from placement through pickup, repair, and delivery.",
        category: "repairs",
        intents: ["track_repair", "cancel"],
        keywords: ["repair", "booking", "device", "service", "pickup", "under repair", "repair status", "cancel repair"],
        content: `Book an available repair service from the Services area and provide the requested schedule, device, pickup, and payment details.

Choose Track a repair in Mendly Support to view bookings belonging to your account. Tracking stages can include booking placed, pickup scheduled, device picked up, under repair, repair done, out for delivery, and delivered.

Eligible unpaid bookings can be cancelled after explicit confirmation. Paid or in-progress repairs require manual support review. Use Report an issue on the repair card to create a linked support request.`,
    },
    {
        slug: "payments-and-failed-transactions",
        title: "Payments and failed transactions",
        summary: "Supported payment states and what to do when a payment does not complete.",
        category: "payments",
        intents: ["payment"],
        keywords: ["payment", "razorpay", "cash", "card", "upi", "failed payment", "charged", "paid"],
        content: `Mendly orders and repair bookings record payment method and payment status. Supported records can use cash or Razorpay-backed online checkout, depending on the selected flow.

Online payment is treated as complete only after the server verifies the Razorpay payment signature. If checkout fails, do not share card details, CVV, UPI PIN, password, or OTP with anyone.

If money appears deducted but the Mendly record is not marked paid, create an Order issue or Repair issue ticket and link the affected record. The support team must review the transaction; the bot does not independently promise or issue refunds.`,
    },
    {
        slug: "returns-refunds-and-replacements",
        title: "Returns, refunds, and replacements",
        summary: "How to submit a reviewed request for an order or repair payment issue.",
        category: "returns_refunds",
        intents: ["refund", "return"],
        keywords: ["refund", "return", "replacement", "wrong item", "damaged product", "money back", "charged twice"],
        content: `Return, replacement, and refund requests are reviewed against the linked Mendly order or repair. Approval and timing depend on the record and the support team's review; the bot cannot guarantee an outcome or processing date.

From Mendly Support, choose Request a return or Request a refund, select the relevant order or repair, and explain what happened and the outcome you need. Do not include payment credentials or OTPs.

You will receive a ticket reference number and can follow its status under My support requests.`,
    },
    {
        slug: "complaints-and-human-support",
        title: "Complaints and human support",
        summary: "Create and track a complaint that needs review by the Mendly support team.",
        category: "support",
        intents: ["complaint", "human"],
        keywords: ["complaint", "agent", "human", "representative", "escalate", "bad service", "support ticket"],
        content: `Choose Report a problem in Mendly Support to create a complaint. Add a clear subject, describe what happened, select a preferred follow-up method, and link an order or repair when relevant.

Every submitted request receives a Mendly ticket number. Ticket statuses include open, in progress, waiting on customer, resolved, and closed. Customer-visible staff updates appear in My support requests and can also create account notifications.

Never include passwords, OTPs, PINs, CVVs, full card numbers, API keys, or identity documents in the complaint.`,
    },
    {
        slug: "feedback-and-ratings",
        title: "Feedback and ratings",
        summary: "Share rated feedback about Mendly or review completed services and products.",
        category: "support",
        intents: ["feedback"],
        keywords: ["feedback", "rating", "review", "suggestion", "rate service", "rate product"],
        content: `Use Share feedback in Mendly Support to send a 1-to-5-star rating with written comments. Feedback submissions receive a ticket reference number so they are not lost in a chat transcript.

Mendly also supports reviews for eligible services and products through its review experience. Keep feedback factual and do not include private credentials or another person's personal information.`,
    },
    {
        slug: "support-bot-privacy-and-guardrails",
        title: "Support bot privacy and safe use",
        summary: "What the support assistant can access and what information should never be shared.",
        category: "safety",
        intents: ["sensitive_data", "blocked"],
        keywords: ["privacy", "security", "safe", "data", "password", "otp", "card details", "guardrails"],
        content: `Mendly Support requires authentication before it can access account records. Server-side ownership checks ensure customers can only retrieve orders, repairs, conversations, and tickets belonging to their own account.

The assistant does not need passwords, OTPs, UPI PINs, CVVs, full card numbers, API keys, access tokens, refresh tokens, or identity documents. Messages that appear to contain sensitive credentials are blocked and redacted before conversation storage.

Actions such as cancellation require explicit confirmation. Paid or in-progress cases are escalated for human review rather than changed automatically.`,
    },
];

export default DEFAULT_SUPPORT_ARTICLES;
