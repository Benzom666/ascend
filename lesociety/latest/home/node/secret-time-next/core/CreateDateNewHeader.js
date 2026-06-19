import React from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { useRouter } from "next/router";
import {
  consumeCreateDateProgressFromStep,
  getCreateDateProgressWidth,
  peekCreateDateProgressFromStep,
} from "utils/createDateProgress";

const TABS = [
  "Location",
  "Experience",
  "Earnings",
  "Duration",
  "Description",
  "Preview",
];

function CreateDateNewHeader({
  activeStep = 0,
  onBack,
  onClose,
  showBack = true,
  showClose = true,
}) {
  const router = useRouter();

  const getTabForRoute = () => {
    const pathname = router?.pathname || "";
    if (pathname.includes("choose-city")) return 0;
    if (pathname.includes("choose-date-type")) return 1;
    if (pathname.includes("date-event")) return 2;
    if (pathname.includes("duration")) return 3;
    if (pathname.includes("description")) return 4;
    if (pathname.includes("review")) return 5;
    return activeStep;
  };

  const currentTab = getTabForRoute();
  const initialProgressWidth = React.useMemo(() => {
    const previousStep = peekCreateDateProgressFromStep();

    if (
      Number.isFinite(previousStep) &&
      previousStep >= 0 &&
      previousStep < TABS.length &&
      previousStep !== currentTab
    ) {
      return getCreateDateProgressWidth(previousStep, TABS.length);
    }

    return getCreateDateProgressWidth(currentTab, TABS.length);
  }, [currentTab]);
  const [progressWidth, setProgressWidth] = React.useState(
    initialProgressWidth
  );

  React.useLayoutEffect(() => {
    const targetWidth = getCreateDateProgressWidth(currentTab, TABS.length);
    const previousStep = consumeCreateDateProgressFromStep();

    if (
      Number.isFinite(previousStep) &&
      previousStep >= 0 &&
      previousStep < TABS.length &&
      previousStep !== currentTab
    ) {
      let frame = null;

      frame = window.requestAnimationFrame(() => {
        setProgressWidth(targetWidth);
      });

      return () => {
        if (frame) window.cancelAnimationFrame(frame);
      };
    }

    setProgressWidth(targetWidth);
    return undefined;
  }, [currentTab]);

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);

    const frame = window.requestAnimationFrame(() => {
      const content = document.querySelector(".create-date-content");
      if (content && typeof content.scrollTo === "function") {
        content.scrollTo(0, 0);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentTab]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/user/user-list");
    }
  };

  return (
    <>
      <div className="create-date-header">
        <div className="header-bar">
          <button className="header-btn" onClick={handleBack}>
            {showBack ? <FiArrowLeft size={16} color="#CCCCCC" /> : null}
          </button>
          <span className="header-title">CREATE NEW DATE</span>
          <button className="header-btn" onClick={handleClose}>
            {showClose ? <FiX size={16} color="#CCCCCC" /> : null}
          </button>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-wrapper">
            <div className="progress-line"></div>
            <div
              className="progress-line-fill"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
        </div>

        <div className="tabs-container">
          {TABS.map((tab, index) => {
            const isActive = index === currentTab;
            return (
              <button
                key={tab}
                className={`tab ${isActive ? "tab-active" : ""}`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .create-date-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #000000;
        }

        .header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
        }

        .header-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
        }

        .header-btn:first-child {
          visibility: ${showBack ? "visible" : "hidden"};
          pointer-events: ${showBack ? "auto" : "none"};
        }

        .header-btn:last-child {
          visibility: ${showClose ? "visible" : "hidden"};
          pointer-events: ${showClose ? "auto" : "none"};
        }

        .header-btn:hover {
          opacity: 0.7;
        }

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #cccccc;
          letter-spacing: 1px;
        }

        .progress-bar-container {
          height: 20px;
          background: transparent;
          position: relative;
          padding: 0 20px;
          display: flex;
          align-items: center;
        }

        .progress-bar-wrapper {
          width: 100%;
          height: 5px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .progress-line {
          position: absolute;
          width: 100%;
          height: 5px;
          background: linear-gradient(
            90deg,
            #979797 0%,
            rgba(23, 18, 255, 0.4) 100%
          );
          opacity: 0.3;
          border-radius: 10px;
        }

        .progress-line-fill {
          position: absolute;
          height: 5px;
          background: linear-gradient(
            90deg,
            #1712ff 0%,
            #f24462 48.87%,
            #ff007a 100%
          );
          border-radius: 10px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(255, 0, 122, 0.5);
        }

        .tabs-container {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tabs-container::-webkit-scrollbar {
          display: none;
        }

        .tab {
          flex: 1;
          padding: 14px 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 400;
          color: #666666;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          white-space: nowrap;
        }

        .tab-active {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          border-bottom: 2px solid transparent;
        }

        @media (max-width: 767px) {
          .tabs-container {
            font-size: 12px;
          }

          .tab {
            font-size: 12px !important;
            padding: 10px 6px !important;
          }
        }
      `}</style>
    </>
  );
}

export default CreateDateNewHeader;
