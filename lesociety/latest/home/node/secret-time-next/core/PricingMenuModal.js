import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
const close1 = "/assets/close1.png";
import Image from "next/image";
const arrow1 = "/assets/arrow1.svg";
const arrow2 = "/assets/arrow2.svg";
const interestedIcon = "/assets/interested.svg";
const superInterestedIcon = "/assets/superinterested.svg";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AUTHENTICATE_UPDATE } from "../modules/auth/actionConstants";
import {
  createPayment,
  isCompletedPaymentStatus,
  redirectToPostPaymentHome,
  redirectToPayment,
  refreshAuthenticatedUser,
} from "../utils/payment";
import { toast } from "react-toastify";
import {
  applyDiscount,
  getDefaultPricingConfig,
  formatPricingNumber,
  formatPricingTemplate,
  resolveActiveDiscount,
} from "../utils/pricingConfig";
import {
  readPaymentReturnState,
  savePaymentReturnState,
} from "../utils/paymentReturnState";

const PricingMenuModal = ({
  isOpen,
  onClose,
  pricingConfig = getDefaultPricingConfig(),
  returnContext = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const [marginComp, setMarginComp] = useState(0);
  const modalContentRef = useRef(null);
  const lastFemaleTapRef = useRef(0);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);
  const isFemale = user?.gender === "female";

  // Men's pricing state
  const [interestedCount, setInterestedCount] = useState(0);
  const [superInterestedCount, setSuperInterestedCount] = useState(0);

  // Women's pricing state
  const [aLaCarteCount, setALaCarteCount] = useState(0);
  const [queensBundleCount, setQueensBundleCount] = useState(0);
  const [womenCardFlash, setWomenCardFlash] = useState({
    aLaCarte: false,
    queensBundle: false,
  });

  const INTERESTED_PRICE = Number(pricingConfig?.menInterestedPrice ?? 2);
  const SUPER_INTERESTED_PRICE = Number(
    pricingConfig?.menSuperInterestedPrice ?? 4
  );
  const MIN_PURCHASE_MEN = Number(pricingConfig?.menMinimumPurchase ?? 25);

  const A_LA_CARTE_PRICE = Number(pricingConfig?.womenALaCartePrice ?? 0.5);
  const QUEENS_BUNDLE_PRICE = Number(
    pricingConfig?.womenQueensBundlePrice ?? 25
  );
  const QUEENS_BUNDLE_CHATS = Number(
    pricingConfig?.womenQueensBundleChats ?? 100
  );
  const MIN_PURCHASE_WOMEN = Number(pricingConfig?.womenMinimumPurchase ?? 10);
  const activeDiscount = resolveActiveDiscount(pricingConfig);
  const defaults = getDefaultPricingConfig();
  const menPricingContent =
    pricingConfig?.content?.pricingMenus?.men ||
    defaults.content.pricingMenus.men;
  const womenPricingContent =
    pricingConfig?.content?.pricingMenus?.women ||
    defaults.content.pricingMenus.women;

  const calculateTotal = () => {
    if (isFemale) {
      return (aLaCarteCount * A_LA_CARTE_PRICE) + (queensBundleCount * QUEENS_BUNDLE_PRICE);
    } else {
      return (interestedCount * INTERESTED_PRICE) + (superInterestedCount * SUPER_INTERESTED_PRICE);
    }
  };

  const calculateTotalChats = () => {
    return aLaCarteCount + (queensBundleCount * QUEENS_BUNDLE_CHATS);
  };

  const subtotal = calculateTotal();
  const total = applyDiscount(subtotal, activeDiscount);
  const minPurchase = isFemale ? MIN_PURCHASE_WOMEN : MIN_PURCHASE_MEN;
  const canCheckout = total >= minPurchase;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!canCheckout || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const existingReturnState = readPaymentReturnState();
      if (
        returnContext === "sidebar" ||
        !["message-modal", "user-list-message-modal"].includes(
          existingReturnState?.source
        )
      ) {
        savePaymentReturnState({
          source: returnContext === "sidebar" ? "sidebar" : "pricing-menu",
          returnContext,
          returnPath:
            returnContext === "sidebar"
              ? "/user/user-list"
              : `${window.location.pathname}${window.location.search}`,
        });
      }

      console.log('Creating BucksBus payment:', {
        isFemale,
        total,
        timestamp: new Date().toISOString()
      });

      if (isFemale) {
        const totalChats = calculateTotalChats();
        
        // Create payment via BucksBus for women (chat tokens)
        const response = await createPayment({
          amount: total,
          currency: 'USD',
          interested_tokens: 0,
          super_interested_tokens: 0,
          provider: 'transak',
          // Store chat info in metadata - will be processed by webhook
          metadata: {
            chat_tokens: totalChats,
            aLaCarteCount,
            queensBundleCount,
            return_context: returnContext,
          }
        });

        if (response.success && isCompletedPaymentStatus(response?.data?.status)) {
          const refreshedUser = await refreshAuthenticatedUser();
          if (refreshedUser) {
            dispatch({
              type: AUTHENTICATE_UPDATE,
              payload: refreshedUser,
            });
          }
          toast.success("Test payment completed. Chat tokens added to your account.");
          setIsProcessing(false);
          onClose?.();
          redirectToPostPaymentHome({ returnContext });
          return;
        }

        if (response.success && response.data.payment_url) {
          // Redirect to BucksBus payment page
          redirectToPayment(response.data.payment_url);
        } else {
          throw new Error('Payment URL not received');
        }
      } else {
        // Create payment via BucksBus for men (interested/super interested tokens)
        const response = await createPayment({
          amount: total,
          currency: 'USD',
          interested_tokens: interestedCount,
          super_interested_tokens: superInterestedCount,
          provider: 'transak',
          metadata: {
            return_context: returnContext,
          },
        });

        if (response.success && isCompletedPaymentStatus(response?.data?.status)) {
          const refreshedUser = await refreshAuthenticatedUser();
          if (refreshedUser) {
            dispatch({
              type: AUTHENTICATE_UPDATE,
              payload: refreshedUser,
            });
          }
          toast.success("Test payment completed. Tokens added to your account.");
          setIsProcessing(false);
          onClose?.();
          redirectToPostPaymentHome({ returnContext });
          return;
        }

        if (response.success && response.data.payment_url) {
          // Redirect to BucksBus payment page
          redirectToPayment(response.data.payment_url);
        } else {
          throw new Error('Payment URL not received');
        }
      }
    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.message || 'Failed to create payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleIncrement = (type) => {
    if (isFemale) {
      if (type === 'aLaCarte') {
        setALaCarteCount(prev => prev + 1);
        setWomenCardFlash((prev) => ({ ...prev, aLaCarte: true }));
        setTimeout(() => {
          setWomenCardFlash((prev) => ({ ...prev, aLaCarte: false }));
        }, 260);
      } else if (type === 'queensBundle') {
        setQueensBundleCount(prev => prev + 1);
      }
    } else {
      if (type === 'interested') {
        setInterestedCount(prev => prev + 1);
      } else {
        setSuperInterestedCount(prev => prev + 1);
      }
    }
  };

  const handleDecrement = (type) => {
    if (isFemale) {
      if (type === 'aLaCarte') {
        setALaCarteCount(prev => Math.max(0, prev - 1));
        setWomenCardFlash((prev) => ({ ...prev, aLaCarte: true }));
        setTimeout(() => {
          setWomenCardFlash((prev) => ({ ...prev, aLaCarte: false }));
        }, 260);
      } else if (type === 'queensBundle') {
        setQueensBundleCount(prev => Math.max(0, prev - 1));
      }
    } else {
      if (type === 'interested') {
        setInterestedCount(prev => Math.max(0, prev - 1));
      } else {
        setSuperInterestedCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !isFemale || !modalContentRef.current) return undefined;

    const modalNode = modalContentRef.current;

    const preventDoubleTapZoom = (event) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastFemaleTapRef.current;

      if (timeSinceLastTap > 0 && timeSinceLastTap < 300) {
        event.preventDefault();
        const interactiveTarget = event.target.closest(
          'button, [role="button"], a, input, select, textarea'
        );
        if (interactiveTarget) {
          interactiveTarget.click();
        }
      }

      lastFemaleTapRef.current = now;
    };

    const preventDoubleClickZoom = (event) => {
      event.preventDefault();
    };

    modalNode.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });
    modalNode.addEventListener("dblclick", preventDoubleClickZoom);

    return () => {
      modalNode.removeEventListener("touchend", preventDoubleTapZoom);
      modalNode.removeEventListener("dblclick", preventDoubleClickZoom);
    };
  }, [isFemale, isOpen]);

  // Scale-to-fit the modal on short desktop viewports so nothing is ever cut
  // off (see ModalContent styled rule). Measures the modal's natural height and
  // shrinks the whole thing uniformly to fit the viewport — automatic "zoom to
  // ~85%". A ResizeObserver re-runs it whenever the content height changes
  // (counter changes, discount summary / error row appearing, etc.).
  useEffect(() => {
    if (!isOpen) return undefined;
    const el = modalContentRef.current;
    if (!el) return undefined;

    const measure = () => {
      // Mobile keeps its fixed CSS scale; don't override it.
      if (window.innerWidth <= 768) {
        setFitScale(1);
        setMarginComp(0);
        return;
      }
      // offsetHeight is the natural, pre-transform layout height.
      const natural = el.offsetHeight;
      const available = window.innerHeight - 48; // overlay padding + breathing room
      const next = natural > available ? Math.max(available / natural, 0.5) : 1;
      setFitScale(next);
      // Collapse the empty layout space the transform leaves below the modal so
      // the overlay still centres it and never scrolls into blank space.
      setMarginComp(next < 1 ? -Math.round(natural * (1 - next)) : 0);
    };

    measure();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isOpen, isFemale]);

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={modalContentRef}
        $female={isFemale}
        $fitScale={fitScale}
        $marginComp={marginComp}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>
          <Image src={close1} alt="close" width={24} height={24} />
        </CloseButton>

        {isFemale ? (
          <>
            {/* Women's Pricing: A La' Carte */}
            <PricingCard
              $female
              $first
              $selected={aLaCarteCount > 0}
              $flash={womenCardFlash.aLaCarte}
            >
              <CardHeader $female>
                <TitleSection $female>
                  <WomenCardTitle>
                    <img
                      className="women-title-img women-title-alacarte"
                      src="/pricing/Alacarte.png"
                      alt="A La' Carte"
                    />
                  </WomenCardTitle>
                </TitleSection>
                <ArrowIcon $female>
                  <Image src={arrow1} alt="arrow" width={104} height={158} />
                </ArrowIcon>
              </CardHeader>
              <CardTitleText $female>{womenPricingContent.aLaCarte.title}</CardTitleText>
              <CardSubtitle $female>{womenPricingContent.aLaCarte.subtitle}</CardSubtitle>
              <CardPrice $female>
                ${A_LA_CARTE_PRICE.toFixed(2)}
                {womenPricingContent.aLaCarte.priceSuffix}
              </CardPrice>

              <CounterSection>
                <CounterButton onClick={() => handleDecrement('aLaCarte')} aria-label="Decrease A La Carte">−</CounterButton>
                <CounterValue $female>{aLaCarteCount}</CounterValue>
                <CounterButton onClick={() => handleIncrement('aLaCarte')} aria-label="Increase A La Carte">+</CounterButton>
              </CounterSection>

              <CardDescription $female>
                {womenPricingContent.aLaCarte.bullets.map((bullet) => (
                  <p key={bullet}>- {bullet}</p>
                ))}
              </CardDescription>
            </PricingCard>

            {/* Women's Pricing: Queens Bundle */}
            <PricingCard
              $female
              $selected={queensBundleCount > 0}
              $flash={womenCardFlash.queensBundle}
              onClick={() => {
                const nextValue = queensBundleCount > 0 ? 0 : 1;
                setQueensBundleCount(nextValue);
                setWomenCardFlash((prev) => ({ ...prev, queensBundle: true }));
                setTimeout(() => {
                  setWomenCardFlash((prev) => ({ ...prev, queensBundle: false }));
                }, 260);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const nextValue = queensBundleCount > 0 ? 0 : 1;
                  setQueensBundleCount(nextValue);
                  setWomenCardFlash((prev) => ({ ...prev, queensBundle: true }));
                  setTimeout(() => {
                    setWomenCardFlash((prev) => ({ ...prev, queensBundle: false }));
                  }, 260);
                }
              }}
            >
              <CardHeader $female>
                <TitleSection $female>
                  <WomenCardTitle>
                    <img
                      className="women-title-img women-title-queens"
                      src="/pricing/queensbundle.png"
                      alt="Queens Bundle"
                    />
                  </WomenCardTitle>
                </TitleSection>
                <ArrowIcon $female $bundle>
                  <SuperArrowStack>
                    <SuperArrowLarge>
                      <Image src={arrow1} alt="arrow" width={120} height={178} />
                    </SuperArrowLarge>
                    <SuperArrowSmall>
                      <Image src={arrow1} alt="arrow" width={96} height={144} />
                    </SuperArrowSmall>
                  </SuperArrowStack>
                </ArrowIcon>
              </CardHeader>
              <CardTitleText $female>{womenPricingContent.queensBundle.title}</CardTitleText>
              <CardSubtitle $female>
                <span style={{ marginRight: "6px", color: "#ffd54a", fontSize: "1.08em", lineHeight: 1 }}>⚡</span>
                {womenPricingContent.queensBundle.subtitle}
              </CardSubtitle>
              <CardPrice $female>
                ${QUEENS_BUNDLE_PRICE.toFixed(2)}
                {womenPricingContent.queensBundle.priceSuffix}
              </CardPrice>

              <BundleCountWrap>
                <BundleCountValue $female>{queensBundleCount > 0 ? queensBundleCount * QUEENS_BUNDLE_CHATS : 0}</BundleCountValue>
                <BundleCountLabel $female>
                  {womenPricingContent.queensBundle.bundleCountLabel}
                </BundleCountLabel>
              </BundleCountWrap>

              <CardDescription $female>
                {womenPricingContent.queensBundle.bullets.map((bullet) => (
                  <p key={bullet}>- {bullet}</p>
                ))}
              </CardDescription>
            </PricingCard>
          </>
        ) : (
          <>
            {/* Men's Pricing: Interested */}
            <PricingCard active={interestedCount > 0}>
              <CardHeader>
                <TitleSection>
                  <Image src={interestedIcon} alt="Interested" width={170} height={72} />
                </TitleSection>
                <ArrowIcon $male>
                  <Image src={arrow1} alt="arrow" width={104} height={158} />
                </ArrowIcon>
              </CardHeader>
              <CardTitleText>{menPricingContent.interested.title}</CardTitleText>
              <CardSubtitle>{menPricingContent.interested.subtitle}</CardSubtitle>
              <CardPrice>
                ${INTERESTED_PRICE.toFixed(2)}
                {menPricingContent.interested.priceSuffix}
              </CardPrice>

              <CounterSection>
                <CounterButton onClick={() => handleDecrement('interested')}>−</CounterButton>
                <CounterValue>{interestedCount}</CounterValue>
                <CounterButton onClick={() => handleIncrement('interested')}>+</CounterButton>
              </CounterSection>

              <CardDescription>
                {menPricingContent.interested.bullets.map((bullet) => (
                  <p key={bullet} className="mens-bullet-119">
                    - {bullet}
                  </p>
                ))}
              </CardDescription>
            </PricingCard>

            {/* Men's Pricing: Super Interested */}
            <PricingCard highlighted active={superInterestedCount > 0}>
              <CardHeader>
                <TitleSection>
                  <Image src={superInterestedIcon} alt="Super Interested" width={170} height={72} />
                </TitleSection>
                <ArrowIcon $male $super>
                  <SuperArrowStack>
                    <SuperArrowLarge>
                      <Image src={arrow1} alt="arrow" width={120} height={178} />
                    </SuperArrowLarge>
                    <SuperArrowSmall>
                      <Image src={arrow1} alt="arrow" width={96} height={144} />
                    </SuperArrowSmall>
                  </SuperArrowStack>
                </ArrowIcon>
              </CardHeader>
              <CardTitleText>{menPricingContent.superInterested.title}</CardTitleText>
              <CardSubtitle>
                <span>⚡</span>
                {menPricingContent.superInterested.subtitle}
              </CardSubtitle>
              <CardPrice>
                ${SUPER_INTERESTED_PRICE.toFixed(2)}
                {menPricingContent.superInterested.priceSuffix}
              </CardPrice>

              <CounterSection>
                <CounterButton onClick={() => handleDecrement('superInterested')}>−</CounterButton>
                <CounterValue>{superInterestedCount}</CounterValue>
                <CounterButton onClick={() => handleIncrement('superInterested')}>+</CounterButton>
              </CounterSection>

              <CardDescription>
                {menPricingContent.superInterested.bullets.map((bullet, index) => (
                  <p
                    key={bullet}
                    className={index === 0 ? "super-line-1" : undefined}
                  >
                    - {bullet}
                  </p>
                ))}
              </CardDescription>
            </PricingCard>
          </>
        )}

        {/* Footer */}
        <MinPurchase $female={isFemale}>
          {activeDiscount
            ? formatPricingTemplate(
                isFemale
                  ? womenPricingContent.footerDiscountTemplate
                  : menPricingContent.footerDiscountTemplate,
                {
                  label: activeDiscount.label,
                  amount: formatPricingNumber(minPurchase),
                }
              )
            : formatPricingTemplate(
                isFemale
                  ? womenPricingContent.footerNoDiscountTemplate
                  : menPricingContent.footerNoDiscountTemplate,
                {
                  amount: formatPricingNumber(minPurchase),
                }
              )}
        </MinPurchase>
        {activeDiscount && subtotal !== total && (
          <DiscountSummary>
            <span>
              {formatPricingTemplate(
                isFemale
                  ? womenPricingContent.discountSubtotalTemplate
                  : menPricingContent.discountSubtotalTemplate,
                {
                  amount: subtotal.toFixed(2),
                }
              )}
            </span>
            <strong>
              {formatPricingTemplate(
                isFemale
                  ? womenPricingContent.discountTotalTemplate
                  : menPricingContent.discountTotalTemplate,
                {
                  amount: total.toFixed(2),
                }
              )}
            </strong>
          </DiscountSummary>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <CheckoutButton
          $female={isFemale}
          disabled={!canCheckout || isProcessing}
          canCheckout={canCheckout}
          onClick={handleCheckout}
        >
          {isProcessing ? (
            <CheckoutSpinner />
          ) : `($${total.toFixed(2)}) ${
              isFemale
                ? womenPricingContent.checkoutLabel
                : menPricingContent.checkoutLabel
            }`}
        </CheckoutButton>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default PricingMenuModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 14, 0.58);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  /* Use grid so the content is vertically centered when it fits, and the
     overlay becomes scrollable when it does not. The "safe center" keyword
     prevents the content from being clipped above the top of the overlay
     when its height exceeds the viewport, so the checkout button stays
     reachable on short viewports such as laptops in fullscreen Chrome. */
  display: grid;
  place-items: safe center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  @media (max-width: 768px) {
    background-color: #000000;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  background: #000000;
  border-radius: 20px;
  width: 100%;
  max-width: ${(props) => (props.$female ? "320px" : "380px")};
  padding: ${(props) => (props.$female ? "36px 12px 0" : "24px 16px 24px")};
  position: relative;
  overflow: visible;
  margin: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* Scale-to-fit: on short desktop viewports (e.g. a laptop at 100% zoom) the
     modal is taller than the screen, which used to cut off the bottom card and
     the checkout CTA. Rather than scroll or shrink individual elements (which
     compromises the design), we uniformly scale the whole modal down to fit —
     exactly what a user gets by zooming the browser to ~85%, just automatic.
     $fitScale is computed in JS from the natural height vs the viewport.
     transform-origin keeps it pinned to the top; the negative margin-bottom
     collapses the empty layout space the transform leaves behind so the overlay
     still centres the modal and never scrolls into emptiness. */
  transform: scale(${(props) => props.$fitScale ?? 1});
  transform-origin: top center;
  margin-bottom: ${(props) => props.$marginComp || 0}px;

  @media (max-width: 768px) {
    max-width: ${(props) => (props.$female ? "318px" : "380px")};
    padding: ${(props) => (props.$female ? "36px 12px 0" : "24px 14px 24px")};
    /* Mobile is a full-screen black overlay and already fit; keep its existing
       fixed scale and natural centring (overrides the desktop scale-to-fit). */
    transform: scale(0.9);
    transform-origin: center center;
    margin-bottom: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  transition: transform 0.2s;
  opacity: 0.8;
  touch-action: manipulation;

  &:hover {
    transform: rotate(90deg);
    opacity: 1;
  }
`;

const PricingCard = styled.div`
  background: ${(props) =>
    props.$female && (props.$selected || props.$flash)
      ? "linear-gradient(180deg, rgba(255, 51, 102, 0.08) 0%, rgba(0, 0, 0, 0.95) 36%, #000000 100%)"
      : "#000000"};
  border: ${(props) =>
      props.$female && (props.$selected || props.$flash) ? "2px" : "1px"} solid
    ${(props) =>
      props.$female
        ? props.$selected || props.$flash
          ? "rgba(255, 51, 102, 0.78)"
          : "rgba(255, 255, 255, 0.2)"
        : props.active
        ? "#F24462"
        : "rgba(255, 255, 255, 0.2)"};
  border-radius: 24px;
  padding: ${(props) => (props.$female ? "28px 16px 18px" : "18px 16px 18px")};
  margin-bottom: 10px;
  margin-top: ${(props) => (props.$female && props.$first ? "12px" : "0")};
  min-height: ${(props) => (props.$female ? "292px" : "300px")};
  position: relative;
  box-shadow: ${(props) =>
    props.$female
      ? props.$selected || props.$flash
        ? "0 0 0 1.5px rgba(255, 51, 102, 0.68), 0 0 18px rgba(255, 51, 102, 0.52), inset 0 0 10px rgba(255, 51, 102, 0.16), 0 6px 14px rgba(0,0,0,0.26)"
        : "0 4px 12px rgba(0,0,0,0.22)"
      : props.active
      ? "0 0 16px rgba(242, 68, 98, 0.12), 0 4px 12px rgba(0,0,0,0.25)"
      : "0 4px 12px rgba(0,0,0,0.25)"};
  transition: all 0.3s ease;
  overflow: hidden;
  touch-action: ${(props) => (props.$female ? "manipulation" : "auto")};
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: ${(props) =>
      props.$female
        ? props.$selected || props.$flash
          ? "#F24462"
          : "rgba(255, 255, 255, 0.35)"
        : props.active
        ? "#F24462"
        : "rgba(255, 255, 255, 0.35)"};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => (props.$female ? "10px" : "4px")};
  position: relative;
`;

const TitleSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  margin-top: 0;
  min-width: 0;
  max-width: ${(props) => (props.$female ? "calc(100% - 50px)" : "calc(100% - 82px)")};
  position: relative;
  z-index: 4;
`;

const ArrowIcon = styled.div`
  flex-shrink: 0;
  position: absolute;
  right: ${(props) =>
    props.$male
      ? (props.$super ? "12px" : "2px")
      : props.$bundle
      ? "-18px"
      : props.$female
      ? "-12px"
      : "-2px"};
  top: ${(props) => (props.$male ? (props.$super ? "-10px" : "-4px") : "-18px")};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  opacity: ${(props) => (props.$male ? 1 : 1)};
  z-index: ${(props) => (props.$male ? (props.$super ? 4 : 2) : 1)};
`;

const SuperArrowStack = styled.div`
  position: relative;
  width: 120px;
  height: 178px;
`;

const SuperArrowLarge = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  opacity: 1;
  z-index: 1;
`;

const SuperArrowSmall = styled.div`
  position: absolute;
  right: 34px;
  top: 26px;
  opacity: 0.74;
  z-index: 2;
`;

const WomenCardTitle = styled.div`
  font-family: "Arial Black", "Avenir Next Heavy", "Helvetica Neue", "Conv_Helvetica", Arial, sans-serif;
  font-size: 31px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.02;
  letter-spacing: -0.6px;
  text-rendering: optimizeLegibility;
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: normal;
  overflow: visible;
  text-overflow: initial;

  .women-title-img {
    display: block;
    width: 188px;
    height: auto;
    max-width: 100%;
    margin: 0;
  }

  .women-title-alacarte {
    width: 182px;
  }

  .women-title-queens {
    width: 224px;
    max-width: none;
  }

  @media (max-width: 768px) {
    font-size: 29px;

    .women-title-img {
      width: 176px;
    }

    .women-title-alacarte {
      width: 170px;
    }

    .women-title-queens {
      width: 206px;
      max-width: none;
    }
  }
`;

const CardTitleText = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: ${(props) => (props.$female ? "11px" : "12px")};
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.16em;
  margin-bottom: 6px;
  margin-top: ${(props) => (props.$female ? "-2px" : "2px")};
  text-transform: uppercase;
`;

const CardSubtitle = styled.div`
  font-family: ${(props) =>
    props.$female
      ? '"Conv_Helvetica", "Helvetica", Arial, sans-serif'
      : '"Conv_Helvetica", "Helvetica", Arial, sans-serif'};
  font-size: ${(props) => (props.$female ? "16px" : "19px")};
  font-weight: ${(props) => (props.$female ? "700" : "500")};
  color: rgba(255, 255, 255, 0.86);
  margin-bottom: ${(props) => (props.$female ? "12px" : "6px")};
  margin-top: 0px;
  letter-spacing: ${(props) => (props.$female ? "0.1px" : "0.15px")};
  line-height: ${(props) => (props.$female ? "1.4" : "1.2")};
  white-space: nowrap;
  max-width: ${(props) => (props.$female ? "100%" : "100%")};
  position: relative;
  z-index: 5;
  display: ${(props) => (props.$female ? "block" : "inline-flex")};
  align-items: ${(props) => (props.$female ? "initial" : "center")};
  gap: ${(props) => (props.$female ? "0" : "4px")};

  @media (max-width: 768px) {
    font-size: ${(props) => (props.$female ? "15px" : "19px")};
  }
`;

const CardPrice = styled.div`
  font-family: ${(props) =>
    props.$female
      ? '"Conv_Helvetica", "Helvetica", Arial, sans-serif'
      : '"Conv_Helvetica", "Helvetica", Arial, sans-serif'};
  font-size: ${(props) => (props.$female ? "16px" : "16px")};
  font-weight: ${(props) => (props.$female ? "700" : "400")};
  color: #ffffff;
  margin-bottom: ${(props) => (props.$female ? "16px" : "12px")};
  line-height: 1.25;
  white-space: ${(props) => (props.$female ? "nowrap" : "normal")};
  max-width: ${(props) => (props.$female ? "100%" : "calc(100% - 110px)")};

  @media (max-width: 768px) {
    font-size: ${(props) => (props.$female ? "15px" : "16px")};
  }
`;

const CounterSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 52px;
  margin-bottom: 14px;
  padding: 10px 0 8px;
`;

const CounterButton = styled.button`
  background: transparent;
  border: none;
  color: #F24462;
  font-size: 31px;
  font-weight: 300;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  line-height: 1;
  touch-action: manipulation;

  &:hover {
    transform: scale(1.3);
    opacity: 0.8;
  }

  &:active {
    transform: scale(1.0);
  }
`;

const CounterValue = styled.div`
  font-family: ${(props) =>
    props.$female
      ? '"Conv_Helvetica", "Helvetica", Arial, sans-serif'
      : '"Conv_Helvetica", "Helvetica", Arial, sans-serif'};
  font-size: ${(props) => (props.$female ? "54px" : "50px")};
  font-weight: ${(props) => (props.$female ? "800" : "300")};
  color: #ffffff;
  min-width: 46px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  line-height: 1;
  padding-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BundleCountWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 22px 0 12px;
`;

const BundleCountValue = styled.div`
  font-family: ${(props) =>
    props.$female
      ? '"Conv_Helvetica", "Helvetica", Arial, sans-serif'
      : '"Conv_Helvetica", "Helvetica", Arial, sans-serif'};
  font-size: ${(props) => (props.$female ? "52px" : "42px")};
  font-weight: ${(props) => (props.$female ? "800" : "700")};
  color: #ffffff;
  line-height: 0.98;
  margin-bottom: 6px;
`;

const BundleCountLabel = styled.div`
  font-family: ${(props) =>
    props.$female
      ? '"Conv_Helvetica", "Helvetica", Arial, sans-serif'
      : '"Conv_Helvetica", "Helvetica", Arial, sans-serif'};
  font-size: ${(props) => (props.$female ? "15px" : "24px")};
  font-weight: ${(props) => (props.$female ? "700" : "400")};
  color: #ffffff;
  line-height: 1;
`;

const CardDescription = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: ${(props) => (props.$female ? "10px" : "11.9px")};
  font-weight: ${(props) => (props.$female ? "500" : "300")};
  color: rgba(175, 171, 171, 0.9);
  line-height: ${(props) => (props.$female ? "1.4" : "1.18")};
  letter-spacing: ${(props) => (props.$female ? "0.12px" : "0.2px")};
  max-width: ${(props) => (props.$female ? "100%" : "calc(100% - 12px)")};

  p {
    margin: ${(props) => (props.$female ? "8px 0" : "6px 0")};
    white-space: normal;
  }

  .super-line-1 {
    font-size: 11.9px;
    line-height: 1.18;
    letter-spacing: 0.1px;
    white-space: normal;
    max-width: 100%;
  }

  .mens-bullet-119 {
    font-size: 11.9px;
    line-height: 1.18;
  }

  ${(props) =>
    props.$female &&
    `
    margin-top: 12px;

    p {
      margin: 4px 0;
    }

    p:last-child {
      color: rgba(175, 171, 171, 0.9);
      font-style: normal;
      font-weight: 500;
      margin-top: 6px;
    }
  `}

  strong {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
  }
`;

const MinPurchase = styled.div`
  text-align: center;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: ${(props) => (props.$female ? "11px" : "10px")};
  color: ${(props) => (props.$female ? "#ffffff" : "rgba(255, 255, 255, 0.88)")};
  margin: 12px 0 10px;
  letter-spacing: 0.3px;
`;

const DiscountSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: -2px 0 12px;
  color: rgba(255, 255, 255, 0.72);
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 11px;
  letter-spacing: 0.18px;

  strong {
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const CheckoutButton = styled.button`
  width: ${(props) => (props.$female ? "calc(100% + 24px)" : "100%")};
  background: ${props => props.canCheckout
    ? 'linear-gradient(90deg, #ff3366 0%, #ff4f86 55%, #ff6b97 100%)'
    : '#3a3a3a'};
  color: ${props => props.canCheckout ? '#ffffff' : '#7a7a7a'};
  border: none;
  border-radius: ${(props) => (props.$female ? "0 0 18px 18px" : "18px")};
  margin-left: ${(props) => (props.$female ? "-12px" : "0")};
  padding: 0 20px;
  height: ${(props) => (props.$female ? "42px" : "42px")};
  line-height: ${(props) => (props.$female ? "42px" : "42px")};
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: ${(props) => (props.$female ? "15px" : "14px")};
  font-weight: 700;
  cursor: ${props => props.canCheckout ? 'pointer' : 'not-allowed'};
  transition: all 0.3s;
  letter-spacing: 0.2px;
  box-shadow: ${props => props.canCheckout ? '0 0 0 1px rgba(255, 89, 138, 0.45), 0 8px 20px rgba(255, 51, 102, 0.35)' : 'none'};
  touch-action: manipulation;

  &:hover {
    ${props => props.canCheckout && `
      background: linear-gradient(90deg, #E2466B 0%, #F24462 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(242, 68, 98, 0.4);
    `}
  }

  &:active {
    transform: translateY(0);
  }
`;

const CheckoutSpinner = styled.div`
  width: 20px;
  height: 20px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: checkoutSpin 0.8s linear infinite;

  @keyframes checkoutSpin {
    to {
      transform: rotate(360deg);
    }
  }
`;
