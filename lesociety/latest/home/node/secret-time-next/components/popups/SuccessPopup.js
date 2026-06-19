import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";

/**
 * Success Popup Modal
 * Shown when a user's date goes live
 * "Success. You're Live!"
 */
const SuccessPopup = ({ 
  isOpen, 
  onClose,
  onDoNotShowAgain,
  title = "Success. You're Live!",
  message = "Our gentleman's profiles remain private until they message you. Our community attracts high-status men who value privacy.",
  linkText = "While you wait, explore other women's dates for style, pricing, and inspiration.",
  userName = "Luna",
  userAge = 24,
  userLocation = "Toronto, ON",
  userCategory = "Entertainment & Sports",
  userAspiration = "Environmental Designer",
  userImage = null
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const router = useRouter();

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

  const handleExploreClick = () => {
    handleGotIt();
    router.push('/user/user-list');
  };

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <ModalOverlay visible={visible} onClick={handleGotIt}>
      <ModalContent visible={visible} onClick={(e) => e.stopPropagation()}>
        {/* User Profile Card Preview */}
        <ProfileCard>
          <ProfileImage>
            {userImage ? (
              <img src={userImage} alt={userName} />
            ) : (
              <ProfilePlaceholder />
            )}
            <ProfileOverlay />
            <ProfileInfo>
              <ProfileName>{userName}, <Age>{userAge}</Age></ProfileName>
              <ProfileLocation>
                <LocationIcon>📍</LocationIcon>
                {userLocation}
              </ProfileLocation>
              <ProfileTags>
                <Tag>{userCategory}</Tag>
                <AspirationTag>
                  <TagLabel>{userAspiration}</TagLabel>
                  <TagSublabel>ASPIRING</TagSublabel>
                </AspirationTag>
              </ProfileTags>
            </ProfileInfo>
          </ProfileImage>
        </ProfileCard>

        {/* Success Message */}
        <SuccessContent>
          <SuccessTitle>{title}</SuccessTitle>
          <SuccessMessage>{message}</SuccessMessage>
          <ExploreLink onClick={handleExploreClick}>
            {linkText}
          </ExploreLink>
          
          <DoNotShowAgain>
            <Checkbox 
              type="checkbox" 
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              id="do-not-show-again"
            />
            <CheckboxLabel htmlFor="do-not-show-again">
              Don't show me this again
            </CheckboxLabel>
          </DoNotShowAgain>
          
          <GotItButton onClick={handleGotIt}>
            Ok, got it
          </GotItButton>
        </SuccessContent>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default SuccessPopup;

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
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 10000;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const ModalContent = styled.div`
  background: linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  transform: translateY(${props => props.visible ? '0' : '100%'});
  opacity: ${props => props.visible ? 1 : 0};
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 480px) {
    border-radius: 24px;
    margin: auto;
    max-height: 85vh;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  }
`;

const ProfileCard = styled.div`
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 24px 24px 0 0;
  overflow: hidden;

  @media (min-width: 480px) {
    border-radius: 24px 24px 0 0;
    height: 400px;
  }
`;

const ProfileImage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
`;

const ProfileOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
`;

const ProfileInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: #ffffff;
`;

const ProfileName = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #ffffff;
`;

const Age = styled.span`
  color: #F24462;
`;

const ProfileLocation = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #b0b0b0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LocationIcon = styled.span`
  font-size: 12px;
`;

const ProfileTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 20px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const AspirationTag = styled.div`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 10px 16px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TagLabel = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
`;

const TagSublabel = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SuccessContent = styled.div`
  padding: 28px 24px 36px;
  text-align: center;
  background: transparent;

  @media (min-width: 480px) {
    padding: 28px 32px 40px;
  }
`;

const SuccessTitle = styled.h3`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px;
`;

const SuccessMessage = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 16px;
`;

const ExploreLink = styled.button`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #F24462;
  background: none;
  border: none;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  margin-bottom: 28px;
  line-height: 1.5;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const GotItButton = styled.button`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(90deg, #F24462 0%, #E83E5F 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 14px 36px;
  transition: all 0.3s ease;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(242, 68, 98, 0.3);
  
  &:hover {
    background: linear-gradient(90deg, #E83E5F 0%, #F24462 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(242, 68, 98, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DoNotShowAgain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
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
  color: #888888;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    color: #b0b0b0;
  }
`;
