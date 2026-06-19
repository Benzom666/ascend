import React, { useEffect, useState } from "react";
import styled from "styled-components";

const DateLiveModal = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return undefined;

    const { body, documentElement } = document;
    // Snap the background list to the very top so the popup sits over the
    // start of the list, then lock it there. We intentionally pin at top
    // (0) instead of the current scroll position so the woman lands at the
    // top of the gallery when she dismisses the popup.
    window.scrollTo(0, 0);
    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: documentElement.style.overflow,
      htmlTouchAction: documentElement.style.touchAction,
      htmlOverscrollBehavior: documentElement.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = "0px";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.touchAction = "none";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      body.style.touchAction = previous.bodyTouchAction;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
      documentElement.style.overflow = previous.htmlOverflow;
      documentElement.style.touchAction = previous.htmlTouchAction;
      documentElement.style.overscrollBehavior = previous.htmlOverscrollBehavior;
      // Keep the list at the top after the popup closes.
      window.scrollTo(0, 0);
    };
  }, [isOpen]);

  const closeWithAnimation = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 260);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={closeWithAnimation} visible={visible}>
      <Card onClick={(e) => e.stopPropagation()} visible={visible}>
        <Glow glow="top" />
        <Glow glow="bottom" />

        <HeaderBadge>
          <BadgeIcon aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 9.5L7.25 12.75L14 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </BadgeIcon>
          <BadgeText>DATE POSTED</BadgeText>
        </HeaderBadge>

        <HeroTitle>Your Date Is Now Live</HeroTitle>
        <HeroCopy>Sit back and let the right matches come to you.</HeroCopy>

        <LockPanel>
          <LockHeading>
            <LockGlyph aria-hidden="true">🔒</LockGlyph>
            <span>Men&apos;s Profiles Are Locked</span>
          </LockHeading>

          <Bullets>
            <li>
              Our community attracts accomplished men who value privacy. Their
              profiles stay hidden until they message you.
            </li>
            <li>
              If a man is interested, he&apos;ll message you directly. You&apos;ll
              see it as a New Interest in your inbox.
            </li>
          </Bullets>
        </LockPanel>

        <LiveSection>
          <LiveLabel>While your date is live</LiveLabel>
          <LiveText>
            Explore other women&apos;s dates for ideas on style and pricing.
          </LiveText>
        </LiveSection>

        <ContinueButton onClick={closeWithAnimation}>Continue</ContinueButton>
      </Card>
    </Overlay>
  );
};

export default DateLiveModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.06), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(126, 142, 168, 0.10), transparent 40%),
    rgba(5, 7, 12, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
  padding: 16px;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const Card = styled.div`
  width: min(100%, 380px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 18%, rgba(255, 255, 255, 0.04) 100%),
    rgba(14, 15, 19, 0.34);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 30px;
  padding: 22px 18px 18px;
  text-align: left;
  transform: ${(props) =>
    props.visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.965)"};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  will-change: transform, opacity;

  & > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.40) 0%, transparent 38%),
      radial-gradient(circle at 10% 18%, rgba(255, 255, 255, 0.10) 0%, transparent 28%),
      radial-gradient(circle at 90% 14%, rgba(103, 122, 156, 0.12) 0%, transparent 24%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.10), transparent 34%, transparent 66%, rgba(255, 255, 255, 0.08));
    pointer-events: none;
    z-index: 0;
  }

  @media (min-width: 768px) {
    max-width: 392px;
    padding: 26px 20px 20px;
  }
`;

const Glow = styled.div`
  position: absolute;
  left: 14px;
  right: 14px;
  height: 76px;
  top: ${(props) => (props.glow === "top" ? "8px" : "auto")};
  bottom: ${(props) => (props.glow === "bottom" ? "10px" : "auto")};
  border-radius: 999px;
  background: ${(props) =>
    props.glow === "top"
      ? "radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 68%)"
      : "radial-gradient(circle, rgba(255, 255, 255, 0.10), transparent 70%)"};
  filter: blur(4px);
  opacity: 0.66;
  pointer-events: none;
  z-index: 0;
`;

const HeaderBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  margin-bottom: 12px;
  color: #ff4d86;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  font-size: 12px;
  font-weight: 800;
`;

const BadgeIcon = styled.span`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ff4d86;
  flex: 0 0 auto;
`;

const BadgeText = styled.span`
  color: #ff4d86;
`;

const HeroTitle = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 29px;
  font-weight: 700;
  line-height: 1.05;
  color: rgba(255, 255, 255, 0.98);
  margin: 0 0 9px;
  letter-spacing: -0.03em;

  @media (min-width: 768px) {
    font-size: 31px;
  }
`;

const HeroCopy = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.45;
  color: rgba(243, 245, 248, 0.76);
  margin: 0 0 16px;
`;

const LockPanel = styled.div`
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.04) 100%),
    rgba(18, 20, 26, 0.22);
  padding: 14px 14px 12px;
  margin: 0 0 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
`;

const LockHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f6df95;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 10px;
`;

const LockGlyph = styled.span`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Bullets = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: rgba(244, 246, 250, 0.73);
  font-size: 12px;
  line-height: 1.55;

  li + li {
    margin-top: 10px;
  }
`;

const LiveSection = styled.div`
  margin: 0 0 18px;
`;

const LiveLabel = styled.p`
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.97);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
`;

const LiveText = styled.p`
  margin: 0;
  color: rgba(241, 243, 246, 0.76);
  font-size: 13px;
  line-height: 1.55;
`;

const ContinueButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 999px;
  min-height: 46px;
  padding: 12px 18px;
  background: linear-gradient(90deg, #ff4b87 0%, #f22f6d 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow:
    0 14px 24px rgba(242, 47, 109, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);

  &:active {
    transform: translateY(1px);
  }
`;
