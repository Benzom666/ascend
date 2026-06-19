import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";

/**
 * Description Warning Popup
 * Shown when user focuses on the description textarea
 * "Don't write bad things" warning text
 */
const DescriptionWarningPopup = ({ 
  isOpen, 
  onClose,
  onDoNotShowAgain
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 50);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleGotIt = () => {
    if (doNotShowAgain && onDoNotShowAgain) {
      onDoNotShowAgain();
    }
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <ModalOverlay visible={visible} onClick={handleGotIt}>
      <ModalContent visible={visible} onClick={(e) => e.stopPropagation()}>
        <Content>
          <WarningIcon>⚠️</WarningIcon>
          <Title>Keep it classy</Title>
          <Message>
            Please don't write anything inappropriate, explicit, or against our community guidelines.
          </Message>
          <WarningText>
            Don't write bad things. Keep your description tasteful and focused on the date experience.
          </WarningText>
          <SubMessage>
            Descriptions are reviewed and violating content may result in account suspension.
          </SubMessage>
          
          <DoNotShowAgain>
            <Checkbox 
              type="checkbox" 
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              id="desc-warning-do-not-show"
            />
            <CheckboxLabel htmlFor="desc-warning-do-not-show">
              Don't show me this again
            </CheckboxLabel>
          </DoNotShowAgain>
          
          <GotItButton onClick={handleGotIt}>
            OK, GOT IT!
          </GotItButton>
        </Content>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default DescriptionWarningPopup;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const ModalContent = styled.div`
  background: #000000;
  border-radius: 24px;
  width: 90%;
  max-width: 420px;
  position: relative;
  transform: translateY(${props => props.visible ? '0' : '20px'});
  opacity: ${props => props.visible ? 1 : 0};
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  border: 1px solid #333333;
`;

const Content = styled.div`
  padding: 40px 32px;
  text-align: center;
`;

const WarningIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 20px;
  line-height: 1.3;
`;

const Message = styled.p`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 16px;
`;

const WarningText = styled.p`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #F24462;
  line-height: 1.5;
  margin: 0 0 16px;
  padding: 12px 16px;
  background: rgba(242, 68, 98, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(242, 68, 98, 0.3);
`;

const SubMessage = styled.p`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #666666;
  line-height: 1.5;
  margin: 0 0 32px;
`;

const DoNotShowAgain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #F24462;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  color: #666666;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    color: #888888;
  }
`;

const GotItButton = styled.button`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #F24462;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 12px 24px;
  transition: all 0.2s ease;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 4px;
  
  &:hover {
    opacity: 0.8;
  }
`;
