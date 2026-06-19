import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCreateDate } from "../../context/CreateDateContext";
import { useCreateDateFlow } from "../../hooks/useCreateDateFlow";
import CreateDateHeader from "@/core/CreateDateHeader";
import UserCardDetail from "@/core/UserCardDetail";
import SkeletonDatesPreview from "../../../../skeleton/Dates/SkeletonDatesPreview";
import ConfirmDate from "../../../confirmDate";
import { toast } from "react-toastify";

/**
 * Mobile Step 5: Preview
 * Shows the date card preview with option to swap image and post
 */
const Step5PreviewMobile = () => {
  const router = useRouter();
  const {
    formData,
    cityState,
    user,
    isEditMode,
    prevStep,
    updateFormData,
    setEligibleImagesList,
  } = useCreateDate();
  const { publishDate, updateImageIndex, fetchEligibleImages } =
    useCreateDateFlow(useCreateDate());

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [eligibleImages, setEligibleImagesLocal] = useState([]);

  const toggle = () => setConfirmPopup(!confirmPopup);

  /**
   * Load eligible images on mount
   */
  useEffect(() => {
    const loadImages = async () => {
      setTimeout(() => {
        if (user?.images?.length > 0 && user?.images[0]) {
          setPageLoading(false);
        }
      }, 2000);

      const images = await fetchEligibleImages();
      setEligibleImagesLocal(images);
      setEligibleImagesList(images);
    };

    loadImages();
  }, [user]);

  /**
   * Get current image URL
   */
  const getCurrentImage = () => {
    const currentIndex =
      typeof formData.image_index === "number"
        ? formData.image_index
        : eligibleImages[0]?.idx || 0;
    return (
      eligibleImages.find((img) => img.idx === currentIndex)?.url ||
      user?.images?.[0] ||
      ""
    );
  };

  /**
   * Handle swap image
   */
  const handleSwapImage = async () => {
    if (eligibleImages.length < 2) {
      toast.error("No more images available to swap");
      return;
    }

    const currentIndex =
      typeof formData.image_index === "number"
        ? formData.image_index
        : eligibleImages[0]?.idx || 0;

    const currentPos = eligibleImages.findIndex(
      (img) => img.idx === currentIndex
    );

    const nextPos =
      currentPos === -1 ? 0 : (currentPos + 1) % eligibleImages.length;
    const next = eligibleImages[nextPos];

    if (next) {
      updateFormData("image_index", next.idx);

      // Update on server if date exists
      if (formData.dateId) {
        await updateImageIndex(next.idx);
      }
    }
  };

  /**
   * Handle post date
   */
  const handlePostDate = async () => {
    setIsPosting(true);
    const success = await publishDate();
    if (!success) {
      setIsPosting(false);
    }
  };

  /**
   * Handle edit (go back to step 1)
   */
  const handleEdit = () => {
    router.push("/create-date/choose-city?edit=true");
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    if (router.asPath.includes("drafted")) {
      router.push("/user/user-list");
    } else if (router.query?.new_edit) {
      router.push("/user/user-profile");
    } else {
      prevStep();
    }
  };

  if (pageLoading) {
    return <SkeletonDatesPreview />;
  }

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell create-date-mobile">
          <CreateDateHeader
            activeStep={5}
            onBack={handleBack}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>You're almost done!</h2>
                <div className="intro-subtitle">
                  Take a moment to review your date.
                </div>
                <div className="intro-note">
                  Your description can only be edited. Everything else is
                  locked.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender date-preview-card">
              <div className="inner_container mobile-preview-container">
                <UserCardDetail
                  user={user}
                  cityState={cityState}
                  dateSuggestion={formData}
                  timeState={{ date_duration: formData.date_duration }}
                  priceState={{ education: formData.education }}
                  dateDescription={{
                    date_description: formData.date_description,
                  }}
                  imageSrc={getCurrentImage()}
                  showSwap={eligibleImages.length >= 2}
                  onSwap={handleSwapImage}
                />
              </div>
              <div className="bottom-mobile register-bottom">
                <div className="secret-input type-submit next-prev mobile-preview-buttons">
                  {!router?.query?.new_edit && (
                    <button
                      type="button"
                      className="edit"
                      onClick={handleEdit}
                    >
                      <Link href="/create-date/choose-city?edit=true">
                        <a>Edit</a>
                      </Link>
                    </button>
                  )}
                  <button
                    type="button"
                    className="next"
                    onClick={handlePostDate}
                    disabled={isPosting}
                  >
                    {isPosting ? (
                      <span className="spin-loader-button"></span>
                    ) : (
                      <a className="forgot-passwrd">
                        {router?.query?.new_edit ? "Update Date" : "Post Date"}
                      </a>
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

export default Step5PreviewMobile;
