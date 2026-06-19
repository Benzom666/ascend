import React, { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { VALIDATION_RULES } from "../../constants/dateOptions";
import { useCreateDate } from "../../context/CreateDateContext";
import { useDateValidation } from "../../hooks/useDateValidation";
import { useCreateDateFlow } from "../../hooks/useCreateDateFlow";
import CreateDateHeader from "@/core/CreateDateHeader";
import CreatedatesWarningPopUp from "../../../CreatedatesWarningPopUp";
import ConfirmDate from "../../../confirmDate";
import { toast } from "react-toastify";

/**
 * Desktop Step 4: Description
 * Centered form with proper max-width
 */
const Step4DescriptionDesktop = () => {
  const { formData, nextStep, prevStep, updateFormData } = useCreateDate();
  const { validateDescription, getDescriptionStatus } = useDateValidation();
  const { saveDraft } = useCreateDateFlow(useCreateDate());

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState(formData.date_description || "");

  const toggle = () => setConfirmPopup(!confirmPopup);
  const toggleWarning = () => setWarningModal(!warningModal);

  const status = getDescriptionStatus(description);

  /**
   * Handle description change
   */
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    updateFormData("date_description", value);
  };

  /**
   * Handle next button click with validation
   */
  const handleNext = () => {
    const error = validateDescription(description);
    if (error) {
      // Show warning if description is too short
      if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
        toggleWarning();
      } else {
        toast.error(error);
      }
      return;
    }

    // Save and proceed
    setIsSaving(true);
    saveDraft()
      .then(() => {
        setIsSaving(false);
        nextStep();
      })
      .catch((err) => {
        setIsSaving(false);
        toast.error("Failed to save progress. Please try again.");
      });
  };

  /**
   * Continue after seeing warning
   */
  const handleContinueAfterWarning = () => {
    toggleWarning();
    setIsSaving(true);
    saveDraft()
      .then(() => {
        setIsSaving(false);
        nextStep();
      })
      .catch((err) => {
        setIsSaving(false);
        toast.error("Failed to save progress. Please try again.");
      });
  };

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell create-date-desktop">
          <CreateDateHeader
            activeStep={4}
            onBack={prevStep}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>Make him want this date.</h2>
                <div className="intro-subtitle">
                  Tell him why this night with you is unforgettable. Your
                  vibe, your energy, what he can expect.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender">
              <div className="inner_container desktop-description-container">
                <div className="description-input-wrapper">
                  <textarea
                    className="description-textarea desktop-description-textarea"
                    placeholder="I love deep conversations over great wine... I'm playful, classy, and always up for an adventure."
                    value={description}
                    onChange={handleDescriptionChange}
                    maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
                    rows={12}
                  />
                  <div className="character-counter desktop-character-counter">
                    <span className={status.isTooShort ? "text-warning" : ""}>
                      {status.current} / {status.max} characters
                    </span>
                    {!status.isValid && status.current > 0 && (
                      <span className="validation-hint">
                        {status.isTooShort &&
                          ` (min ${status.min} characters required)`}
                        {status.isTooLong && " (too long)"}
                      </span>
                    )}
                  </div>
                </div>

                {status.isTooShort && description.length > 0 && (
                  <div className="description-warning-hint desktop-warning-hint">
                    Please write at least{" "}
                    {VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters to help
                    him understand your ideal date.
                  </div>
                )}
              </div>

              <div className="desktop-navigation desktop-description-buttons">
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNext}
                  disabled={isSaving}
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
      ) : null}

      {warningModal && (
        <CreatedatesWarningPopUp
          setHideModal={setWarningModal}
          hideModal={warningModal}
          onContinue={handleContinueAfterWarning}
        />
      )}

      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </>
  );
};

export default Step4DescriptionDesktop;
