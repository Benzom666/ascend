import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * InterestRingIndicator Component
 * Shows a circular progress ring with the interest count
 * Matches the design from the Figma assets
 */
const InterestRingIndicator = ({ 
  count = 0, 
  maxCount = 10,
  size = 72,
  strokeWidth = 4,
  activeColor = '#F24462',
  inactiveColor = '#2a2a3e'
}) => {
  // Calculate progress (for visual ring fill)
  const progress = Math.min(count / maxCount, 1);
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const strokeDashoffset = circumference - (progress * circumference);
  
  const hasNewInterests = count > 0;

  return (
    <RingContainer size={size}>
      <SVGWrapper viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient 
            id="interestRingGradient"
            x1="100"
            y1="78.3988"
            x2="19.0313"
            y2="112.773"
            gradientUnits="userSpaceOnUse"
            gradientTransform="rotate(270 36 36)"
          >
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="0.226193" stopColor="#F24462" stopOpacity="0.8" />
            <stop offset="0.666" stopColor="#802AB4" stopOpacity="0.6" />
            <stop offset="0.985" stopColor="#1712FF" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <BackgroundCircle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle - animated when there are interests */}
        {hasNewInterests && (
          <ProgressCircle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            strokeWidth={strokeWidth}
            circumference={circumference}
            offset={strokeDashoffset}
          />
        )}
      </SVGWrapper>
      
      {/* Count display */}
      <CountDisplay hasInterests={hasNewInterests}>
        {count}
      </CountDisplay>
      
      {/* Pulse animation for new interests */}
      {hasNewInterests && <PulseRing size={size} />}
    </RingContainer>
  );
};

// Animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const RingContainer = styled.div`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SVGWrapper = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(90deg);
`;

const BackgroundCircle = styled.circle`
  fill: none;
  stroke: ${props => props.inactiveColor || '#2a2a3e'};
`;

const ProgressCircle = styled.circle`
  fill: none;
  stroke: url(#interestRingGradient);
  stroke-linecap: round;
  stroke-dasharray: ${props => props.circumference};
  stroke-dashoffset: ${props => props.offset};
  transition: stroke-dashoffset 0.5s ease;
`;

const CountDisplay = styled.div`
  position: relative;
  z-index: 2;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.hasInterests ? '#F24462' : '#ffffff'};
  line-height: 1;
  transition: color 0.3s ease;
`;

const PulseRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: 2px solid #F24462;
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;
  pointer-events: none;
`;

export default InterestRingIndicator;
