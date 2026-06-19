import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { initialize } from "redux-form";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import DateWarningModal from "@/modules/date/DateWarningModal";
import ConfirmDate from "@/modules/date/confirmDate";
import { toast } from "react-toastify";
import { useCreateDateBrowserBack } from "utils/createDateNavigation";
import {
  markCreateDateProgressFromStep,
} from "utils/createDateProgress";
import {
  activateCreateDateFlow,
  persistCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { prefetchReviewImage } from "utils/prefetchReviewImage";

function CreateDescription() {
  const NAVIGATION_TIMEOUT_MS = 15000;
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.authReducer?.user);
  const [description, setDescription] = useState("");
  const [hideModal, setHideModal] = useState(Boolean(user?.date_warning_popup));
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const [hasTouchedDescription, setHasTouchedDescription] = useState(false);
  // REMOVED: useCreateDateAccessGuard - limit check moved to Create Date button
  // This was causing unnecessary network calls and button lag
  const textareaRef = useRef(null);
  const isBusy = isNavigating;

  const trimmedDescriptionLength = description.trim().length;
  const shouldShowDescriptionError = hasAttemptedNext || hasTouchedDescription;
  const isDescriptionTooShort =
    shouldShowDescriptionError && trimmedDescriptionLength < 20;
  const isDescriptionTooLong =
    shouldShowDescriptionError && description.length > 500;
  const hasDescriptionError = isDescriptionTooShort || isDescriptionTooLong;
  const isDescriptionValid =
    trimmedDescriptionLength >= 20 && description.length <= 500;
  const isNextDisabled = !isDescriptionValid || isBusy;
  const descriptionValidationMessage = isDescriptionTooLong
    ? "Maximum 500 characters."
    : isDescriptionTooShort
    ? shouldShowDescriptionError && trimmedDescriptionLength === 0
      ? ""
      : "Minimum 20 characters."
    : "";
  useCreateDateBrowserBack(router);
  const persistResumePath = (path = router.asPath) => {
    persistCreateDateResumePath(path);
  };
  const toggleConfirm = () => setConfirmPopup((prev) => !prev);
  const handleClosePage = () => {
    persistResumePath();
    router.push("/user/user-list");
  };

  useEffect(() => {
    if (!router.isReady) return;
    const nextFlowMode = router?.query?.new_edit
      ? "edit-existing"
      : router?.query?.edit
      ? "draft-edit"
      : "create";
    const existingFlow = readCreateDateFlow();
    activateCreateDateFlow({
      flowMode: nextFlowMode,
      ...(nextFlowMode !== "create" && existingFlow?.dateId
        ? { dateId: existingFlow.dateId }
        : {}),
    });
  }, [router.isReady, router?.query?.edit, router?.query?.new_edit]);

  useEffect(() => {
    try {
      const savedData = readCreateDateFlow();
      if (savedData && Object.keys(savedData).length) {
        if (savedData.description) {
          setDescription(savedData.description);
        }
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    router.prefetch("/create-date/review");
  }, [router]);

  // Pre-fetch the data the review page needs (eligible images + image_index)
  // and warm the browser cache for the actual photo URL. By the time the user
  // finishes typing the description and clicks NEXT, the review page can
  // render the correct image on first paint with no network wait.
  useEffect(() => {
    if (!user?.user_name) return;
    prefetchReviewImage({
      user,
      isEditMode: Boolean(router?.query?.new_edit),
    });
  }, [user?.user_name, router?.query?.new_edit]);

  useEffect(() => {
    if (!router.isReady) return;
    persistResumePath();
  }, [router.isReady]);

  useEffect(() => {
    if (user?.date_warning_popup && !hideModal) {
      setHideModal(true);
    }
  }, [user?.date_warning_popup, hideModal]);

  useEffect(() => {
    if (hideModal) {
      setShowAnimation(false);
      setShowWarningPopup(false);
    }
  }, [hideModal]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = showWarningPopup ? "hidden" : "";
    document.documentElement.style.overflow = showWarningPopup ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showWarningPopup]);

  useEffect(() => {
    const handleRouteSettled = () => {
      setIsNavigating(false);
    };

    router.events.on("routeChangeError", handleRouteSettled);
    router.events.on("routeChangeComplete", handleRouteSettled);

    return () => {
      router.events.off("routeChangeError", handleRouteSettled);
      router.events.off("routeChangeComplete", handleRouteSettled);
    };
  }, [router.events]);

  const handleDescriptionChange = (e) => {
    if (showWarningPopup) {
      e.preventDefault();
      return;
    }

    const nextValue = e.target.value;
    setDescription(nextValue);
    if (hasAttemptedNext) {
      setHasAttemptedNext(false);
    }
    writeCreateDateFlow({
      flowMode: router?.query?.new_edit
        ? "edit-existing"
        : router?.query?.edit
        ? "draft-edit"
        : "create",
      editMode: Boolean(router?.query?.new_edit),
      description: nextValue,
    });
  };

  const handleTextareaIntent = () => {
    if (!hideModal) {
      setShowWarningPopup(true);
      setShowAnimation(true);
      window.requestAnimationFrame(() => {
        textareaRef.current?.blur();
      });
    }

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }

    setHasTouchedDescription(true);
  };

  const handleNext = async () => {
    if (isBusy) return;
    setHasAttemptedNext(true);

    if (!description.trim()) {
      textareaRef.current?.focus();
      return;
    }

    if (description.trim().length < 20) {
      textareaRef.current?.focus();
      return;
    }

    if (description.length > 500) {
      textareaRef.current?.focus();
      return;
    }

    const parsedData = readCreateDateFlow();
    const isDraftEditFlow =
      !router?.query?.new_edit &&
      (Boolean(router?.query?.edit) ||
        parsedData?.flowMode === "draft-edit" ||
        Boolean(parsedData?.dateId));

    writeCreateDateFlow({
      ...parsedData,
      flowMode: router?.query?.new_edit
        ? "edit-existing"
        : isDraftEditFlow
        ? "draft-edit"
        : "create",
      editMode: Boolean(router?.query?.new_edit),
      description,
    });

    dispatch(
      initialize("CreateStepFour", {
        date_description: description,
      })
    );

    markCreateDateProgressFromStep(4);
    setIsNavigating(true);

    try {
      const nextRoute =
        router?.query?.new_edit
          ? "/create-date/review?new_edit=true"
          : router?.query?.edit
          ? "/create-date/review?edit=true"
          : "/create-date/review";
      const didNavigate = await Promise.race([
        router.push(nextRoute),
        new Promise((resolve) => {
          window.setTimeout(() => resolve(false), NAVIGATION_TIMEOUT_MS);
        }),
      ]);
      if (!didNavigate) {
        setIsNavigating(false);
        toast.error("Could not open the preview page. Please try again.");
      }
    } catch (error) {
      setIsNavigating(false);
    }
  };

  // REMOVED: limit check removed

  // Removed unnecessary loader - limit check shouldn't block page rendering during flow navigation

  return (
    <>
    <div className="create-date-page" style={{ backgroundColor: '#000' }}>
      {showWarningPopup && (
        <DateWarningModal
          setHideModal={setHideModal}
          showAnimation={showAnimation}
        />
      )}
      <CreateDateNewHeader
        activeStep={4}
        onBack={() => {
          markCreateDateProgressFromStep(4);
          if (router?.query?.new_edit) {
            router.push("/user/user-profile");
            return;
          }
          router.push(
            router?.query?.new_edit
              ? "/create-date/duration?new_edit=true"
              : router?.query?.edit
              ? "/create-date/duration?edit=true"
              : "/create-date/duration"
          );
        }}
        onClose={toggleConfirm}
      />

      <div className="create-date-content">
        <h1 className="page-title">Make him want this date.</h1>
        <p className="page-subtitle">
          Tell him why this night with you is unforgettable. Your vibe, your
          energy, what he can expect.
        </p>

        <div className="form-section">
          <textarea
            ref={textareaRef}
            value={description}
            onChange={handleDescriptionChange}
            onFocus={handleTextareaIntent}
            onClick={handleTextareaIntent}
            placeholder="I love deep conversations over great wine... I'm playful, classy, and always up for an adventure. Expect laughter, real connection, and a night that feels effortless."
            className={`description-textarea ${hasDescriptionError ? "description-textarea-error" : ""}`}
          />
          <div className="description-meta-row">
            <div
              className={`description-inline-error ${
                descriptionValidationMessage ? "" : "description-inline-error-empty"
              }`}
            >
              {descriptionValidationMessage}
            </div>
            <div className="character-count">
              {description.length}/500 characters
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-button-container">
        <button
          className={`next-button ${isNextDisabled ? "disabled" : ""}`}
          onClick={handleNext}
          disabled={isNextDisabled}
          aria-busy={isBusy}
        >
          <span className={isBusy ? "button-label-hidden" : ""}>NEXT</span>
          {isBusy && <span className="button-spinner"><span className="spin-loader-button"></span></span>}
        </button>
      </div>

      <style jsx>{`
        .create-date-page {
          min-height: 100vh;
          min-height: 100dvh;
          height: 100vh;
          height: 100dvh;
          background: #000000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: fixed;
          inset: 0;
          width: 100%;
        }

        .create-date-content {
          flex: 1;
          min-height: 0;
          padding: 24px 16px calc(120px + env(safe-area-inset-bottom, 0px));
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .page-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.15;
          color: #FFFFFF;
          text-align: center;
          text-wrap: balance;
          max-width: 36ch;
          margin: 0 auto 12px;
        }

        .page-subtitle {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #CCCCCC;
          text-align: center;
          margin: 0 0 32px 0;
        }

        .form-section {
          background: transparent;
          border: none;
          padding: 0;
        }

        .description-textarea {
          width: 100%;
          min-height: 220px;
          padding: 20px;
          font-size: 15px;
          background: transparent;
          color: #FFFFFF;
          border: 1px solid #333333;
          border-radius: 16px;
          resize: vertical;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          line-height: 1.6;
          margin-bottom: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .description-textarea:focus {
          outline: none;
          border-color: #666666;
          box-shadow: none;
        }

        .description-textarea.description-textarea-error,
        .description-textarea.description-textarea-error:focus {
          border-color: #F24462;
          box-shadow: 0 0 20px rgba(242, 68, 98, 0.15);
        }

        .description-textarea::placeholder {
          color: #666666;
        }

        .description-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 18px;
          margin-bottom: 24px;
          width: 100%;
          white-space: nowrap;
        }

        .character-count {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 12px;
          line-height: 18px;
          color: #999999;
          text-align: right;
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .description-inline-error {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 12px;
          line-height: 18px;
          color: #ff5c91;
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .description-inline-error-empty {
          visibility: hidden;
        }

        .bottom-button-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: #000000;
          display: flex;
          justify-content: center;
        }

        .next-button {
          width: 100%;
          max-width: 420px;
          height: 52px;
          background: #F24462;
          border: 1px solid #F24462;
          border-radius: 12px;
          color: #FFFFFF;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
        }

        .next-button:hover:not(.disabled) {
          background: #E2466B;
        }

        .next-button.disabled {
          background: #1A1A1A;
          border-color: #1A1A1A;
          color: #666666;
          cursor: not-allowed;
          box-shadow: none;
        }

        .button-label-hidden {
          visibility: hidden;
        }

        .button-spinner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .next-button :global(.spin-loader-button) {
          margin: 0;
        }
        .arrow-icon {
          font-size: 18px;
        }

        @media (min-width: 768px) {
          .create-date-content {
            padding: 40px 32px;
            max-width: 600px;
            margin: 0 auto;
          }

          .page-title {
            font-size: 36px;
          }

          .page-subtitle {
            font-size: 18px;
            margin-bottom: 40px;
          }

          .form-section {
            padding: 0;
          }

          .bottom-button-container {
            padding: 24px 32px;
          }

          .next-button {
            height: 56px;
            font-size: 18px;
            max-width: 600px;
          }
        }
      `}</style>
    </div>
    <ConfirmDate
      isOpen={confirmPopup}
      toggle={toggleConfirm}
      onClosePage={handleClosePage}
    />
    </>
  );
}

export default CreateDescription;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
