import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import { FiMapPin } from "react-icons/fi";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import {
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import Loader from "@/modules/Loader/Loader";
import {
  createDateLimitServerSideProps,
  useCreateDateAccessGuard,
} from "utils/createDateAccessGuard";

function CreateLocation() {
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer?.user);
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  // REMOVED: useCreateDateAccessGuard - limit check moved to Create Date button
  // This was causing unnecessary network calls and button lag

  useEffect(() => {
    try {
      const savedData = readCreateDateFlow();
      if (savedData.location) setLocation(savedData.location);
      if (savedData.isPublic !== undefined) setIsPublic(savedData.isPublic);
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  }, []);

  // Removed unnecessary loader - limit check shouldn't block page rendering during flow navigation

  // REMOVED: limit check removed

  const handleNext = () => {
    if (!location.trim()) return;

    try {
      const updatedData = {
        location,
        isPublic,
      };
      writeCreateDateFlow(updatedData);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }

    router.push("/create-date/review");
  };

  return (
    <div className="create-date-page" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <CreateDateNewHeader
        activeStep={0}
        showBack={false}
        onBack={() => router.push("/create-date/description")}
        onClose={() => router.push("/user/user-list")}
      />

      <div className="create-date-content">
        <h1 className="page-title">Where will it happen?</h1>
        <p className="page-subtitle">
          Let him know the general area or specific venue where your date will
          take place.
        </p>

        <div className="form-section">
          <div className="input-wrapper">
            <FiMapPin className="input-icon" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g., Downtown Manhattan, or 'Le Petit Cafe, Paris'"
              className="location-input"
            />
          </div>

          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${isPublic ? "active" : ""}`}
              onClick={() => setIsPublic(true)}
            >
              Public Place
            </button>
            <button
              className={`toggle-btn ${!isPublic ? "active" : ""}`}
              onClick={() => setIsPublic(false)}
            >
              Private/Video
            </button>
          </div>

          <div className="tips-section">
            <div className="tips-title">Safety tips:</div>
            <ul className="tips-list">
              <li>Choose public places for first dates</li>
              <li>Share location details with trusted friends</li>
              <li>Trust your instincts</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bottom-button-container">
        <button
          className={`next-button ${!location.trim() ? "disabled" : ""}`}
          onClick={handleNext}
          disabled={!location.trim()}
        >
          NEXT
        </button>
      </div>

      <style jsx>{`
        .create-date-page {
          min-height: 100vh;
          background: #000000;
          display: flex;
          flex-direction: column;
        }

        .create-date-content {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
          padding-bottom: 120px;
        }

        .page-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 24px;
          font-weight: 600;
          line-height: 1.15;
          color: #FFFFFF;
          text-align: center;
          text-wrap: balance;
          max-width: 36ch;
          margin: 0 auto 8px;
        }

        .page-subtitle {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #CCCCCC;
          text-align: center;
          margin: 0 0 32px 0;
        }

        .form-section {
          background: #1A1A1A;
          border: 1px solid #333333;
          border-radius: 12px;
          padding: 20px;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #888888;
          font-size: 20px;
          z-index: 1;
        }

        .location-input {
          width: 100%;
          padding: 16px 16px 16px 50px;
          font-size: 16px;
          background: #000000;
          color: #FFFFFF;
          border: 1px solid #333333;
          border-radius: 8px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }

        .location-input:focus {
          outline: none;
          border-color: #F24462;
        }

        .location-input::placeholder {
          color: #666666;
        }

        .toggle-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .toggle-btn {
          flex: 1;
          padding: 16px;
          background: #000000;
          border: 1px solid #333333;
          border-radius: 8px;
          color: #CCCCCC;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn.active {
          background: rgba(242, 68, 98, 0.1);
          border: 2px solid #F24462;
          color: #F24462;
        }

        .tips-section {
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .tips-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .tips-list {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          color: #AAAAAA;
          line-height: 1.8;
          margin: 0;
          padding-left: 20px;
        }

        .bottom-button-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: #000000;
          border-top: 1px solid #333333;
          display: flex;
          justify-content: center;
        }

        .next-button {
          width: 100%;
          max-width: 420px;
          height: 48px;
          background: #F24462;
          border: none;
          border-radius: 8px;
          color: #FFFFFF;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .next-button:hover:not(.disabled) {
          opacity: 0.9;
        }

        .next-button.disabled {
          background: #333333;
          color: #666666;
          cursor: not-allowed;
        }

        @media (min-width: 768px) {
          .create-date-content {
            padding: 40px 32px;
            max-width: 600px;
            margin: 0 auto;
          }

          .page-title {
            font-size: 32px;
          }

          .page-subtitle {
            font-size: 16px;
            margin-bottom: 40px;
          }

          .form-section {
            padding: 24px;
          }

          .bottom-button-container {
            padding: 24px 32px;
          }

          .next-button {
            height: 56px;
            font-size: 18px;
            max-width: 600px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}

export default CreateLocation;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
