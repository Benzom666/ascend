import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import MaxDatesReachedPopup from '../popups/MaxDatesReachedPopup';
import CreateDatePrimaryButton from '../common/CreateDatePrimaryButton';
import { startOrResumeCreateDate } from 'utils/createDateFlow';

const inboxBlueSurface = `
  linear-gradient(180deg, rgba(8, 12, 24, 0.96) 0%, rgba(10, 15, 28, 0.92) 100%)
`;

const inboxBlueBorder = "rgba(72, 92, 126, 0.18)";

const NewInterests = ({
  interestCount = 0,
  activeDatesCount = null,
  hasResolvedActiveDatesCount = false,
  onViewInterests,
  expiringInterestsCount = 0,
  totalExpiredInterestsCount = 0,
}) => {
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);
  const [showMaxDatesPopup, setShowMaxDatesPopup] = useState(false);

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

  const handleViewInterests = () => {
    if (interestCount > 0 && onViewInterests) {
      onViewInterests();
    }
  };

  const hasKnownActiveDatesCount =
    hasResolvedActiveDatesCount && typeof activeDatesCount === "number";

  return (
    <>
      <Section>
        <SectionTitle>New Interests</SectionTitle>
        
        <InterestCard onClick={handleViewInterests} clickable={interestCount > 0}>
          <InterestCopy>
            <InterestText>
              {interestCount === 0
                ? "You Have No\nNew Interests"
                : "You Have New\nPrivate Interests"}
            </InterestText>
            <InterestSubtext>
              {expiringInterestsCount > 0
                ? `${expiringInterestsCount} interest${expiringInterestsCount !== 1 ? "s" : ""} about to expire`
                : hasKnownActiveDatesCount
                ? `${activeDatesCount} active ${activeDatesCount === 1 ? "date is" : "dates are"} live on gallery`
                : "Checking your active dates..."}
            </InterestSubtext>
          </InterestCopy>
          <InterestRing
            clickable={interestCount > 0}
          >
            {interestCount > 0 ? (
              <img className="interest-ring-active" src="/newinterestring.svg" alt="Interest Ring" />
            ) : (
              <img className="interest-ring-base" src="/ellipse3.svg" alt="Interest Ring Base" />
            )}
            <span className="ring-value women-ring-value">{interestCount}</span>
          </InterestRing>
        </InterestCard>

        {/* Total expired interests - new per design */}
        <ExpiredInterests>
          ({totalExpiredInterestsCount}) Total expired interests
        </ExpiredInterests>

        {hasKnownActiveDatesCount && activeDatesCount === 0 && (
          <CreateButton onClick={handleCreateDate}>
            Create New Date
          </CreateButton>
        )}
      </Section>

      <MaxDatesReachedPopup
        isOpen={showMaxDatesPopup}
        onClose={handleCloseMaxDates}
      />
    </>
  );
};

export default NewInterests;

const Section = styled.div`
  padding: 8px 20px 16px;
  border-bottom: none;
`;

const SectionTitle = styled.h3`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #888888;
  margin: 0 0 12px;
  letter-spacing: 0.5px;
  text-align: center;
`;

const InterestCard = styled.div`
  background: ${inboxBlueSurface};
  border: 1px solid ${inboxBlueBorder};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  ${props => props.clickable && `
    &:hover {
      background: linear-gradient(180deg, rgba(10, 16, 30, 0.98) 0%, rgba(11, 18, 34, 0.96) 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      border-color: ${inboxBlueBorder};
    }
  `}
`;

const InterestCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InterestText = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.18;
  white-space: pre-line;
`;

const InterestSubtext = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #888888;
`;

const InterestRing = styled.div`
  position: relative;
  width: 86px;
  height: 87px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  .interest-ring-base {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }

  .interest-ring-active {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    object-fit: contain;
  }

  .ring-value {
    position: absolute;
    inset: 0;
    margin: auto;
    z-index: 10;
    font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
    font-size: 26px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ExpiredInterests = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #666666;
  margin: 8px 0 16px;
  padding-left: 4px;
`;

const CreateButton = styled(CreateDatePrimaryButton)`
  width: 100%;
  max-width: none;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    padding: 18px;
    font-size: 14px;
  }
`;
