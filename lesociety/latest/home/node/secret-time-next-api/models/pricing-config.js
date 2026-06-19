const mongoose = require("mongoose");
const { clonePricingContent } = require("../lib/pricingConfig");

const { Schema } = mongoose;

const DiscountOptionSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    percentageOff: { type: Number, required: true, min: 0, max: 50 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const PricingConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    contentVersion: { type: Number, default: 2 },
    paywallEnabled: { type: Boolean, default: true },
    menInterestedPrice: { type: Number, default: 2, min: 0 },
    menSuperInterestedPrice: { type: Number, default: 4, min: 0 },
    menMinimumPurchase: { type: Number, default: 25, min: 0 },
    womenALaCartePrice: { type: Number, default: 0.5, min: 0 },
    womenQueensBundlePrice: { type: Number, default: 25, min: 0 },
    womenQueensBundleChats: { type: Number, default: 100, min: 1 },
    womenMinimumPurchase: { type: Number, default: 10, min: 0 },
    defaultOfferHours: { type: Number, default: 48, min: 1 },
    activeDiscountKey: { type: String, default: "" },
    discountOptions: {
      type: [DiscountOptionSchema],
      default: [
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
    },
    content: {
      type: Schema.Types.Mixed,
      default: () => clonePricingContent(),
    },
    updatedBy: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("pricing_config", PricingConfigSchema);
