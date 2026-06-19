import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { FiCheckCircle } from "react-icons/fi";
import { apiRequest } from "utils/Utilities";
import { formatDisplayText } from "utils/formatDisplayText";
import {
  activateCreateDateFlow,
  clearCreateDateFlow,
  startOrResumeCreateDate,
} from "utils/createDateFlow";

function CreateSuccess() {
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer?.user);
  const [dateData, setDateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDateData = async () => {
      if (!router.query.dateId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest({
          method: "GET",
          url: `date/${router.query.dateId}`,
          token: user?.token,
        });

        console.log("Fetched created date:", response.data);
        setDateData(response.data?.data);
      } catch (err) {
        console.error("Error fetching date:", err);
      } finally {
        setLoading(false);
      }
    };

    if (router.query.dateId) {
      fetchDateData();
    } else {
      setLoading(false);
    }
  }, [router.query.dateId, user?.token]);

  const handleViewDates = () => {
    router.push("/user/user-list");
  };

  const handleCreateAnother = () => {
    clearCreateDateFlow();
    activateCreateDateFlow({ flowMode: "create" });
    startOrResumeCreateDate(router);
  };

  if (loading) {
    return (
      <div className="create-date-page" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <div className="loading-container">
          <div className="spin-loader"></div>
          <p>Loading your date...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-date-page" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <div className="create-date-content">
        <div className="success-icon-wrapper">
          <FiCheckCircle className="success-icon" />
        </div>

        <h1 className="success-title">Your date has been created!</h1>
        <p className="success-subtitle">
          Get ready for amazing Super Interested offers
        </p>

        {dateData && (
          <div className="success-date-card">
            <div className="date-card-header">
              <h3>{dateData.date_type || "Brunch Date"}</h3>
              <span className="price-badge">${dateData.price || 0}</span>
            </div>

            <div className="date-card-body">
              <div className="date-detail-item">
                <span className="detail-emoji">📅</span>
                <div>
                  <div className="detail-label">Category</div>
                  <div className="detail-value">
                    {dateData.category?.name || "N/A"}
                  </div>
                </div>
              </div>

              <div className="date-detail-item">
                <span className="detail-emoji">💫</span>
                <div>
                  <div className="detail-label">Aspiration</div>
                  <div className="detail-value">
                    {dateData.aspiration?.name || "N/A"}
                  </div>
                </div>
              </div>

              <div className="date-detail-item">
                <span className="detail-emoji">⏰</span>
                <div>
                  <div className="detail-label">Duration</div>
                  <div className="detail-value">
                    {dateData.duration || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="date-detail-item">
                <span className="detail-emoji">📍</span>
                <div>
                  <div className="detail-label">Location</div>
                  <div className="detail-value">
                    {formatDisplayText(dateData.location) || "Not specified"}
                  </div>
                </div>
              </div>

              {dateData.description && (
                <div className="date-detail-item full-width">
                  <div className="detail-label">Description</div>
                  <div className="detail-value">{dateData.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="success-tips">
          <h4>What happens next?</h4>
          <ul>
            <li>Your date is now visible to interested gentlemen</li>
            <li>
              When someone sends Super Interested, you'll receive a notification
            </li>
            <li>You can chat and arrange the perfect date together</li>
            <li>
              Pro tip: Multiple dates at different prices get 3-5x more offers!
            </li>
          </ul>
        </div>

        <div className="success-actions">
          <button className="btn-primary" onClick={handleViewDates}>
            View Your Dates
          </button>
          <button className="btn-secondary" onClick={handleCreateAnother}>
            Create Another Date
          </button>
        </div>
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
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon-wrapper {
          margin-bottom: 24px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          color: #4ade80;
        }

        .success-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #FFFFFF;
          text-align: center;
          margin: 0 0 12px 0;
        }

        .success-subtitle {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          color: #CCCCCC;
          text-align: center;
          margin: 0 0 40px 0;
        }

        .success-date-card {
          background: #1A1A1A;
          border: 1px solid #333333;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          width: 100%;
          max-width: 500px;
        }

        .date-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .date-card-header h3 {
          margin: 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #FFFFFF;
        }

        .price-badge {
          padding: 8px 16px;
          background: #3a3a3a;
          color: #4ade80;
          border-radius: 20px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 700;
        }

        .date-card-body {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .date-detail-item {
          display: flex;
          gap: 12px;
        }

        .date-detail-item.full-width {
          grid-column: 1 / -1;
          flex-direction: column;
          gap: 8px;
        }

        .detail-emoji {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .detail-label {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 12px;
          color: #888888;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          color: #FFFFFF;
          line-height: 1.4;
        }

        .success-tips {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          width: 100%;
          max-width: 500px;
        }

        .success-tips h4 {
          margin: 0 0 12px 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #4ade80;
        }

        .success-tips ul {
          margin: 0;
          padding-left: 20px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          color: #CCCCCC;
          line-height: 1.8;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 500px;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
          padding: 14px 32px;
          border-radius: 8px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #FFFFFF;
          color: #000000;
          border: none;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          border-color: #FFFFFF;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #CCCCCC;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }

        @media (min-width: 768px) {
          .create-date-content {
            padding: 40px 32px;
          }

          .success-icon {
            width: 100px;
            height: 100px;
          }

          .success-title {
            font-size: 32px;
          }

          .success-subtitle {
            font-size: 18px;
          }

          .success-date-card {
            padding: 32px;
          }
        }
      `}</style>
    </div>
  );
}

export default CreateSuccess;
