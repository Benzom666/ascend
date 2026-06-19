import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

const CreateDatePrimaryButton = ({
  children = "Create New Date",
  className,
  style,
  user,
  token,
  onClick,
  ...props
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const isMountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClick = async (e) => {
    // Prevent double-clicks
    if (isNavigating) return;

    // Provide immediate visual feedback
    setIsNavigating(true);

    // If onClick provided, call it immediately (it handles limit check internally)
    if (onClick) {
      try {
        await onClick(e);
      } catch (error) {
        console.error("Create date navigation failed:", error);
      } finally {
        if (isMountedRef.current) {
          setIsNavigating(false);
        }
      }
      return;
    }

    // Fallback: direct navigation without limit check
    try {
      await router.push("/create-date/choose-city?showIntro=true");
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      if (isMountedRef.current) {
        setIsNavigating(false);
      }
    }
  };

  return (
    <Button
      type="button"
      className={className}
      style={{
        ...style,
        opacity: isNavigating ? 0.7 : 1,
        cursor: isNavigating ? "wait" : "pointer",
      }}
      aria-label={typeof children === "string" ? children : "Create New Date"}
      aria-busy={isNavigating ? "true" : "false"}
      onClick={handleClick}
      disabled={isNavigating}
      {...props}
    >
      <ButtonLabel>{isNavigating ? "Loading..." : children}</ButtonLabel>
      {isNavigating && <Spinner aria-hidden="true" />}
    </Button>
  );
};

export default CreateDatePrimaryButton;

const Button = styled.button`
  width: min(100%, 300px) !important;
  max-width: 300px !important;
  height: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 8px !important;
  background: url("/images/primarycta.svg") center / 100% 100% no-repeat !important;
  background-color: transparent !important;
  box-shadow: none !important;
  color: transparent !important;
  display: block !important;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 0 !important;
  overflow: hidden;
  position: relative;
  text-indent: -9999px;

  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none !important;
  }
`;

const ButtonLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Visible spinner overlay. The button's background is an SVG image and the
// label is a screen-reader-only span (clip rect), so without this overlay
// users see no feedback when isNavigating=true. The spinner is positioned
// absolutely on top of the SVG button graphic.
const Spinner = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: createDatePrimaryBtnSpin 0.7s linear infinite;
  pointer-events: none;
  z-index: 2;
  text-indent: 0;

  @keyframes createDatePrimaryBtnSpin {
    to { transform: rotate(360deg); }
  }
`;
