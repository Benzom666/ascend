import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const STEPS = [
  { key: 'location', label: 'Location', path: '/create-date/choose-city' },
  { key: 'experience', label: 'Experience', path: '/create-date/choose-date-type' },
  { key: 'earnings', label: 'Earnings', path: '/create-date/duration' },
  { key: 'duration', label: 'Duration', path: '/create-date/duration' },
  { key: 'description', label: 'Description', path: '/create-date/description' },
  { key: 'preview', label: 'Preview', path: '/create-date/review' },
];

const CreateDateProgressBar = ({ currentStep = 'location' }) => {
  const router = useRouter();
  const currentIndex = STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <ProgressContainer>
      <ProgressTrack>
        <ProgressFill progress={progress} />
      </ProgressTrack>
      <StepsRow>
        {STEPS.map((step, index) => (
          <StepLabel 
            key={step.key} 
            active={index === currentIndex}
            completed={index < currentIndex}
          >
            {step.label}
          </StepLabel>
        ))}
      </StepsRow>
    </ProgressContainer>
  );
};

export default CreateDateProgressBar;

const ProgressContainer = styled.div`
  padding: 12px 20px 8px;
  background: #000000;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #F24462 0%, #E2466B 100%);
  transition: width 0.3s ease;
  border-radius: 2px;
`;

const StepsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const StepLabel = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 10px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#FFFFFF' : props.completed ? '#888888' : '#555555'};
  text-transform: capitalize;
  white-space: nowrap;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: all 0.3s;
`;
