import axios from "axios";
import { apiURL } from "./Utilities";
import { getCookie } from "./cookie";
import { loadFromLocalStorage } from "./sessionStorage";

const DEFAULT_DISCOUNT_OPTIONS = [
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
];

const DEFAULT_PRICING_CONTENT = {
  paywalls: {
    menFirstDate: {
      title: "She's Offering A First Date! Don't Miss It.",
      subtitle:
        "She's real, verified, and driven - her goals deserve men who value them.",
      offerTitleDefault: "Exclusive Token Pricing",
      offerTitleTemplate: "{{percentageOff}}% Off Selected Tokens",
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
      offerTitleDefault: "${{bundlePrice}} for {{bundleChats}} chats",
      offerTitleTemplate: "{{percentageOff}}% Off Active Now",
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
      footerNoDiscountTemplate: "*Min purchase of ${{amount}}",
      footerDiscountTemplate: "{{label}} applied. Min purchase of ${{amount}}",
      discountSubtotalTemplate: "Subtotal ${{amount}}",
      discountTotalTemplate: "${{amount}} after discount",
      checkoutLabel: "Proceed to Checkout",
      processingCheckoutLabel: "Processing...",
      minPurchaseAlertTemplate: "Minimum purchase of ${{amount}} required",
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
      footerNoDiscountTemplate: "*Min purchase of ${{amount}}",
      footerDiscountTemplate: "{{label}} applied. Min purchase of ${{amount}}",
      discountSubtotalTemplate: "Subtotal ${{amount}}",
      discountTotalTemplate: "${{amount}} after discount",
      checkoutLabel: "Proceed to Checkout",
      processingCheckoutLabel: "Processing...",
      minPurchaseAlertTemplate: "Minimum purchase of ${{amount}} required",
    },
  },
};

const DEFAULT_PRICING_CONFIG = {
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
  discountOptions: DEFAULT_DISCOUNT_OPTIONS,
  content: DEFAULT_PRICING_CONTENT,
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

export const getDefaultPricingConfig = () => cloneValue(DEFAULT_PRICING_CONFIG);

export const mergePricingConfig = (config = {}) => {
  const defaults = getDefaultPricingConfig();

  return {
    ...defaults,
    ...config,
    discountOptions: Array.isArray(config?.discountOptions) && config.discountOptions.length
      ? config.discountOptions
      : defaults.discountOptions,
    content: mergeDeep(defaults.content, config?.content),
  };
};

export const resolveActiveDiscount = (config = DEFAULT_PRICING_CONFIG) => {
  const options = Array.isArray(config?.discountOptions)
    ? config.discountOptions
    : [];

  return (
    options.find(
      (option) =>
        option?.enabled && option?.key === String(config?.activeDiscountKey || "")
    ) || null
  );
};

export const applyDiscount = (amount, discountOption) => {
  const numericAmount = Number(amount || 0);
  const percentageOff = Number(discountOption?.percentageOff || 0);

  if (!discountOption || percentageOff <= 0) {
    return Number(numericAmount.toFixed(2));
  }

  const discountedAmount = numericAmount * (1 - percentageOff / 100);
  return Number(Math.max(discountedAmount, 0).toFixed(2));
};

export const formatPricingNumber = (value) => {
  const numericValue = Number(value || 0);

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2);
};

export const formatPricingTemplate = (template = "", values = {}) =>
  String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) =>
    values[key] === undefined || values[key] === null ? "" : String(values[key])
  );

const resolvePricingConfigToken = (explicitToken = "") => {
  if (explicitToken) {
    return explicitToken;
  }

  const sessionAuth = loadFromLocalStorage();
  if (sessionAuth?.user?.token) {
    return sessionAuth.user.token;
  }

  if (typeof window !== "undefined") {
    try {
      const localAuth = window.localStorage?.getItem("auth");
      if (localAuth) {
        const parsedAuth = JSON.parse(localAuth);
        if (parsedAuth?.user?.token) {
          return parsedAuth.user.token;
        }
      }
    } catch (error) {
      console.log("[PRICING CONFIG] Failed to parse local auth", error);
    }
  }

  const cookieAuth = getCookie("auth");
  if (cookieAuth) {
    try {
      return JSON.parse(decodeURIComponent(cookieAuth))?.user?.token || "";
    } catch (error) {
      console.log("[PRICING CONFIG] Failed to parse auth cookie", error);
    }
  }

  return getCookie("token") || "";
};

export const fetchPricingConfig = async (token = "") => {
  const resolvedToken = resolvePricingConfigToken(token);
  const response = await axios.get(`${apiURL}/api/v1/dashboard/pricing-config`, {
    headers: resolvedToken
      ? {
          Authorization: `Bearer ${resolvedToken}`,
        }
      : undefined,
  });

  return mergePricingConfig(response?.data?.data || {});
};
