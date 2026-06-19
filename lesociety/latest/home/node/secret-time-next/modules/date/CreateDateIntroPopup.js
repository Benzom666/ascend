import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

// Slide up animation for opening
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

// Slide down animation for closing
const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// Fade in for overlay
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Fade out for overlay
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Blur in animation for overlay
const blurIn = keyframes`
  from {
    backdrop-filter: blur(0px);
  }
  to {
    backdrop-filter: blur(5px);
  }
`;

// Blur out animation for overlay
const blurOut = keyframes`
  from {
    backdrop-filter: blur(5px);
  }
  to {
    backdrop-filter: blur(0px);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease-out forwards,
             ${props => props.$isClosing ? blurOut : blurIn} 0.3s ease-out forwards;
  
  @media (min-width: 768px) {
    align-items: center;
  }
`;

const Card = styled.div`
  background: linear-gradient(231.4deg, rgba(46, 49, 58, 0.95) 18.16%, rgba(25, 25, 25, 0.98) 95.56%);
  border-radius: 30px 30px 0 0;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  animation: ${props => props.$isClosing ? slideDown : slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  @media (min-width: 768px) {
    border-radius: 30px;
    max-width: 420px;
  }
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  line-height: 1.3;
`;

const BodyText = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #cccccc;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const Subtext = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #999999;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  color: #aaaaaa;
  user-select: none;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #FF6B6B;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: #FF6B6B;
  border: none;
  border-radius: 12px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Create Date Intro Popup Component
// Shown when user starts creating a date to encourage multiple date postings
const CreateDateIntroPopup = ({ isOpen, onClose, onDoNotShowAgain }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [doNotShow, setDoNotShow] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleButtonClick = () => {
    if (doNotShow && onDoNotShowAgain) {
      onDoNotShowAgain();
    }
    handleClose();
  };

  return (
    <Overlay $isClosing={isClosing} onClick={handleClose}>
      <Card $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <Title>Want offers to flood in fast?</Title>
        <BodyText>
          Ladies who post a few tempting date options get 3x more Super Interested offers.
        </BodyText>
        <Subtext>
          Create up to 4 dates and never get lost in the crowd.
        </Subtext>
        <CheckboxContainer>
          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={doNotShow}
              onChange={(e) => setDoNotShow(e.target.checked)}
            />
            Don't show me this again
          </CheckboxLabel>
        </CheckboxContainer>
        <Button onClick={handleButtonClick}>
          OK, GOT IT!
        </Button>
      </Card>
    </Overlay>
  );
};

export default CreateDateIntroPopup;
