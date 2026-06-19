import React from "react";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";

const steps = [
  "Location",
  "Experience",
  "Earnings",
  "Duration",
  "Description",
  "Preview",
];

const CreateDateHeader = ({
  activeStep = 0,
  title = "CREATE NEW DATE",
  onBack,
  onClose,
  showBack = true,
  showClose = true,
}) => {
  const progressPercent =
    steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="create-date-header-wrap">
      <div className="create-date-header">
        <button
          type="button"
          className="cdh-btn cdh-back"
          onClick={onBack}
          aria-label="Back"
          disabled={!showBack}
        >
          {showBack && <IoIosArrowBack size={22} />}
        </button>
        <div className="cdh-title">{title}</div>
        <button
          type="button"
          className="cdh-btn cdh-close"
          onClick={onClose}
          aria-label="Close"
          disabled={!showClose}
        >
          {showClose && <IoIosClose size={26} />}
        </button>
      </div>
      <div className="create-date-progress">
        <div className="create-date-progress-track">
          <div
            className="create-date-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="create-date-progress-steps">
          {steps.map((step, index) => (
            <span
              key={step}
              className={
                index === activeStep
                  ? "create-date-step active"
                  : "create-date-step"
              }
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateDateHeader;
