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

const MAX_TEXT_LENGTH = 320;
const MAX_TEXTAREA_LENGTH = 900;
const MAX_BULLETS = 4;
const MAX_BULLET_LENGTH = 220;

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const sanitizeString = (value, fallback, maxLength = MAX_TEXT_LENGTH, allowEmpty = false) => {
  const normalized =
    typeof value === "string"
      ? value
      : value === null || value === undefined
        ? ""
        : String(value);

  const trimmed = normalized.trim();

  if (!trimmed) {
    return allowEmpty ? "" : fallback;
  }

  return trimmed.slice(0, maxLength);
};

const sanitizeStringArray = (value, fallback) => {
  const arrayValue = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const normalized = arrayValue
    .map((item) => sanitizeString(item, "", MAX_BULLET_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_BULLETS);

  return normalized.length ? normalized : fallback;
};

const normalizeDiscountOptions = (options = DEFAULT_DISCOUNT_OPTIONS) => {
  const normalizedOptions = Array.isArray(options)
    ? options
        .map((option, index) => ({
          key: sanitizeString(
            option?.key,
            `discount_${index + 1}`,
            80
          ).replace(/\s+/g, "_"),
          label: sanitizeString(option?.label, `Discount ${index + 1}`, 80),
          percentageOff: Math.min(
            Math.max(Number(option?.percentageOff || 0), 0),
            50
          ),
          enabled: option?.enabled !== false,
        }))
        .filter((option) => option.label && option.key)
    : cloneValue(DEFAULT_DISCOUNT_OPTIONS);

  return normalizedOptions.length >= 2
    ? normalizedOptions
    : cloneValue(DEFAULT_DISCOUNT_OPTIONS);
};

const normalizePricingContent = (content = {}, existingContent = DEFAULT_PRICING_CONTENT) => {
  const paywalls = content?.paywalls || {};
  const existingPaywalls = existingContent?.paywalls || DEFAULT_PRICING_CONTENT.paywalls;
  const pricingMenus = content?.pricingMenus || {};
  const existingMenus = existingContent?.pricingMenus || DEFAULT_PRICING_CONTENT.pricingMenus;

  return {
    paywalls: {
      menFirstDate: {
        title: sanitizeString(
          paywalls?.menFirstDate?.title,
          existingPaywalls.menFirstDate.title,
          MAX_TEXTAREA_LENGTH
        ),
        subtitle: sanitizeString(
          paywalls?.menFirstDate?.subtitle,
          existingPaywalls.menFirstDate.subtitle,
          MAX_TEXTAREA_LENGTH
        ),
        offerTitleDefault: sanitizeString(
          paywalls?.menFirstDate?.offerTitleDefault,
          existingPaywalls.menFirstDate.offerTitleDefault,
          MAX_TEXTAREA_LENGTH
        ),
        offerTitleTemplate: sanitizeString(
          paywalls?.menFirstDate?.offerTitleTemplate,
          existingPaywalls.menFirstDate.offerTitleTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        offerSubtitle: sanitizeString(
          paywalls?.menFirstDate?.offerSubtitle,
          existingPaywalls.menFirstDate.offerSubtitle
        ),
        timerTemplate: sanitizeString(
          paywalls?.menFirstDate?.timerTemplate,
          existingPaywalls.menFirstDate.timerTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        ctaLabel: sanitizeString(
          paywalls?.menFirstDate?.ctaLabel,
          existingPaywalls.menFirstDate.ctaLabel
        ),
        footer: sanitizeString(
          paywalls?.menFirstDate?.footer,
          existingPaywalls.menFirstDate.footer,
          MAX_TEXTAREA_LENGTH
        ),
      },
      womenChat: {
        title: sanitizeString(
          paywalls?.womenChat?.title,
          existingPaywalls.womenChat.title,
          MAX_TEXTAREA_LENGTH
        ),
        subtitle: sanitizeString(
          paywalls?.womenChat?.subtitle,
          existingPaywalls.womenChat.subtitle,
          MAX_TEXTAREA_LENGTH
        ),
        offerTitleDefault: sanitizeString(
          paywalls?.womenChat?.offerTitleDefault,
          existingPaywalls.womenChat.offerTitleDefault,
          MAX_TEXTAREA_LENGTH
        ),
        offerTitleTemplate: sanitizeString(
          paywalls?.womenChat?.offerTitleTemplate,
          existingPaywalls.womenChat.offerTitleTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        offerSubtitle: sanitizeString(
          paywalls?.womenChat?.offerSubtitle,
          existingPaywalls.womenChat.offerSubtitle
        ),
        timerTemplate: sanitizeString(
          paywalls?.womenChat?.timerTemplate,
          existingPaywalls.womenChat.timerTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        ctaLabel: sanitizeString(
          paywalls?.womenChat?.ctaLabel,
          existingPaywalls.womenChat.ctaLabel
        ),
        footer: sanitizeString(
          paywalls?.womenChat?.footer,
          existingPaywalls.womenChat.footer,
          MAX_TEXTAREA_LENGTH
        ),
      },
    },
    pricingMenus: {
      men: {
        interested: {
          title: sanitizeString(
            pricingMenus?.men?.interested?.title,
            existingMenus.men.interested.title,
            MAX_TEXTAREA_LENGTH,
            true
          ),
          subtitle: sanitizeString(
            pricingMenus?.men?.interested?.subtitle,
            existingMenus.men.interested.subtitle
          ),
          priceSuffix: sanitizeString(
            pricingMenus?.men?.interested?.priceSuffix,
            existingMenus.men.interested.priceSuffix
          ),
          bullets: sanitizeStringArray(
            pricingMenus?.men?.interested?.bullets,
            existingMenus.men.interested.bullets
          ),
        },
        superInterested: {
          title: sanitizeString(
            pricingMenus?.men?.superInterested?.title,
            existingMenus.men.superInterested.title,
            MAX_TEXTAREA_LENGTH,
            true
          ),
          subtitle: sanitizeString(
            pricingMenus?.men?.superInterested?.subtitle,
            existingMenus.men.superInterested.subtitle
          ),
          priceSuffix: sanitizeString(
            pricingMenus?.men?.superInterested?.priceSuffix,
            existingMenus.men.superInterested.priceSuffix
          ),
          bullets: sanitizeStringArray(
            pricingMenus?.men?.superInterested?.bullets,
            existingMenus.men.superInterested.bullets
          ),
        },
        footerNoDiscountTemplate: sanitizeString(
          pricingMenus?.men?.footerNoDiscountTemplate,
          existingMenus.men.footerNoDiscountTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        footerDiscountTemplate: sanitizeString(
          pricingMenus?.men?.footerDiscountTemplate,
          existingMenus.men.footerDiscountTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        discountSubtotalTemplate: sanitizeString(
          pricingMenus?.men?.discountSubtotalTemplate,
          existingMenus.men.discountSubtotalTemplate
        ),
        discountTotalTemplate: sanitizeString(
          pricingMenus?.men?.discountTotalTemplate,
          existingMenus.men.discountTotalTemplate
        ),
        checkoutLabel: sanitizeString(
          pricingMenus?.men?.checkoutLabel,
          existingMenus.men.checkoutLabel
        ),
        processingCheckoutLabel: sanitizeString(
          pricingMenus?.men?.processingCheckoutLabel,
          existingMenus.men.processingCheckoutLabel
        ),
        minPurchaseAlertTemplate: sanitizeString(
          pricingMenus?.men?.minPurchaseAlertTemplate,
          existingMenus.men.minPurchaseAlertTemplate,
          MAX_TEXTAREA_LENGTH
        ),
      },
      women: {
        aLaCarte: {
          title: sanitizeString(
            pricingMenus?.women?.aLaCarte?.title,
            existingMenus.women.aLaCarte.title
          ),
          subtitle: sanitizeString(
            pricingMenus?.women?.aLaCarte?.subtitle,
            existingMenus.women.aLaCarte.subtitle
          ),
          priceSuffix: sanitizeString(
            pricingMenus?.women?.aLaCarte?.priceSuffix,
            existingMenus.women.aLaCarte.priceSuffix
          ),
          bullets: sanitizeStringArray(
            pricingMenus?.women?.aLaCarte?.bullets,
            existingMenus.women.aLaCarte.bullets
          ),
        },
        queensBundle: {
          title: sanitizeString(
            pricingMenus?.women?.queensBundle?.title,
            existingMenus.women.queensBundle.title
          ),
          subtitle: sanitizeString(
            pricingMenus?.women?.queensBundle?.subtitle,
            existingMenus.women.queensBundle.subtitle
          ),
          priceSuffix: sanitizeString(
            pricingMenus?.women?.queensBundle?.priceSuffix,
            existingMenus.women.queensBundle.priceSuffix
          ),
          bundleCountLabel: sanitizeString(
            pricingMenus?.women?.queensBundle?.bundleCountLabel,
            existingMenus.women.queensBundle.bundleCountLabel
          ),
          bullets: sanitizeStringArray(
            pricingMenus?.women?.queensBundle?.bullets,
            existingMenus.women.queensBundle.bullets
          ),
        },
        footerNoDiscountTemplate: sanitizeString(
          pricingMenus?.women?.footerNoDiscountTemplate,
          existingMenus.women.footerNoDiscountTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        footerDiscountTemplate: sanitizeString(
          pricingMenus?.women?.footerDiscountTemplate,
          existingMenus.women.footerDiscountTemplate,
          MAX_TEXTAREA_LENGTH
        ),
        discountSubtotalTemplate: sanitizeString(
          pricingMenus?.women?.discountSubtotalTemplate,
          existingMenus.women.discountSubtotalTemplate
        ),
        discountTotalTemplate: sanitizeString(
          pricingMenus?.women?.discountTotalTemplate,
          existingMenus.women.discountTotalTemplate
        ),
        checkoutLabel: sanitizeString(
          pricingMenus?.women?.checkoutLabel,
          existingMenus.women.checkoutLabel
        ),
        processingCheckoutLabel: sanitizeString(
          pricingMenus?.women?.processingCheckoutLabel,
          existingMenus.women.processingCheckoutLabel
        ),
        minPurchaseAlertTemplate: sanitizeString(
          pricingMenus?.women?.minPurchaseAlertTemplate,
          existingMenus.women.minPurchaseAlertTemplate,
          MAX_TEXTAREA_LENGTH
        ),
      },
    },
  };
};

const getDefaultPricingConfig = () => ({
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
  discountOptions: cloneValue(DEFAULT_DISCOUNT_OPTIONS),
  content: cloneValue(DEFAULT_PRICING_CONTENT),
  updatedBy: "",
});

const normalizePricingConfigPayload = (
  payload = {},
  existingConfig = getDefaultPricingConfig(),
  updatedBy = ""
) => {
  const discountOptions = normalizeDiscountOptions(
    payload.discountOptions || existingConfig.discountOptions
  );
  const activeDiscountKey = sanitizeString(payload.activeDiscountKey, "", 80);
  const hasActiveDiscount = discountOptions.some(
    (option) => option.enabled && option.key === activeDiscountKey
  );

  return {
    paywallEnabled:
      typeof payload.paywallEnabled === "boolean"
        ? payload.paywallEnabled
        : existingConfig.paywallEnabled,
    menInterestedPrice: Math.max(
      0,
      Number(payload.menInterestedPrice ?? existingConfig.menInterestedPrice ?? 2)
    ),
    menSuperInterestedPrice: Math.max(
      0,
      Number(
        payload.menSuperInterestedPrice ?? existingConfig.menSuperInterestedPrice ?? 4
      )
    ),
    menMinimumPurchase: Math.max(
      0,
      Number(payload.menMinimumPurchase ?? existingConfig.menMinimumPurchase ?? 25)
    ),
    womenALaCartePrice: Math.max(
      0,
      Number(payload.womenALaCartePrice ?? existingConfig.womenALaCartePrice ?? 0.5)
    ),
    womenQueensBundlePrice: Math.max(
      0,
      Number(
        payload.womenQueensBundlePrice ?? existingConfig.womenQueensBundlePrice ?? 25
      )
    ),
    womenQueensBundleChats: Math.max(
      1,
      Number(
        payload.womenQueensBundleChats ?? existingConfig.womenQueensBundleChats ?? 100
      )
    ),
    womenMinimumPurchase: Math.max(
      0,
      Number(payload.womenMinimumPurchase ?? existingConfig.womenMinimumPurchase ?? 10)
    ),
    defaultOfferHours: Math.max(
      1,
      Number(payload.defaultOfferHours ?? existingConfig.defaultOfferHours ?? 48)
    ),
    activeDiscountKey: hasActiveDiscount ? activeDiscountKey : "",
    discountOptions,
    contentVersion: 2,
    content: normalizePricingContent(payload.content, existingConfig.content),
    updatedBy: sanitizeString(
      payload.updatedBy,
      updatedBy || existingConfig.updatedBy || "",
      120
    ),
  };
};

const mergePricingConfig = (config = {}) =>
  ({
    ...getDefaultPricingConfig(),
    ...normalizePricingConfigPayload(config, getDefaultPricingConfig(), config?.updatedBy || ""),
  });

module.exports = {
  DEFAULT_DISCOUNT_OPTIONS,
  DEFAULT_PRICING_CONTENT,
  getDefaultPricingConfig,
  clonePricingContent: () => cloneValue(DEFAULT_PRICING_CONTENT),
  clonePricingConfig: () => cloneValue(getDefaultPricingConfig()),
  normalizePricingContent,
  normalizePricingConfigPayload,
  normalizeDiscountOptions,
  mergePricingConfig,
};
