/**
 * Aspiration Filter — Blocked Pattern List
 *
 * Terms are grouped by category for maintainability.
 * Each group has its own message so users get context-appropriate feedback.
 *
 * Categories:
 *   1. Escort / sex-worker substitutes & euphemisms
 *   2. PPM / allowance / direct financial compensation
 *   3. Payment-handle & off-platform contact terms
 *   4. Social-media / external platform handles
 *   5. Adult / sexual terms
 *   6. Fraud / scam / blackmail terms
 *   7. Platform-name direct mentions (cam sites, content platforms)
 */

const BLOCKED_PATTERNS = [
  // ─── 1. Escort / Sex-Worker Euphemisms ───────────────────────────────────────
  {
    pattern:
      /\b(escort(?:ing|ed|s)?|prostitut(?:e|ion|ed|es)|hooker|call\s*girl|sugar\s*baby|pay\s*for\s*play|sex\s*worker|working\s*girl|working\s*woman)\b/gi,
    message: "This text includes escort or adult-service terms.",
  },
  {
    pattern:
      /\b(companion(?:\s*arrangement)?|professional\s*companion|high-end\s*companion|premium\s*companion)\b/gi,
    message: "This text includes restricted adult-service terms.",
  },
  {
    pattern:
      /\b(adult\s*entertain(?:er|ment)|adult\s*performer|tantric\s*massage|massage\s* parlor|massage\s* parlor|massage\s* parlor|bodyrub|body\s*rub|nuru\s*massage|erotic\s*massage)\b/gi,
    message: "This text includes restricted adult-service terms.",
  },
  {
    pattern:
      /\b(tantra(?:\s*session)?|tantric(?:\s*experience)?)\b/gi,
    message: "This text includes restricted adult-service terms.",
  },

  // ─── 2. PPM / Allowance / Financial Compensation ────────────────────────────
  {
    pattern:
      /\b(ppm|p\.p\.m|ppm\s*arrangement|pay\s*per\s*meet|pay\s*per\s*minute|per\s*meet|per\s*meet\s*arrangement|allowance|monthly\s*allowance|weekly\s*allowance|sugar\s*allowance|sugar\s*daddy\s*allowance|financial\s*support|direct\s*compensation|cash\s*compensation)\b/gi,
    message: "This text references PPM, allowance, or direct financial compensation.",
  },
  {
    pattern:
      /\b(paid\s*date|paid\s*arrangement|paid\s*meet|compensation|sugar\s*money|sugar\s*funds|sugar\s*arrangement|sugar\s* arrangement)\b/gi,
    message: "This text references paid arrangements.",
  },
  {
    pattern:
      /\b(gift\s*in\s*exchange|gift\s*for\s*time|renumeration|remuneration|financial\s*arrangement|mutually\s*beneficial|mutually\s*arranged|m\.b\.a\.?|mba|m\.b\.?)\b/gi,
    message: "This text references financial arrangements.",
  },
  {
    pattern:
      /\b(guaranteed\s*income|guaranteed\s*payment|fixed\s*payment|set\s*rate|hourly\s*rate|flat\s*rate|bottle\s*service|bottle\s*girl)\b/gi,
    message: "This text references payment or compensation terms.",
  },

  // ─── 3. Payment Handles & Off-Platform Contact ───────────────────────────────
  {
    pattern:
      /\b(cashapp|cash\s*app|venmo|paypal|zelle|apple\s*pay|google\s*pay|chime|reloadable\s*card|gift\s*card|amazon\s*gift|e-gift|crypto\s*wallet|bitcoin\s*wallet|btc\s*address|ethereum\s*address|usdt|usdc|tether)\b/gi,
    message: "Payment handles and off-platform payment apps are not allowed.",
  },
  {
    pattern:
      /\b(payment\s*app|payment\s*app|send\s*money|transfer\s*money|wire\s*transfer|bank\s*transfer|ach\s*transfer|direct\s*deposit)\b/gi,
    message: "Payment-related terms are not allowed.",
  },

  // ─── 4. Social-Media & External Platform Handles ──────────────────────────────
  {
    pattern:
      /\b(onlyfans|of\s*link|of\s*page|only\s*fans|fansly|my\s*fans|fan\s*page|patreon|superfan|tiers\s*of\s*access)\b/gi,
    message: "Content-platform references are not allowed.",
  },
  {
    pattern:
      /\b(instagram|insta\s*tag|ig\s*handle|ig\s*link|follow\s*me|follow\s*on\s*instagram|dm\s*me|dms\s*open|dm\s*open|slide\s*into\s*dms|snapchat|kik|whatsapp|telegram|signal|discord|facebook|fb(?:\s*link|\s*handle)?|twitter|x\.com|x\s*dm|thread(?:\s*me)?|threads(?:\s*link)?|tiktok|tt\s*handle|yt\s*channel|youtube\s*link|red\s*dit|reddit\s*profile|subreddit|slack|teams|zoom\s*link|google\s*meet)\b/gi,
    message: "Direct social-media or off-platform contact details are not allowed.",
  },
  {
    pattern:
      /\b(meet\s*me\s*(?:at|in|on|under)|meetup|coffee\s*meet\s*up|coffee\s*meetup)\b/gi,
    message: "Off-platform meeting references are not allowed.",
  },
  {
    pattern:
      /\b(add\s*me|finding\s*me|finding\s*me\s*at|find\s*me\s*(?:at|on|in)|find\s*me\s*on|look\s*me\s*up|look\s*me\s*up\s*on|search\s*for\s*me|google\s*me|search\s*me)\b/gi,
    message: "Direct social-media or off-platform contact details are not allowed.",
  },

  // ─── 5. Adult / Sexual Terms ────────────────────────────────────────────────
  {
    pattern:
      /\b(slut|whore|bad\s*girl|naughty\s*girl|easy\s*girl|freak(?:y|ier|iest)?|kinky|kink(?:y|ier)?|fetish(?:ist)?|bdsm|sub(?:missive)?|dom(?:inant)?|dominatrix|mistress(?:\s*of)?|master(?:\s*of)?|slave(?:\s*to)?)\b/gi,
    message: "This text includes restricted sexual terms.",
  },
  {
    pattern:
      /\b(porn(?:o|graph(?:y|ic|er)?|star)?|porno(?:\s*star)?|xxx|xxx\s*content|adult\s*film|stripe\s*adult|strip\s*club|stripper|cam\s*(?:girl|boy)|camgirl|camboy|live\s*cams|webcam(?:mer)?|nude(?:s|ing)?|nudity|erotic(?:a)?|erotic\s*story|sexual\s*services|sexual\s*encounter|sexual\s*fantasy|sex\s*tour|sex\s*tourism|sex\s*chat|sext(?:ing)?|sexy\s*time|sexy\s*chat|intimate\s*encounter|intimate\s*services)\b/gi,
    message: "This text includes restricted sexual terms.",
  },
  {
    pattern:
      /\b(jailbreak|roleplay|femdom|feet\s*pics?|feet\s*pix|stockings?|lingerie\s*model|boudoir(?:\s*photography)?|boudoir\s*shoot)\b/gi,
    message: "This text includes restricted sexual terms.",
  },
  {
    pattern:
      /\b(horny|horniest|hornier|wet\s*(?:and\s*)?ready|horny\s*mood|turned\s*on|turn\s*me\s*on|turn\s*on|aroused|arousal|sexually\s*available)\b/gi,
    message: "This text includes restricted sexual terms.",
  },

  // ─── 6. Fraud / Scam / Blackmail ─────────────────────────────────────────────
  {
    pattern:
      /\b(scam(?:mer|ming|med)?|fraud(?:ulent)?|swindle|blackmail|extort(?:ion)?|extort(?:ing|ed)?|ransom|fake\s*profile|catfish(?:ing)?|impersonat(?:e|ion|or)|phishing|fake\s*id|stolen\s*photo|stolen\s*pic)\b/gi,
    message: "This text includes restricted fraud-related terms.",
  },
  {
    pattern:
      /\b(money\s*mule|mule(?:\s*account)?|smurf(?:ing)?|money\s*laundering|cash\s*mule|payment\s*mule|bank\s*mule)\b/gi,
    message: "This text includes restricted fraud-related terms.",
  },

  // ─── 7. Platform Direct Mentions ────────────────────────────────────────────
  {
    pattern:
      /\b(onlyfans|cashapp|cash\s*app|venmo|paypal|zelle|chime|apple\s*pay|google\s*pay)\b/gi,
    message: "Payment handles and off-platform contact apps are not allowed.",
  },
  {
    pattern:
      /\b(telegram(?:\s*handle|\s*link|\s*channel|\s*group)?|whatsapp(?:\s*link|\s*group)?|snapchat(?:\s*handle|\s*add)?|kik(?:\s*username)?|discord(?:\s*server|\s*link)?|signal(?:\s*handle)?)\b/gi,
    message: "Off-platform messaging apps are not allowed.",
  },
  {
    pattern:
      /\b(instagram(?:\s*link|\s*handle|\s*dm)?|tiktok(?:\s*link|\s*handle)?|twitter(?:\s*link|\s*handle)?|x\.com(?:\s*link)?|facebook(?:\s*link)?|linkedin(?:\s*link)?|threads(?:\s*link)?|reddit(?:\s*profile)?|youtube(?:\s*link)?)\b/gi,
    message: "Direct social-media contact details are not allowed here.",
  },

  // ─── 8. General Off-Platform Redirection ───────────────────────────────────
  {
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    message: "Email addresses are not allowed here.",
  },
  {
    pattern: /(?:\+?\d[\d\s().-]{6,}\d)/g,
    message: "Phone numbers are not allowed here.",
  },
  {
    pattern:
      /\b(website|web\s*site|blog|personal\s*site|personal\s*page|linktree|link\s*tree|linktr\.ee|link\.in|bio\.link|beacons\.ai|carrd\.co|about\.me|v\.me|cal\.endly|calendly(?:\s*link)?|schedul(?:e|ing)|book(?:\s*me|ing)?|appointment\s*link|booking\s*link)\b/gi,
    message: "External website links are not allowed here.",
  },
];

export const normalizeModeratedText = (value = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

export const getCreateDateTextModerationError = (value = "") => {
  const normalizedValue = normalizeModeratedText(value);

  if (!normalizedValue) {
    return "";
  }

  const blockedMatch = BLOCKED_PATTERNS.find(({ pattern }) =>
    pattern.test(normalizedValue)
  );

  return blockedMatch?.message || "";
};