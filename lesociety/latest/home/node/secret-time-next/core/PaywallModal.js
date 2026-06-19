import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import PricingMenuModal from "./PricingMenuModal";
import TimerProgressBar from "../components/TimerProgressBar";
import {
  resolveActiveDiscount,
  getDefaultPricingConfig,
  formatPricingNumber,
  formatPricingTemplate,
} from "../utils/pricingConfig";

const PaywallModal = ({ 
  isOpen, 
  onClose, 
  type = "men_first_date", // "men_first_date" | "ladies_chat" | "ladies_interest"
  expiresIn = 48, // hours
  userName = "Someone",
  pricingConfig = getDefaultPricingConfig(),
}) => {
  const [showPricing, setShowPricing] = useState(false);
  const [isCtaLoading, setIsCtaLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiresIn * 3600); // Convert to seconds
  const [countdownDuration, setCountdownDuration] = useState(expiresIn * 3600);
  const user = useSelector((state) => state.authReducer.user);
  const isFemale = user?.gender === "female";
  const activeDiscount = resolveActiveDiscount(pricingConfig);
  const defaults = getDefaultPricingConfig();
  const menPaywallContent =
    pricingConfig?.content?.paywalls?.menFirstDate ||
    defaults.content.paywalls.menFirstDate;
  const womenPaywallContent =
    pricingConfig?.content?.paywalls?.womenChat ||
    defaults.content.paywalls.womenChat;
  const womenBundlePrice = formatPricingNumber(
    pricingConfig?.womenQueensBundlePrice ?? defaults.womenQueensBundlePrice
  );
  const womenBundleChats = Number(
    pricingConfig?.womenQueensBundleChats ?? defaults.womenQueensBundleChats
  );
  const menTokenOfferText = activeDiscount
    ? formatPricingTemplate(menPaywallContent.offerTitleTemplate, {
        percentageOff: activeDiscount.percentageOff,
        label: activeDiscount.label,
      })
    : formatPricingTemplate(menPaywallContent.offerTitleDefault, {
        bundlePrice: womenBundlePrice,
        bundleChats: womenBundleChats,
      });
  const womenOfferText = activeDiscount
    ? formatPricingTemplate(womenPaywallContent.offerTitleTemplate, {
        percentageOff: activeDiscount.percentageOff,
        label: activeDiscount.label,
        bundlePrice: womenBundlePrice,
        bundleChats: womenBundleChats,
      })
    : formatPricingTemplate(womenPaywallContent.offerTitleDefault, {
        bundlePrice: womenBundlePrice,
        bundleChats: womenBundleChats,
      });

  useEffect(() => {
    if (!isOpen) return;
    setIsCtaLoading(false);
    setTimeLeft(expiresIn * 3600);
    setCountdownDuration(expiresIn * 3600);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expiresIn]);

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    return `${hours} hours`;
  };

  const handleViewPricing = () => {
    if (isCtaLoading) return;
    setShowPricing(true);
  };

  const handleClosePricing = () => {
    setShowPricing(false);
  };

  const handleClosePaywall = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setShowPricing(false);
    setIsCtaLoading(false);
    onClose?.();
  };

  if (!isOpen) return null;

  if (showPricing) {
    return (
      <PricingMenuModal
        isOpen={true}
        onClose={handleClosePricing}
        pricingConfig={pricingConfig}
        returnContext="paywall"
      />
    );
  }

  // Men's Paywall
  if (type === "men_first_date" && !isFemale) {
    return ReactDOM.createPortal(
      <ModalOverlay>
        <SlideUpContent $compact onClick={(e) => e.stopPropagation()}>
          <CloseButton
            type="button"
            aria-label="Close paywall"
            onClick={handleClosePaywall}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            ×
          </CloseButton>
          
          <Title>{menPaywallContent.title}</Title>
          
          <Subtitle>{menPaywallContent.subtitle}</Subtitle>
          
          <Offer>
            <OfferTitle>{menTokenOfferText}</OfferTitle>
            <OfferSubtitle>{menPaywallContent.offerSubtitle}</OfferSubtitle>
          </Offer>
          
          <TimerSection>
            <TimerText>
              {formatPricingTemplate(menPaywallContent.timerTemplate, {
                timeRemaining: formatTimeLeft(),
              })}
            </TimerText>
            <TimerProgressBar
              totalSeconds={expiresIn * 3600}
              remainingSeconds={timeLeft}
              maxWidth={280}
              height={6}
            />
          </TimerSection>
          
          <CTAButton onClick={handleViewPricing} disabled={isCtaLoading}>
            {isCtaLoading ? <ButtonSpinner /> : menPaywallContent.ctaLabel}
          </CTAButton>
          
          <FooterText>{menPaywallContent.footer}</FooterText>
        </SlideUpContent>
      </ModalOverlay>,
      document.body
    );
  }

  // Ladies Chat Paywall
  if ((type === "ladies_chat" || type === "ladies_interest") && isFemale) {
    return ReactDOM.createPortal(
      <ModalOverlay>
        <SlideUpContent $ladies onClick={(e) => e.stopPropagation()}>
          <CloseButton
            type="button"
            aria-label="Close paywall"
            onClick={handleClosePaywall}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            ×
          </CloseButton>
          
          <LadiesTitle>{womenPaywallContent.title}</LadiesTitle>
          
          <LadiesSubtitle>{womenPaywallContent.subtitle}</LadiesSubtitle>
          
          <LadiesOffer>
            <LadiesOfferPrice>{womenOfferText}</LadiesOfferPrice>
            <LadiesOfferSubtitle>{womenPaywallContent.offerSubtitle}</LadiesOfferSubtitle>
          </LadiesOffer>
          
          <LadiesTimerSection>
            <LadiesTimerText>
              {formatPricingTemplate(womenPaywallContent.timerTemplate, {
                timeRemaining: formatTimeLeft(),
              })}
            </LadiesTimerText>
            <TimerProgressBar
              totalSeconds={countdownDuration}
              remainingSeconds={timeLeft}
              maxWidth={280}
              height={6}
            />
          </LadiesTimerSection>
          
          <LadiesCTAButton onClick={handleViewPricing} disabled={isCtaLoading}>
            {isCtaLoading ? <ButtonSpinner /> : womenPaywallContent.ctaLabel}
          </LadiesCTAButton>
          
          <LadiesFooterText>{womenPaywallContent.footer}</LadiesFooterText>
        </SlideUpContent>
      </ModalOverlay>,
      document.body
    );
  }

  return null;
};

export default PaywallModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.04), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(126, 142, 168, 0.08), transparent 40%),
    rgba(5, 7, 12, 0.22);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  justify-content: center;
  align-items: safe flex-end;
  z-index: 20000;
  padding: 0 16px 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

const ModalContent = styled.div`
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.16) 0%,
      rgba(255, 255, 255, 0.06) 18%,
      rgba(255, 255, 255, 0.03) 100%
    ),
    rgba(14, 15, 19, 0.26);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  border: none;
  border-radius: 30px;
  width: 90%;
  max-width: 400px;
  padding: 32px 24px;
  position: relative;
  text-align: center;
  overflow: hidden;
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  animation: liquidIn 120ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0%,
        rgba(255, 255, 255, 0.03) 18%,
        rgba(255, 255, 255, 0.008) 50%,
        rgba(255, 255, 255, 0.004) 100%
      ),
      radial-gradient(120% 58% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 34%, transparent 68%),
      radial-gradient(24% 20% at 4% 96%, rgba(255, 255, 255, 0.14), transparent 68%),
      radial-gradient(24% 20% at 96% 96%, rgba(255, 255, 255, 0.12), transparent 68%);
    pointer-events: none;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0.05) 18%,
        rgba(255, 255, 255, 0.02) 100%
      ),
      rgba(14, 15, 19, 0.3);
  }

  @keyframes liquidIn {
    from {
      transform: translateY(8px) scale(0.985);
    }
    to {
      transform: translateY(0) scale(1);
    }
  }
`;

const SlideUpContent = styled(ModalContent)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: ${(props) => (props.$compact ? "360px" : props.$ladies ? "380px" : "100%")};
  width: ${(props) => (props.$compact ? "min(92vw, 360px)" : props.$ladies ? "min(92vw, 380px)" : "100%")};
  padding: ${(props) => (props.$compact ? "34px 14px 22px" : props.$ladies ? "34px 22px 26px" : "40px 0 32px")};
  border-radius: ${(props) => (props.$compact || props.$ladies ? "24px" : "24px 24px 0 0")};
  /* Defensive overflow handling: on very short viewports, allow the
     paywall body to scroll internally so the CTA stays reachable. */
  max-height: calc(100vh - 16px);
  max-height: calc(100dvh - 16px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
  background: transparent;
  border: none;
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 30px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 48px;
  text-align: center;
  font-weight: 400;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.72);
    outline-offset: 2px;
  }
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px;
  line-height: 1.3;
  padding: 0 16px;
  white-space: pre-line;
`;

const Subtitle = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 32px;
  line-height: 1.5;
  padding: 0 24px;
  white-space: pre-line;
`;

const Offer = styled.div`
  margin: 24px 0 8px;
  padding: 0 16px;
`;

const OfferTitle = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  line-height: 1.2;
`;

const OfferPrice = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  line-height: 1.2;
`;

const OfferSubtitle = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
`;

const TimerSection = styled.div`
  margin: 32px 0 24px;
  padding: 0 8px;
`;

const TimerText = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  text-align: center;
  letter-spacing: 0.3px;
`;

const CTAButton = styled.button`
  width: calc(100% - 32px);
  margin: 24px 16px 16px;
  background: linear-gradient(90deg, #F24462 0%, #E2466B 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 18px 20px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  min-height: 58px;
  transition: all 0.3s;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(242, 68, 98, 0.3);

  &:hover {
    background: linear-gradient(90deg, #E2466B 0%, #F24462 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(242, 68, 98, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.9;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonSpinner = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const FooterText = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
  margin: 12px 24px 0;
  line-height: 1.5;
  text-align: center;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  text-wrap: balance;
`;

const LadiesTitle = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 14px;
  line-height: 1.25;
  letter-spacing: 0.2px;
  white-space: pre-line;
`;

const LadiesSubtitle = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12.5px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 20px;
  line-height: 1.5;
  white-space: pre-line;
`;

const LadiesOffer = styled.div`
  margin: 12px 0 10px;
`;

const LadiesOfferPrice = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
`;

const LadiesOfferSubtitle = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
`;

const LadiesTimerSection = styled.div`
  margin: 18px 0 16px;
`;

const LadiesTimerText = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  text-align: center;
  letter-spacing: 0.3px;
`;

const LadiesCTAButton = styled(CTAButton)`
  margin: 18px 0 10px;
  width: 100%;
  border-radius: 12px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LadiesFooterText = styled(FooterText)`
  margin: 8px 0 0;
  font-size: 11px;
`;
