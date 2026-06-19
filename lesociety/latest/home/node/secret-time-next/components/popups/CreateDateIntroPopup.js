import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";

/**
 * Create Date Intro Popup
 * Shown when user clicks "Create New Date"
 * "Want offers to flood in fast?"
 */
const CreateDateIntroPopup = ({ 
  isOpen, 
  onClose,
  onDoNotShowAgain
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const openedAtRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
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

  const handleOverlayClick = (e) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - openedAtRef.current < 250) return;
    handleGotIt();
  };

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <ModalOverlay visible={visible} onClick={handleOverlayClick}>
      <ModalContent visible={visible} onClick={(e) => e.stopPropagation()}>
        <Content>
          <Title>Want offers to flood in fast?</Title>
          <Message>
            Ladies who post a few tempting date options go on far more dates and give themselves way more chances to meet someone amazing.
          </Message>
          <SubMessage>
            Create up to 4 dates and never get lost in the crowd. Each with its own mood, duration and price.
          </SubMessage>
          
          <Actions>
            <DoNotShowAgain>
              <Checkbox 
                type="checkbox" 
                checked={doNotShowAgain}
                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                id="intro-do-not-show"
              />
              <CheckboxLabel htmlFor="intro-do-not-show">
                Don't show me this again
              </CheckboxLabel>
            </DoNotShowAgain>
            
            <GotItButton onClick={handleGotIt}>
              OK, GOT IT!
            </GotItButton>
          </Actions>
        </Content>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default CreateDateIntroPopup;

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
  align-items: stretch;
  z-index: 10000;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  padding: 0;
`;

const ModalContent = styled.div`
  background: #000000;
  border-radius: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow-y: auto;
  position: relative;
  transform: translateY(${props => props.visible ? '0' : '20px'});
  opacity: ${props => props.visible ? 1 : 0};
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  box-shadow: none;
`;

const Content = styled.div`
  padding: 48px 28px calc(24px + env(safe-area-inset-bottom, 0px));
  text-align: center;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;

  @media (min-width: 768px) {
    padding: 64px 40px 40px;
  }
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 26px;
  line-height: 1.12;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 18px;
  }
`;

const Message = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.5;
  margin: 0 0 34px;

  @media (min-width: 768px) {
    font-size: 14px;
    margin-bottom: 28px;
  }
`;

const SubMessage = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.5;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const Actions = styled.div`
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 20px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 28%);
`;

const DoNotShowAgain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #F24462;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  user-select: none;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const GotItButton = styled.button`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #ff3b81 !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  outline: none !important;
  cursor: pointer !important;
  padding: 0 !important;
  margin: 0 !important;
  transition: all 0.2s ease;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  text-decoration: none !important;
  flex-shrink: 0;
  box-shadow: none !important;
  border-radius: 0 !important;
  min-width: auto !important;
  width: auto !important;
  
  &:hover {
    opacity: 0.7 !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
  }
  
  &:focus {
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    border: none !important;
  }
  
  &:active {
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    border: none !important;
  }
`;
