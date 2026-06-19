import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import TimerProgressBar from '../TimerProgressBar';

/**
 * LadiesTimerView Component
 * 
 * This view appears when a lady clicks on a Super Interested request.
 * Shows profile preview with expiration timer and action buttons.
 * 
 * @param {Object} props
 * @param {string} props.name - User's name
 * @param {string} props.image - Profile image URL
 * @param {string} props.quote - User's quote/bio
 * @param {number} props.expirationHours - Initial expiration time in hours (default: 48)
 * @param {number} props.expirationDate - Expiration timestamp (alternative to expirationHours)
 * @param {function} props.onViewProfile - Handler for "View Profile" button
 * @param {function} props.onReply - Handler for "Reply" button
 * @param {function} props.onReject - Handler for "Reject User" link
 * @param {function} props.onClose - Handler for close action
 */
const LadiesTimerView = ({
  name = "Someone",
  image = "/images/default-avatar.png",
  quote = "",
  expirationHours = 48,
  expirationDate = null,
  onViewProfile,
  onReply,
  onReject,
  onClose
}) => {
  const calculateTimeLeft = () => {
    if (expirationDate) {
      const now = new Date().getTime();
      const expiration = new Date(expirationDate).getTime();
      return Math.max(0, Math.floor((expiration - now) / 1000));
    }
    return expirationHours * 3600;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate when expirationDate changes (for async data arriving after mount)
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, [expirationDate]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format remaining time for display
  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`;
    }
    return `${seconds} sec`;
  };

  // Handle view profile button click
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    }
  };

  // Handle reply button click
  const handleReply = () => {
    if (onReply) {
      onReply();
    }
  };

  // Handle reject link click
  const handleReject = () => {
    if (onReject) {
      onReject();
    }
  };

  // Handle close action
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!mounted) return null;

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BackButton>
        <HeaderTitle>
          <StarIcon>★</StarIcon>
          {name} is Super Interested
        </HeaderTitle>
        <HeaderSpacer />
      </Header>

      {/* Content */}
      <Content>
        {/* Profile Image with Quote Overlay */}
        <ProfileImageContainer>
          <ProfileImage
            src={image}
            alt={`${name}'s profile`}
            width={400}
            height={500}
            objectFit="cover"
          />
          {quote && (
            <QuoteOverlay>
              <QuoteText>"{quote}"</QuoteText>
            </QuoteOverlay>
          )}
        </ProfileImageContainer>

        {/* Progress Section */}
        <ProgressSection>
          <ProgressLabel>Request expires in {formatTimeLeft()}</ProgressLabel>
          <TimerProgressBar
            totalSeconds={expirationHours * 3600}
            remainingSeconds={timeLeft}
            maxWidth={400}
            height={8}
          />
        </ProgressSection>

        {/* Access Granted Text */}
        <AccessText>You've been granted profile access</AccessText>

        {/* Action Buttons */}
        <ButtonGroup>
          <ViewProfileButton onClick={handleViewProfile}>
            VIEW PROFILE
          </ViewProfileButton>
          
          <ReplyButton onClick={handleReply}>
            REPLY
          </ReplyButton>
        </ButtonGroup>

        {/* Reject Link */}
        <RejectLink onClick={handleReject}>
          Reject User
        </RejectLink>
      </Content>
    </Container>
  );
};

export default LadiesTimerView;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const HeaderTitle = styled.h1`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StarIcon = styled.span`
  color: #FF6B6B;
  font-size: 18px;
`;

const HeaderSpacer = styled.div`
  width: 40px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  align-items: center;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/5;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const QuoteOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 20px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
`;

const QuoteText = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  margin: 0;
  line-height: 1.5;
  font-style: italic;
  text-align: center;
`;

const ProgressSection = styled.div`
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
`;

const ProgressLabel = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #888888;
  margin-bottom: 8px;
  text-align: center;
`;

const AccessText = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #b0b0b0;
  margin: 0 0 24px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
`;

const ViewProfileButton = styled.button`
  width: 100%;
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 14px 24px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ReplyButton = styled.button`
  width: 100%;
  background: #FF6B6B;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;

  &:hover {
    background: #ff8585;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RejectLink = styled.button`
  background: transparent;
  border: none;
  color: #666666;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;

  &:hover {
    color: #888888;
    text-decoration: underline;
  }
`;
