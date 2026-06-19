import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/router";
import Image from "next/image";
import { EXPERIENCE_GROUPS } from "../../constants/dateOptions";
import { useCreateDate } from "../../context/CreateDateContext";
import { useDateValidation } from "../../hooks/useDateValidation";
import { useCreateDateFlow } from "../../hooks/useCreateDateFlow";
import CreateDateHeader from "@/core/CreateDateHeader";
import ConfirmDate from "../../../confirmDate";
import { toast } from "react-toastify";

/**
 * Desktop Step 1: Experience Selection
 * Grid layout with hover effects and better use of screen width
 */
const Step1ExperienceDesktop = () => {
  const router = useRouter();
  const { formData, nextStep, prevStep, updateFormData } = useCreateDate();
  const { validateExperience } = useDateValidation();
  const { saveDraft } = useCreateDateFlow(useCreateDate());

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = () => setConfirmPopup(!confirmPopup);

  const selectedExperienceId = formData.search_type?.id;

  /**
   * Handle experience selection
   */
  const handleSelectExperience = (experience) => {
    updateFormData("search_type", experience);
  };

  /**
   * Handle next button click
   */
  const handleNext = async () => {
    const error = validateExperience(formData.search_type);
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

  /**
   * Handle back button
   */
  const handleBack = () => {
    router.push("/create-date/choose-city");
  };

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell create-date-desktop">
          <CreateDateHeader
            activeStep={1}
            onBack={handleBack}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>What kind of outing do you want him to take you on?</h2>
                <div className="intro-subtitle">
                  When a man chooses Interested, he's saying: I'll take you on
                  the date you create here and cover everything.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender step-1 experience-section">
              <div className="inner_container desktop-experience-container">
                {EXPERIENCE_GROUPS.map((group, groupIndex) => (
                  <div className="experience-group" key={groupIndex}>
                    {group.title && (
                      <div className="experience-group-title">
                        {group.title}
                      </div>
                    )}
                    <div
                      className={`experience-grid desktop-experience-grid ${
                        group.options.length === 1 ? "single" : ""
                      }`}
                    >
                      {group.options.map((option) => {
                        const isSelected = selectedExperienceId === option.id;
                        return (
                          <button
                            type="button"
                            key={option.id}
                            className={`experience-card desktop-experience-card ${
                              isSelected ? "is-selected" : ""
                            }`}
                            onClick={() => handleSelectExperience(option)}
                          >
                            <span className="experience-badge">
                              {option.badge}
                            </span>
                            <span className="experience-card-image">
                              <Image
                                src={option.image}
                                alt={option.label}
                                fill
                                sizes="(max-width: 600px) 50vw, 200px"
                                style={{ objectFit: "cover" }}
                              />
                            </span>
                            <span className="experience-card-content">
                              <div className="experience-card-title">
                                {option.label}
                              </div>
                              <div className="experience-card-desc">
                                {option.description}
                              </div>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="desktop-navigation">
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNext}
                  disabled={!selectedExperienceId || isSaving}
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
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </>
  );
};

export default Step1ExperienceDesktop;
