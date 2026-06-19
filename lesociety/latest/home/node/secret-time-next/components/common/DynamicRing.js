import React, { useEffect, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const autoMaxForValue = (value, minMax = 10, step = 5) => {
  const safeValue = Math.max(0, Number(value) || 0);
  if (safeValue === 0) return minMax;
  return Math.max(minMax, Math.ceil(safeValue / step) * step);
};

export default function DynamicRing({
  value = 0,
  max,
  className = "",
  valueClassName = "",
  alt = "Value ring",
  minMax = 10,
  autoStep = 5,
  minVisibleSweep = 20,
  startAngleDeg = -180,
  direction = "cw",
  forceProgress,
  trackMaxKey,
  resetTrackedMaxOnZeroToPositive = false,
  resetTrackedMaxOnIncrease = false,
  baseRingImage,
  progressRingImage,
  preferSvg = true,
  roundedCaps = false,
  progressRotationDeg = 0,
  ringThicknessPx = 6,
  progressAssetScaleX = 0.9885057471264368,
  progressAssetScaleY = 1,
  progressAssetOffsetX = 0,
  progressAssetOffsetY = 0,
}) {
  const numericValue = Math.max(0, Number(value) || 0);
  const [trackedMax, setTrackedMax] = useState(null);

  useEffect(() => {
    if (!trackMaxKey || typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(trackMaxKey);
      const parsed = raw ? JSON.parse(raw) : {};
      const previousMax = Number(parsed?.max) > 0 ? Number(parsed.max) : null;
      const previousValue =
        typeof parsed?.lastValue === "number" ? parsed.lastValue : Number(parsed?.lastValue);

      let nextMax = previousMax;

      if (numericValue > 0) {
        if (
          resetTrackedMaxOnZeroToPositive &&
          (Number(previousValue) <= 0 || Number.isNaN(Number(previousValue)))
        ) {
          nextMax = numericValue;
        } else if (
          resetTrackedMaxOnIncrease &&
          Number.isFinite(Number(previousValue)) &&
          numericValue > Number(previousValue)
        ) {
          nextMax = numericValue;
        } else if (!nextMax || numericValue > nextMax) {
          nextMax = numericValue;
        }
      }

      setTrackedMax(nextMax || null);

      window.localStorage.setItem(
        trackMaxKey,
        JSON.stringify({
          max: nextMax || null,
          lastValue: numericValue,
        })
      );
    } catch (error) {
      setTrackedMax(null);
    }
  }, [numericValue, trackMaxKey, resetTrackedMaxOnZeroToPositive, resetTrackedMaxOnIncrease]);

  const normalizedMax =
    Number(trackedMax) > 0
      ? Number(trackedMax)
      : Number(max) > 0
      ? Number(max)
      : autoMaxForValue(numericValue, minMax, autoStep);
  const progressFromValue = clamp(
    normalizedMax > 0 ? numericValue / normalizedMax : 0,
    0,
    1
  );
  const progress =
    typeof forceProgress === "number"
      ? clamp(forceProgress, 0, 1)
      : progressFromValue;
  const sweep =
    typeof forceProgress === "number"
      ? progress * 360
      : numericValue > 0
      ? Math.max(minVisibleSweep, progress * 360)
      : 0;
  const hasBaseAsset = Boolean(baseRingImage);
  const hasProgressAsset = Boolean(progressRingImage);
  const useSvgRingMode = preferSvg && hasBaseAsset && hasProgressAsset;
  const useSvgProgressOverlay = roundedCaps && !useSvgRingMode;
  const svgRadius = 46.5116;
  const svgStroke = 6.9767;
  const svgCircumference = 2 * Math.PI * svgRadius;
  const displayedProgress = clamp(progress, 0, 0.9995);
  const dashVisible = svgCircumference * displayedProgress;
  const gradientRotation = 270; // Fixed 270° rotation for gradient only

  return (
    <div
      className={`${className} dynamic-ring`.trim()}
      role="img"
      aria-label={`${alt}: ${numericValue}`}
      style={{
        "--dr-sweep": `${sweep.toFixed(2)}deg`,
        "--dr-ring-thickness": `${ringThicknessPx}px`,
        "--dr-start-angle": `${startAngleDeg}deg`,
        "--dr-progress-asset-scale-x": hasProgressAsset ? progressAssetScaleX : 1,
        "--dr-progress-asset-scale-y": hasProgressAsset ? progressAssetScaleY : 1,
        "--dr-progress-asset-offset-x": hasProgressAsset ? `${progressAssetOffsetX}px` : "0px",
        "--dr-progress-asset-offset-y": hasProgressAsset ? `${progressAssetOffsetY}px` : "0px",
      }}
    >
      <div className="dynamic-ring__canvas" aria-hidden="true">
        {useSvgRingMode ? (
          <svg viewBox="0 0 100 100" className="dynamic-ring__svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient
                id="dynamicRingGrad"
                x1="100"
                y1="78.3988"
                x2="19.0313"
                y2="112.773"
                gradientUnits="userSpaceOnUse"
                gradientTransform={`rotate(${gradientRotation} 50 50)`}
              >
                <stop stopColor="#FF007A" />
                <stop offset="0.226193" stopColor="#F24462" stopOpacity="0.8" />
                <stop offset="0.666117" stopColor="#802AB4" stopOpacity="0.6" />
                <stop offset="0.985297" stopColor="#1712FF" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <g
              transform={`translate(${progressAssetOffsetX} ${progressAssetOffsetY}) rotate(${progressRotationDeg} 50 50)`}
            >
              <circle
                cx="50"
                cy="50"
                r={svgRadius}
                fill="none"
                stroke="#231E26"
                strokeWidth={svgStroke}
              />
              {displayedProgress > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={svgRadius}
                  fill="none"
                  stroke="url(#dynamicRingGrad)"
                  strokeWidth={svgStroke}
                  strokeLinecap="round"
                  strokeDasharray={`${dashVisible} ${svgCircumference}`}
                  strokeDashoffset="0"
                  transform={
                    direction === "ccw"
                      ? `rotate(${startAngleDeg} 50 50) scale(-1,1) translate(-100,0)`
                      : `rotate(${startAngleDeg} 50 50)`
                  }
                />
              )}
            </g>
          </svg>
        ) : (
          <>
            <div className="dynamic-ring__track" />
            {useSvgProgressOverlay ? (
              <svg
                viewBox="0 0 100 100"
                className="dynamic-ring__svg dynamic-ring__svg--overlay"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {progressRingImage ? (
                    <pattern
                      id="dynamicRingPattern"
                      patternUnits="userSpaceOnUse"
                      width="100"
                      height="100"
                    >
                      <image href={progressRingImage} x="0" y="0" width="100" height="100" />
                    </pattern>
                  ) : (
                    <linearGradient
                      id="dynamicRingGrad"
                      x1="100"
                      y1="78.3988"
                      x2="19.0313"
                      y2="112.773"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform={`rotate(${gradientRotation} 50 50)`}
                    >
                      <stop stopColor="#FF007A" />
                      <stop offset="0.226193" stopColor="#F24462" stopOpacity="0.8" />
                      <stop offset="0.666117" stopColor="#802AB4" stopOpacity="0.6" />
                      <stop offset="0.985297" stopColor="#1712FF" stopOpacity="0.4" />
                    </linearGradient>
                  )}
                </defs>
                {displayedProgress > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={svgRadius}
                    fill="none"
                    stroke={roundedCaps ? "url(#dynamicRingGrad)" : (progressRingImage ? "url(#dynamicRingPattern)" : "url(#dynamicRingGrad)")}
                    strokeWidth={svgStroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dashVisible} ${svgCircumference}`}
                    strokeDashoffset="0"
                    transform={
                      direction === "ccw"
                        ? `rotate(${startAngleDeg} 50 50) scale(-1,1) translate(-100,0)`
                        : `rotate(${startAngleDeg} 50 50)`
                    }
                  />
                )}
              </svg>
            ) : (
              <div className="dynamic-ring__progress-clip">
                <div className="dynamic-ring__progress" />
              </div>
            )}
          </>
        )}
      </div>
      <div className="dynamic-ring__value">
        <span className={valueClassName}>{numericValue}</span>
      </div>

      <style jsx>{`
        .dynamic-ring {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .dynamic-ring__canvas {
          position: absolute;
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          aspect-ratio: ${(hasBaseAsset || hasProgressAsset) ? "auto" : "1 / 1"};
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .dynamic-ring__track,
        .dynamic-ring__progress-clip,
        .dynamic-ring__progress {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          pointer-events: none;
        }

        .dynamic-ring__svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
        }

        .dynamic-ring__svg--overlay {
          z-index: 2;
        }

        .dynamic-ring__track {
          z-index: 1;
          background: ${baseRingImage
            ? `url(${baseRingImage}) center/contain no-repeat`
            : "rgba(35, 30, 38, 0.95)"};
          background-size: ${hasBaseAsset ? "contain" : "auto"};
          transform: ${hasBaseAsset
            ? `translate(
              var(--dr-progress-asset-offset-x),
              var(--dr-progress-asset-offset-y)
            )
            scale(
              var(--dr-progress-asset-scale-x),
              var(--dr-progress-asset-scale-y)
            )`
            : "none"};
          transform-origin: 50% 50%;
          -webkit-mask: ${hasBaseAsset
            ? "none"
            : `radial-gradient(
            farthest-side,
            transparent calc(100% - var(--dr-ring-thickness)),
            #000 calc(100% - (var(--dr-ring-thickness) - 1px))
          )`};
          mask: ${hasBaseAsset
            ? "none"
            : `radial-gradient(
            farthest-side,
            transparent calc(100% - var(--dr-ring-thickness)),
            #000 calc(100% - (var(--dr-ring-thickness) - 1px))
          )`};
        }

        .dynamic-ring__progress-clip {
          z-index: 2;
          -webkit-mask-image: conic-gradient(
            from var(--dr-start-angle),
            #000 0deg,
            #000 var(--dr-sweep),
            transparent var(--dr-sweep),
            transparent 360deg
          );
          mask-image: conic-gradient(
            from var(--dr-start-angle),
            #000 0deg,
            #000 var(--dr-sweep),
            transparent var(--dr-sweep),
            transparent 360deg
          );
        }

        .dynamic-ring__progress {
          z-index: 1;
          background: ${progressRingImage
            ? `url(${progressRingImage}) center/contain no-repeat`
            : "conic-gradient(from var(--dr-start-angle), #ff007a 0deg, #f24462 201.6deg, #1712ff 360deg)"};
          background-size: ${hasProgressAsset ? "contain" : "auto"};
          transform: translate(
              var(--dr-progress-asset-offset-x),
              var(--dr-progress-asset-offset-y)
            )
            rotate(${progressRotationDeg}deg)
            scale(
              var(--dr-progress-asset-scale-x),
              var(--dr-progress-asset-scale-y)
            );
          transform-origin: 50% 50%;
          -webkit-mask: ${hasProgressAsset
            ? "none"
            : `radial-gradient(
            farthest-side,
            transparent calc(100% - var(--dr-ring-thickness)),
            #000 calc(100% - (var(--dr-ring-thickness) - 1px))
          )`};
          mask: ${hasProgressAsset
            ? "none"
            : `radial-gradient(
            farthest-side,
            transparent calc(100% - var(--dr-ring-thickness)),
            #000 calc(100% - (var(--dr-ring-thickness) - 1px))
          )`};
        }

        .dynamic-ring__value {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
          margin: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        .dynamic-ring__value > span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          position: static !important;
          top: auto !important;
          right: auto !important;
          bottom: auto !important;
          left: auto !important;
          inset: auto !important;
          transform: none !important;
          margin: 0 !important;
          width: auto !important;
          height: auto !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .dynamic-ring__progress {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
