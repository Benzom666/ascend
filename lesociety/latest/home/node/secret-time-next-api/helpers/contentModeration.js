const BLOCKED_PATTERNS = [
    {
        pattern: /\b(escort(?:ing)?|prostitut(?:e|ion)|sugar\s*baby|pay\s*for\s*play)\b/i,
        message: "Restricted adult-service terms are not allowed.",
    },
    {
        pattern: /\b(scam(?:mer|ming)?|fraud|swindle|blackmail|extort(?:ion)?)\b/i,
        message: "Fraud-related terms are not allowed.",
    },
    {
        pattern:
            /\b(onlyfans|cashapp|cash\s*app|venmo|paypal|zelle|telegram|whatsapp|snapchat|kik)\b/i,
        message: "Payment handles and off-platform contact apps are not allowed.",
    },
    {
        pattern: /\b(instagram|insta|ig|facebook|fb|tiktok|twitter|x\.com|discord)\b/i,
        message: "Direct social-media contact details are not allowed.",
    },
    {
        pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
        message: "Email addresses are not allowed.",
    },
    {
        pattern: /(?:\+?\d[\d\s().-]{6,}\d)/,
        message: "Phone numbers are not allowed.",
    },
];

const normalizeModeratedText = (value = "") =>
    String(value || "")
        .replace(/\s+/g, " ")
        .trim();

const getModerationError = (value = "") => {
    const normalized = normalizeModeratedText(value);
    if (!normalized) return "";

    const blocked = BLOCKED_PATTERNS.find(({ pattern }) => pattern.test(normalized));
    return blocked?.message || "";
};

module.exports = {
    normalizeModeratedText,
    getModerationError,
};
