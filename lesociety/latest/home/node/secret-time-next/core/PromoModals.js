import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
const close1 = "/assets/close1.png";
import CreateDatePrimaryButton from "../components/common/CreateDatePrimaryButton";
import { startOrResumeCreateDate } from "utils/createDateFlow";

const PromoModals = ({ isOpen, onClose, type = "success" }) => {
  const router = useRouter();

  if (!isOpen) return null;

  // 50% Off Popup
  if (type === "promo_50_off") {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <img src={close1} alt="close" width={24} height={24} style={{ filter: "invert(1)" }} />
          </CloseButton>

          <ModalBody>
            <Title>She's offering a first date! Don't miss it.</Title>
            <BodyText>
              She's real, verified, and driven. Her goals{" "}
              <Underlined>deserve men who value them</Underlined>.
            </BodyText>

            <OfferSection>
              <OfferTitle>50% Off All Plans.</OfferTitle>
              <OfferSubtitle>Limited-Time Only</OfferSubtitle>

              <TimerSection>
                <TimerText>Exclusive offer ends in</TimerText>
                <TimerValue>48 hours</TimerValue>
              </TimerSection>

              <ProgressBar>
                <ProgressFill />
              </ProgressBar>
            </OfferSection>

            <CTASection>
              <CreateDateButton onClick={() => startOrResumeCreateDate(router)}>
                CREATE NEW DATE
              </CreateDateButton>
              <DisclaimerText>
                This plan is only available for a limited time. No hidden fees or strings attached, you can cancel anytime.
              </DisclaimerText>
            </CTASection>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  // Not Live Yet Popup
  if (type === "not_live") {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <img src={close1} alt="close" width={24} height={24} style={{ filter: "invert(1)" }} />
          </CloseButton>

          <ModalBody>
            <Title>You Are Not Live Yet.</Title>
            <BodyText>
              You're seeing other women's dates for style, pricing, and inspiration.{" "}
              Our community attracts high-status men who value privacy; they appear after they message you.
            </BodyText>

            <OfferSection>
              <OfferText>Post your date so men can discover you first.</OfferText>
            </OfferSection>

            <CTASection>
              <CreateDateButton onClick={() => startOrResumeCreateDate(router)}>
                CREATE NEW DATE
              </CreateDateButton>
            </CTASection>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  // Success You're Live Popup
  if (type === "success") {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <img src={close1} alt="close" width={24} height={24} style={{ filter: "invert(1)" }} />
          </CloseButton>

          <ModalBody>
            <Title>Success. You're live!</Title>
            <BodyText>
              Gentleman's profiles remain private until they message you.{" "}
              Our community attracts high-status men who value privacy.
            </BodyText>

            <OfferSection>
              <OfferText>While you wait, explore other women's dates for style, pricing, and inspiration.</OfferText>
            </OfferSection>

            <CTASection>
              <ActionButton onClick={onClose}>
                Ok, got it
              </ActionButton>
            </CTASection>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  // First 3 Free Popup
  if (type === "first_3_free") {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <img src={close1} alt="close" width={24} height={24} style={{ filter: "invert(1)" }} />
          </CloseButton>

          <ModalBody>
            <Title>Your first 3 accepted interests are Free!</Title>
            <BodyText>
              Open a private interest and start a chat. Your first 3 are on us.
            </BodyText>

            <OfferSection>
              <CounterText>3 of 3 conversations left</CounterText>
            </OfferSection>

            <CTASection>
              <CreateDateButton onClick={() => startOrResumeCreateDate(router)}>
                CREATE NEW DATE
              </CreateDateButton>
            </CTASection>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return null;
};

export default PromoModals;

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
    rgba(5, 7, 12, 0.38);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
  padding: 20px;
  animation: overlayIn 220ms cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes overlayIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
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
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  width: min(92vw, 420px);
  max-width: 420px;
  padding: 28px 16px 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  overflow: hidden;
  animation: liquidIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;

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

  &::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: calc(24px - 3px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    padding: 1px;
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
      transform: translateY(12px) scale(0.96);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: min(92vw, 420px);
    max-width: 420px;
    padding: 24px 12px 16px;
    gap: 32px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 19px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  width: 24px;
  height: 24px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ModalBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const Title = styled.h2`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-weight: bold;
  font-size: 28px;
  color: white;
  text-align: center;
  margin: 0;
  line-height: 1.2;
  font-feature-settings: 'ordn' 1, 'dlig' 1;
`;

const BodyText = styled.p`
  font-family: 'Helvetica Light', 'Helvetica', 'Arial', sans-serif;
  font-size: 14px;
  color: white;
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const Underlined = styled.span`
  text-decoration: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
`;

const OfferSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const OfferTitle = styled.h3`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-weight: bold;
  font-size: 24px;
  color: white;
  text-align: center;
  margin: 0;
  line-height: 1.2;
  font-feature-settings: 'ordn' 1, 'dlig' 1;

  p {
    margin: 0;
  }
`;

const OfferSubtitle = styled.p`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-weight: normal;
  font-size: 24px;
  color: white;
  text-align: center;
  margin: 0;
`;

const TimerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 358px;
`;

const TimerText = styled.p`
  font-family: 'Helvetica Light', 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  color: #a8a8a8;
  text-align: right;
  margin: 0;
  width: 100%;
`;

const TimerValue = styled.p`
  font-family: 'Helvetica Light', 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  color: white;
  text-align: center;
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 75%;
  background: linear-gradient(90deg, #f24462 0%, #4a90e2 100%);
  border-radius: 4px;
  animation: progressPulse 2s ease-in-out infinite;

  @keyframes progressPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const OfferText = styled.p`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  color: #d1d5db;
  text-align: center;
  margin: 0;
  line-height: 1.2;
  font-feature-settings: 'ordn' 1, 'dlig' 1;
`;

const CounterText = styled.p`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-size: 24px;
  color: #d1d5db;
  text-align: center;
  margin: 0;
  line-height: 1.2;
  font-feature-settings: 'ordn' 1, 'dlig' 1;
`;

const CTASection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const CreateDateButton = styled(CreateDatePrimaryButton)`
  width: 300px;

  &:active {
    transform: scale(0.98);
  }
`;

const ActionButton = styled.button`
  background-color: #f24462;
  border: none;
  border-radius: 8px;
  height: 48px;
  width: 300px;
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-align: center;
  cursor: pointer;
  letter-spacing: -0.07px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e03e58;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DisclaimerText = styled.p`
  font-family: 'Helvetica Light', 'Helvetica', 'Arial', sans-serif;
  font-size: 12px;
  color: white;
  text-align: center;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.06px;
  max-width: 320px;
  text-wrap: balance;
`;
