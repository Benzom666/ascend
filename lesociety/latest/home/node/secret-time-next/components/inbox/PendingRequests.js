import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useRouter } from 'next/router';

const inboxBlueSurface = `
  linear-gradient(180deg, rgba(8, 12, 24, 0.96) 0%, rgba(10, 15, 28, 0.92) 100%)
`;

const inboxBlueBorder = "rgba(72, 92, 126, 0.18)";

const formatCountdown = (request) => {
  const expirySource = request.expiresAt || request.expires_at;
  const remainingMs = expirySource
    ? Math.max(new Date(expirySource).getTime() - Date.now(), 0)
    : Math.max((request.hoursRemaining || 0) * 60 * 60 * 1000, 0);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    compact: hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`,
    full: hours > 0 
      ? `${hours} hr ${minutes} min ${seconds} sec` 
      : `${minutes} min ${seconds} sec`,
    badge: hours > 0 ? hours : minutes,
    seconds: totalSeconds,
  };
};

const RequestCircleWithTimer = ({ request, index }) => {
  const [countdown, setCountdown] = useState(() => formatCountdown(request));
  const REQUEST_WINDOW_HOURS = 48;
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(request));
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  const getProgress = (req) => {
    const now = Date.now();
    const expiresAt = req.expiresAt || req.expires_at;
    if (!expiresAt) return 0;
    const startAt = new Date(expiresAt).getTime() - REQUEST_WINDOW_HOURS * 60 * 60 * 1000;
    const total = new Date(expiresAt).getTime() - startAt;
    const remaining = new Date(expiresAt).getTime() - now;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, remaining / total));
  };

  const progress = getProgress(request);

  return (
    <RequestCircle
      key={request.id || index}
      $progress={progress}
      onClick={() => router.push(`/user/user-profile/${request.userName}`)}
    >
      <RingBase />
      <RingProgressClip $progress={progress}>
        <RingProgress />
      </RingProgressClip>
      <ProfileImage src={request.profileImage} alt={request.name} />
      {countdown.seconds > 0 && (
        <HoursBadge>
          <Image src="/clock.svg" alt="Clock" width={14} height={16} />
          <span>{countdown.badge}</span>
        </HoursBadge>
      )}
    </RequestCircle>
  );
};

const PendingRequests = ({ requests = [], ignoredCount = 0, rejectedCount = 0 }) => {
  const REQUEST_WINDOW_HOURS = 48;

  // Calculate hours remaining for each request
  const getHoursRemaining = (request) => {
    if (typeof request.hoursRemaining === "number") {
      return Math.max(0, request.hoursRemaining);
    }

    if (request.expiresAt || request.expires_at) {
      const now = new Date();
      const expires = new Date(request.expiresAt || request.expires_at);
      const diffMs = expires - now;
      const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
      return Math.max(0, diffHrs);
    }

    return 0;
  };

  const getProgress = (request) => {
    if (!(request.expiresAt || request.expires_at)) {
      const hr = getHoursRemaining(request);
      return Math.max(0, Math.min(1, hr / REQUEST_WINDOW_HOURS));
    }

    const now = Date.now();
    const expiresAt = new Date(request.expiresAt || request.expires_at).getTime();
    // Back-calculate start from the known 48h request window
    const startAt = expiresAt - REQUEST_WINDOW_HOURS * 60 * 60 * 1000;
    const total = expiresAt - startAt;
    const remaining = expiresAt - now;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, remaining / total));
  };
  if (requests.length === 0) {
    return (
      <Section>
        <SectionTitle>Pending Requests</SectionTitle>
        <QuietCard $spacious>
          <h4>All quiet for now</h4>
          <p>Find your next connection.</p>
        </QuietCard>
        <StatusRow>
          <StatusItem>({ignoredCount}) Ignored (Refunded after 48h)</StatusItem>
          <StatusItem>({rejectedCount}) Rejected (No refund)</StatusItem>
        </StatusRow>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>Pending Requests</SectionTitle>
      <RequestsPanel>
        <RequestsRow>
          {requests.map((request, index) => (
            <RequestCircleWithTimer key={request.id || index} request={request} index={index} />
          ))}
        </RequestsRow>
      </RequestsPanel>
      
      <StatusRow>
        <StatusItem>({ignoredCount}) Ignored (Refunded after 48h)</StatusItem>
        <StatusItem>({rejectedCount}) Rejected (No refund)</StatusItem>
      </StatusRow>
    </Section>
  );
};

export default PendingRequests;

const Section = styled.div`
  padding: 2px 20px 24px;
  border-bottom: none;

  @media (max-width: 767px) {
    padding-top: 0;
  }
`;

const SectionTitle = styled.h3`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #888888;
  margin: 0 0 10px;
  letter-spacing: 0.5px;
  text-align: center;
`;

const RequestsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 0;
  overflow-x: auto;
  overflow-y: visible;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RequestsPanel = styled.div`
  margin-bottom: 16px;
  padding: 10px 12px 8px;
  background: ${inboxBlueSurface};
  border: 1px solid ${inboxBlueBorder};
  border-radius: 10px;
  overflow: visible;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

const RequestCircle = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  min-width: 72px;
  flex-shrink: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 4px;

  &:hover {
    transform: scale(1.05);
  }
`;

const RingBase = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: url('/filled-ellipes.svg') center/cover no-repeat;
`;

const RingProgressClip = styled.div`
  --progress: ${(props) => (typeof props.$progress === "number" ? props.$progress : 0)};
  --angle: calc(var(--progress) * 360deg);
  position: absolute;
  inset: 0;
  border-radius: 50%;
  -webkit-mask-image: conic-gradient(
    from 0deg,
    #000 0deg,
    #000 var(--angle),
    transparent var(--angle),
    transparent 360deg
  );
  mask-image: conic-gradient(
    from 0deg,
    #000 0deg,
    #000 var(--angle),
    transparent var(--angle),
    transparent 360deg
  );
  pointer-events: none;
`;

const RingProgress = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: url('/ring.svg') center/cover no-repeat;
  -webkit-mask-image: conic-gradient(
    from 0deg,
    #000 0deg,
    #000 360deg,
    #000 360deg
  );
  mask-image: conic-gradient(
    from 0deg,
    #000 0deg,
    #000 360deg,
    #000 360deg
  );
  pointer-events: none;
`;

const ProfileImage = styled.img`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #000000;
`;

const HoursBadge = styled.div`
  position: absolute;
  top: 1px;
  right: -3px;
  width: 14px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  pointer-events: none;

  img {
    display: block;
    width: 14px;
    height: 16px;
  }

  span {
    position: absolute;
    top: calc(50% + 1px);
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
    font-size: 7.5px;
    line-height: 1;
    font-weight: 800;
    color: #FFFFFF;
    text-align: center;
    min-width: 8px;
  }
`;

const StatusRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const StatusMeta = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 11px;
  color: #6b768c;
`;

const StatusItem = styled.div`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #666666;
`;

const QuietCard = styled.div`
  background: ${inboxBlueSurface};
  border: 1px solid ${inboxBlueBorder};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  h4 {
    font-size: 16px;
    color: #ffffff;
    margin: 0 0 6px;
    font-weight: 600;
  }

  p {
    font-size: 12px;
    color: #888888;
    margin: 0;
    line-height: 1.5;
  }
`;
