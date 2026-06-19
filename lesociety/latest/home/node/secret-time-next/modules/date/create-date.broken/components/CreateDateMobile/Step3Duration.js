import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { DURATION_OPTIONS } from "../../constants/dateOptions";
import { useCreateDate } from "../../context/CreateDateContext";
import { useDateValidation } from "../../hooks/useDateValidation";
import { useCreateDateFlow } from "../../hooks/useCreateDateFlow";
import CreateDateHeader from "@/core/CreateDateHeader";
import ConfirmDate from "../../../confirmDate";
import { toast } from "react-toastify";

/**
 * Mobile Step 3: Duration Selection
 * Full-width cards with large touch targets
 */
const Step3DurationMobile = () => {
  const { formData, nextStep, prevStep, updateFormData } = useCreateDate();
  const { validateDuration } = useDateValidation();
  const { saveDraft } = useCreateDateFlow(useCreateDate());

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = () => setConfirmPopup(!confirmPopup);

  const selectedDuration = formData.date_duration;

  /**
   * Handle duration selection
   */
  const handleSelectDuration = (duration) => {
    updateFormData("date_duration", duration.value);
  };

  /**
   * Handle next button click
   */
  const handleNext = async () => {
    const error = validateDuration(formData.date_duration);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      await saveDraft();
      setIsSaving(false);
      nextStep();
    } catch (err) {
      setIsSaving(false);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell create-date-mobile">
          <CreateDateHeader
            activeStep={3}
            onBack={prevStep}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>How long do you want this date to last?</h2>
                <div className="intro-subtitle">
                  Be upfront — great dates start with perfect timing.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender">
              <div className="inner_container mobile-duration-container">
                <div className="duration-options-grid mobile-duration-grid">
                  {DURATION_OPTIONS.map((option) => {
                    const isSelected = selectedDuration === option.value;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        className={`duration-card mobile-duration-card ${
                          isSelected ? "is-selected" : ""
                        }`}
                        onClick={() => handleSelectDuration(option)}
                      >
                        <div className="duration-card-label">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="duration-card-desc">
                            {option.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bottom-mobile register-bottom">
                <div className="secret-input type-submit next-prev">
                  <button
                    type="button"
                    className="next"
                    onClick={handleNext}
                    disabled={!selectedDuration || isSaving}
                  >
                    {isSaving ? (
                      <span className="spin-loader-button"></span>
                    ) : (
                      <>
                        Next <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </>
  );
};

export default Step3DurationMobile;
