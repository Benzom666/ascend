import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import MaxDatesReachedPopup from '@/components/popups/MaxDatesReachedPopup';
import { startOrResumeCreateDate } from 'utils/createDateFlow';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Card = styled.div`
  background: #1a1a1a;
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
`;

const Icon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #F24462 0%, #F02D4E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #cccccc;
  line-height: 1.6;
  margin: 0 0 30px 0;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #F24462 0%, #F02D4E 100%);
  border: none;
  border-radius: 12px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(242, 68, 98, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DatePopup = ({ modalIsOpen, closeModal }) => {
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);
  const [showMaxDatesPopup, setShowMaxDatesPopup] = useState(false);

  if (!modalIsOpen) return null;

  const handleCreateDate = async () => {
    const activeCount = user?.active_dates_count || 0;
    if (activeCount >= 4) {
      setShowMaxDatesPopup(true);
      return;
    }
    const result = await startOrResumeCreateDate(router, {
      token: user?.token,
      userName: user?.user_name,
      activeDatesCount: activeCount,
      onLimitReached: () => setShowMaxDatesPopup(true),
    });

    if (result?.status === "started" || result?.status === "resumed") {
      closeModal();
    }
  };

  if (showMaxDatesPopup) {
    return (
      <MaxDatesReachedPopup
        isOpen={showMaxDatesPopup}
        onClose={() => setShowMaxDatesPopup(false)}
      />
    );
  }

  return (
    <Overlay onClick={closeModal}>
      <Card onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={closeModal}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.9924 12.9926L1.00244 1.00006" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.9887 1.00534L1.00873 12.9853" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CloseButton>
        <Icon>💎</Icon>
        <Title>What are you waiting for?</Title>
        <Subtitle>Post your own date and start earning now</Subtitle>
        <Button onClick={handleCreateDate}>
          CREATE NEW DATE
        </Button>
      </Card>
    </Overlay>
  );
};

export default DatePopup;
