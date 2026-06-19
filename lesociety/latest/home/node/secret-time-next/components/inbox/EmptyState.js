import React, { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
const nochatImage = "/assets/nochat.png";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import MaxDatesReachedPopup from '../popups/MaxDatesReachedPopup';
import { startOrResumeCreateDate } from 'utils/createDateFlow';

const EmptyState = ({
  gender = 'male',
  activeDatesCount = null,
  hasResolvedActiveDatesCount = false,
}) => {
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);
  const isMale = gender === 'male';
  const [showMaxDatesPopup, setShowMaxDatesPopup] = useState(false);
  const hasKnownActiveDatesCount =
    hasResolvedActiveDatesCount && typeof activeDatesCount === "number";

  const handleCreateDate = () => {
    startOrResumeCreateDate(router, {
      token: user?.token,
      userName: user?.user_name,
      onLimitReached: () => setShowMaxDatesPopup(true),
    });
  };

  const handleCloseMaxDates = () => {
    setShowMaxDatesPopup(false);
  };

  return (
    <>
      <EmptyStateContainer>
        {isMale ? (
          // Men's Empty State
          <>
            <EmptyHeader>All quiet for now</EmptyHeader>
            <EmptySubtext>Find your next connection.</EmptySubtext>
            
            <EmptyIllustration>
              <Image src={nochatImage} alt="No conversations" width={280} height={200} />
            </EmptyIllustration>
            
            <EmptyTitle>No active conversations yet</EmptyTitle>
            <EmptyMessage>
              Every connection starts with a message.<br />
              Make yours count.
            </EmptyMessage>
          </>
        ) : (
          // Women's Empty State - No duplicate New Interests (already rendered in parent)
          <>
            <EmptyIllustration>
              <Image src={nochatImage} alt="No conversations" width={280} height={200} />
            </EmptyIllustration>
            
            <EmptyTitle>No active conversations yet</EmptyTitle>
            <EmptyMessage>
              Visibility builds Interests. Stay active!
            </EmptyMessage>
            
            {hasKnownActiveDatesCount && activeDatesCount === 0 && (
              <CreateDateButton onClick={handleCreateDate}>
                CREATE NEW DATE
              </CreateDateButton>
            )}
          </>
        )}
      </EmptyStateContainer>

      <MaxDatesReachedPopup
        isOpen={showMaxDatesPopup}
        onClose={handleCloseMaxDates}
      />
    </>
  );
};

export default EmptyState;

// Styled Components
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  min-height: 50vh;
  background: #000000;
`;

const EmptyHeader = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 10px;
  letter-spacing: 0.3px;
`;

const EmptySubtext = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #888888;
  margin: 0 0 28px;
  line-height: 1.5;
  letter-spacing: 0.2px;
`;

const EmptyIllustration = styled.div`
  margin: 32px 0;
  opacity: 0.8;
`;

const EmptyTitle = styled.h3`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px;
`;

const EmptyMessage = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #b0b0b0;
  margin: 0;
  line-height: 1.5;
`;

const CreateDateButton = styled.button`
  margin-top: 32px;
  background: linear-gradient(90deg, #F24462 0%, #E2466B 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 16px 36px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(242, 68, 98, 0.3);

  &:hover {
    background: linear-gradient(90deg, #E2466B 0%, #F24462 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(242, 68, 98, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    padding: 18px 40px;
    font-size: 14px;
  }
`;
