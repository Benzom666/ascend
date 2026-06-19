const token = (name) => `{{${name}}}`;

export const DEFAULT_PRICING_CONFIG = {
  key: "default",
  contentVersion: 2,
  paywallEnabled: true,
  menInterestedPrice: 2,
  menSuperInterestedPrice: 4,
  menMinimumPurchase: 25,
  womenALaCartePrice: 0.5,
  womenQueensBundlePrice: 25,
  womenQueensBundleChats: 100,
  womenMinimumPurchase: 10,
  defaultOfferHours: 48,
  activeDiscountKey: "",
  discountOptions: [
    {
      key: "promo_25_off",
      label: "25% Off",
      percentageOff: 25,
      enabled: true,
    },
    {
      key: "promo_50_off",
      label: "50% Off",
      percentageOff: 50,
      enabled: true,
    },
  ],
  content: {
    paywalls: {
      menFirstDate: {
        title: "She's Offering A First Date! Don't Miss It.",
        subtitle:
          "She's real, verified, and driven - her goals deserve men who value them.",
        offerTitleDefault: "Exclusive Token Pricing",
        offerTitleTemplate: `${token("percentageOff")}% Off Selected Tokens`,
        offerSubtitle: "Limited-Time Only",
        timerTemplate: "Exclusive offer ends in {{timeRemaining}}",
        ctaLabel: "View Token Pricing",
        footer:
          "This plan is only available for a limited time. No hidden fees or strings attached, you can cancel anytime.",
      },
      womenChat: {
        title: "Don't let your new\ninterests slip away",
        subtitle:
          "Your first 15 introductions were on us.\nUnlock the rest and see who's chosen you\nbefore they disappear.",
        offerTitleDefault: `$${token("bundlePrice")} for ${token("bundleChats")} chats`,
        offerTitleTemplate: `${token("percentageOff")}% Off Active Now`,
        offerSubtitle: "Limited time only",
        timerTemplate: "This Interest expires in {{timeRemaining}}",
        ctaLabel: "VIEW PRICING",
        footer: "Pay only for what you use. No recurring fees.",
      },
    },
    pricingMenus: {
      men: {
        interested: {
          title: "Interested",
          subtitle: "Show You're Committed",
          priceSuffix: "/message",
          bullets: [
            "Show you're a gentleman by committing to her date and covering the outing.",
            "Standard visibility.",
          ],
        },
        superInterested: {
          title: "Super Interested",
          subtitle: "Supercharge Your Presence",
          priceSuffix: "/message",
          bullets: [
            "Go VIP by investing in her aspirations and increasing your chance. You'll also cover her date outing.",
            "3x more responses. Priority visibility.",
          ],
        },
        footerNoDiscountTemplate: `*Min purchase of $${token("amount")}`,
        footerDiscountTemplate: `${token("label")} applied. Min purchase of $${token("amount")}`,
        discountSubtotalTemplate: `Subtotal $${token("amount")}`,
        discountTotalTemplate: `$${token("amount")} after discount`,
        checkoutLabel: "Proceed to Checkout",
        processingCheckoutLabel: "Processing...",
        minPurchaseAlertTemplate: `Minimum purchase of $${token("amount")} required`,
      },
      women: {
        aLaCarte: {
          title: "A La Carte",
          subtitle: "Pay As You Go",
          priceSuffix: " / per new chat",
          bullets: [
            "Perfect for keep trying it out",
            "Your credits stay active until used.",
          ],
        },
        queensBundle: {
          title: "Queens Bundle",
          subtitle: "Maximize Your Experience",
          priceSuffix: " for package",
          bundleCountLabel: "New Chats",
          bullets: ["Best Value (25 Cents per chat)"],
        },
        footerNoDiscountTemplate: `*Min purchase of $${token("amount")}`,
        footerDiscountTemplate: `${token("label")} applied. Min purchase of $${token("amount")}`,
        discountSubtotalTemplate: `Subtotal $${token("amount")}`,
        discountTotalTemplate: `$${token("amount")} after discount`,
        checkoutLabel: "Proceed to Checkout",
        processingCheckoutLabel: "Processing...",
        minPurchaseAlertTemplate: `Minimum purchase of $${token("amount")} required`,
      },
    },
  },
  updatedBy: "",
};

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const mergeDeep = (baseValue, incomingValue) => {
  if (Array.isArray(baseValue)) {
    return Array.isArray(incomingValue) && incomingValue.length
      ? incomingValue
      : cloneValue(baseValue);
  }

  if (
    baseValue &&
    typeof baseValue === "object" &&
    !Array.isArray(baseValue)
  ) {
    const nextValue = { ...baseValue };
    const sourceValue =
      incomingValue && typeof incomingValue === "object" ? incomingValue : {};

    Object.keys(baseValue).forEach((key) => {
      nextValue[key] = mergeDeep(baseValue[key], sourceValue[key]);
    });

    return nextValue;
  }

  return incomingValue === undefined || incomingValue === null
    ? baseValue
    : incomingValue;
};

export const createDefaultPricingConfig = () => cloneValue(DEFAULT_PRICING_CONFIG);

export const mergePricingConfig = (config = {}) => {
  const defaults = createDefaultPricingConfig();

  return {
    ...defaults,
    ...config,
    discountOptions:
      Array.isArray(config?.discountOptions) && config.discountOptions.length
        ? config.discountOptions
        : defaults.discountOptions,
    content: mergeDeep(defaults.content, config?.content),
  };
};

export const formatBulletTextarea = (items = []) =>
  (Array.isArray(items) ? items : []).join("\n");

export const parseBulletTextarea = (value = "") =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
