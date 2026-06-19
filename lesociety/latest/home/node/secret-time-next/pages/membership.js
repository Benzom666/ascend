import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import withAuth from "@/core/withAuth";
const close1 = "/assets/close1.png";
import Image from "next/image";
import {
  createPayment,
  isCompletedPaymentStatus,
  redirectToPostPaymentHome,
  redirectToPayment,
  refreshAuthenticatedUser,
} from "@/utils/payment";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import {
  applyDiscount,
  fetchPricingConfig,
  formatPricingNumber,
  formatPricingTemplate,
  getDefaultPricingConfig,
  resolveActiveDiscount,
} from "@/utils/pricingConfig";

function Membership() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);
  const [interestedCount, setInterestedCount] = useState(0);
  const [superInterestedCount, setSuperInterestedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(getDefaultPricingConfig());

  useEffect(() => {
    let active = true;

    const loadPricingConfig = async () => {
      try {
        const config = await fetchPricingConfig(user?.token);
        if (active) {
          setPricingConfig(config);
        }
      } catch (configError) {
        if (active) {
          setPricingConfig(getDefaultPricingConfig());
        }
      }
    };

    loadPricingConfig();

    return () => {
      active = false;
    };
  }, [user?.token]);

  const interestedPrice = Number(pricingConfig?.menInterestedPrice ?? 2);
  const superInterestedPrice = Number(pricingConfig?.menSuperInterestedPrice ?? 4);
  const subtotal =
    interestedCount * interestedPrice + superInterestedCount * superInterestedPrice;
  const activeDiscount = resolveActiveDiscount(pricingConfig);
  const totalPrice = applyDiscount(subtotal, activeDiscount);
  const minimumPurchase = Number(pricingConfig?.menMinimumPurchase ?? 25);
  const menPricingContent =
    pricingConfig?.content?.pricingMenus?.men ||
    getDefaultPricingConfig().content.pricingMenus.men;

  const handleClose = () => {
    router.back();
  };

  const handlePurchase = async () => {
    if (totalPrice < minimumPurchase) {
      alert(
        formatPricingTemplate(menPricingContent.minPurchaseAlertTemplate, {
          amount: formatPricingNumber(minimumPurchase),
        })
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment with BucksBus
      const response = await createPayment({
        amount: totalPrice,
        currency: 'USD',
        interested_tokens: interestedCount,
        super_interested_tokens: superInterestedCount,
        provider: 'transak',
      });

      if (response.success && isCompletedPaymentStatus(response?.data?.status)) {
        const refreshedUser = await refreshAuthenticatedUser();
        if (refreshedUser) {
          dispatch({
            type: AUTHENTICATE_UPDATE,
            payload: refreshedUser,
          });
        }
        setIsLoading(false);
        redirectToPostPaymentHome();
        return;
      }

      if (response.success && response.data.payment_url) {
        // Redirect to BucksBus payment page
        redirectToPayment(response.data.payment_url);
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to create payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="membership-page">
      {/* Close Button */}
      <button className="close-btn" onClick={handleClose}>
        <Image src={close1} alt="Close" width={12} height={12} />
      </button>

      <div className="membership-container">
        {/* Interested Plan */}
        <div className="plan-card">
          <div className="plan-header">
            <div className="plan-title-section">
                <h2 className="plan-title">
                {menPricingContent.interested.title}
              </h2>
              <div className="plan-info">
                <h3 className="plan-tagline">{menPricingContent.interested.subtitle}</h3>
                <p className="plan-price">
                  ${interestedPrice.toFixed(2)}
                  {menPricingContent.interested.priceSuffix}
                </p>
              </div>
            </div>
            <div className="plan-arrows">
              <img src="/images/sidebar/arrow-right.svg" alt="" className="arrow-icon" />
            </div>
          </div>

          <div className="quantity-selector">
            <button
              className="qty-btn"
              onClick={() => setInterestedCount(Math.max(0, interestedCount - 1))}
            >
              −
            </button>
            <div className="qty-display">
              <span className="qty-number">{interestedCount}</span>
            </div>
            <button
              className="qty-btn"
              onClick={() => setInterestedCount(interestedCount + 1)}
            >
              +
            </button>
          </div>

          <div className="plan-features">
            <p className="features-title">Features:</p>
            {menPricingContent.interested.bullets.map((bullet) => (
              <p key={bullet} className="feature-item">
                - {bullet}
              </p>
            ))}
          </div>
        </div>

        {/* Super Interested Plan */}
        <div className="plan-card super-interested">
          <div className="plan-header">
            <div className="plan-title-section">
              <h2 className="plan-title">
                {menPricingContent.superInterested.title}
              </h2>
              <div className="plan-info">
                <h3 className="plan-tagline">
                  <img src="/images/sidebar/bolt-yellow.svg" alt="" className="bolt-icon" />
                  {menPricingContent.superInterested.subtitle}
                </h3>
                <p className="plan-price">
                  ${superInterestedPrice.toFixed(2)}
                  {menPricingContent.superInterested.priceSuffix}
                </p>
              </div>
            </div>
            <div className="plan-arrows double-arrows">
              <img src="/images/sidebar/arrow-right.svg" alt="" className="arrow-icon" />
              <img src="/images/sidebar/arrow-right.svg" alt="" className="arrow-icon" />
            </div>
          </div>

          <div className="quantity-selector">
            <button
              className="qty-btn"
              onClick={() => setSuperInterestedCount(Math.max(0, superInterestedCount - 1))}
            >
              −
            </button>
            <div className="qty-display">
              <span className="qty-number">{superInterestedCount}</span>
            </div>
            <button
              className="qty-btn"
              onClick={() => setSuperInterestedCount(superInterestedCount + 1)}
            >
              +
            </button>
          </div>

          <div className="plan-features">
            <p className="features-title">Features:</p>
            {menPricingContent.superInterested.bullets.map((bullet) => (
              <p key={bullet} className="feature-item">
                - {bullet}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <p className="disclaimer">
          {activeDiscount
            ? formatPricingTemplate(menPricingContent.footerDiscountTemplate, {
                label: activeDiscount.label,
                amount: formatPricingNumber(minimumPurchase),
              })
            : formatPricingTemplate(menPricingContent.footerNoDiscountTemplate, {
                amount: formatPricingNumber(minimumPurchase),
              })}
        </p>
        {activeDiscount && subtotal !== totalPrice ? (
          <p className="disclaimer">
            {formatPricingTemplate(menPricingContent.discountSubtotalTemplate, {
              amount: subtotal.toFixed(2),
            })}{" "}
            •{" "}
            {formatPricingTemplate(menPricingContent.discountTotalTemplate, {
              amount: totalPrice.toFixed(2),
            })}
          </p>
        ) : null}
        {error && <p className="error-message">{error}</p>}
        <button 
          className="cta-btn" 
          onClick={handlePurchase}
          disabled={isLoading || totalPrice < minimumPurchase}
        >
          {isLoading
            ? menPricingContent.processingCheckoutLabel
            : `($${totalPrice.toFixed(2)}) ${menPricingContent.checkoutLabel}`}
        </button>
      </div>
    </div>
  );
}

export default withAuth(Membership);
