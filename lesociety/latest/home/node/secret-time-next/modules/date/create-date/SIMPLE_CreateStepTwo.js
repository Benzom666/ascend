import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { initialize } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import { apiRequest } from "utils/Utilities";
import { toast } from "react-toastify";
import { useCreateDateBrowserBack } from "utils/createDateNavigation";
import { markCreateDateProgressFromStep } from "utils/createDateProgress";
import ConfirmDate from "@/modules/date/confirmDate";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import {
  activateCreateDateFlow,
  persistCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { useCreateDateAccessGuard } from "utils/createDateAccessGuard";
import {
  getCreateDateTextModerationError,
  normalizeModeratedText,
} from "utils/createDateTextModeration";

const PRICE_OPTIONS = [80, 100, 150, 200, 300, 400, 500, 750, 1000];
const normalizeSuggestionKey = (value = "") =>
  String(value || "").trim().toLowerCase();

const buildSuggestion = ({ label, type, categoryId = "", aspirationId = "" }) => ({
  label: String(label || "").trim(),
  type,
  categoryId,
  aspirationId,
});

function CreateStepTwo() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.authReducer?.user);

  const [aspirationInput, setAspirationInput] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [inputTouched, setInputTouched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const isSubmittingRef = useRef(false);
  const inputWrapRef = useRef(null);
  const { isLimitBlocked } = useCreateDateAccessGuard({
    router,
    token: user?.token,
    userName: user?.user_name,
    enabled: !router?.query?.new_edit && !router?.query?.edit,
  });

  useCreateDateBrowserBack(router);

  const persistResumePath = (path = router.asPath) => {
    persistCreateDateResumePath(path);
  };

  const toggleConfirm = () => setConfirmPopup((prev) => !prev);

  const handleClosePage = () => {
    persistResumePath();
    router.push("/user/user-list");
  };

  const normalizedAspirationInput = normalizeModeratedText(aspirationInput);
  const aspirationModerationError = getCreateDateTextModerationError(
    normalizedAspirationInput
  );
  const filteredSuggestions = suggestions
    .filter((suggestion) => {
      if (!normalizedAspirationInput) {
        return true;
      }

      return suggestion.label
        .toLowerCase()
        .includes(normalizedAspirationInput.toLowerCase());
    });
  const shouldShowSuggestions =
    isSuggestionOpen &&
    normalizedAspirationInput.length > 0 &&
    filteredSuggestions.length > 0 &&
    !isNavigating;

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
    if (!router.isReady) return;
    if (!router?.query?.new_edit) return;

    router.replace("/create-date/description?new_edit=true");
  }, [router, router.isReady, router?.query?.new_edit]);

  useEffect(() => {
    const saved = readCreateDateFlow() || {};
    const initialAspiration =
      saved?.selectedAspirationName ||
      saved?.selectedAspiration ||
      user?.aspirationName ||
      "";
    const initialPrice = saved?.selectedPrice || null;

    if (initialAspiration) {
      setAspirationInput(initialAspiration);
    }
    if (initialPrice) {
      setSelectedPrice(initialPrice);
    }
  }, [user?.aspirationName]);

  useEffect(() => {
    let isActive = true;

    const addUniqueSuggestion = (suggestionMap, suggestion) => {
      if (!suggestion?.label) return;
      const key = normalizeSuggestionKey(suggestion.label);
      if (!key || suggestionMap.has(key)) return;
      suggestionMap.set(key, suggestion);
    };

    const loadSuggestions = async () => {
      try {
        const categoryResponse = await apiRequest({
          method: "GET",
          url: "categories",
          token: user?.token,
        });
        const categoryList = Array.isArray(categoryResponse?.data?.data)
          ? categoryResponse.data.data
          : [];
        const suggestionMap = new Map();

        categoryList.forEach((category) => {
          addUniqueSuggestion(
            suggestionMap,
            buildSuggestion({
              label: category?.name,
              type: "Category",
              categoryId: category?._id,
            })
          );
        });

        const aspirationResponses = await Promise.allSettled(
          categoryList
            .filter((category) => category?._id)
            .map((category) =>
              apiRequest({
                method: "GET",
                url: `aspirations?category_id=${category._id}`,
                token: user?.token,
              }).then((response) => ({
                categoryId: category._id,
                aspirations: Array.isArray(response?.data?.data)
                  ? response.data.data
                  : [],
              }))
            )
        );

        aspirationResponses.forEach((result) => {
          if (result.status !== "fulfilled") return;

          result.value.aspirations.forEach((aspiration) => {
            addUniqueSuggestion(
              suggestionMap,
              buildSuggestion({
                label: aspiration?.name,
                type: "Aspiration",
                categoryId: result.value.categoryId,
                aspirationId: aspiration?._id,
              })
            );
          });
        });

        if (isActive) {
          setSuggestions(
            Array.from(suggestionMap.values()).sort((left, right) =>
              left.label.localeCompare(right.label)
            )
          );
        }
      } catch (error) {
        console.log("[CreateStepTwo] Failed to load aspiration suggestions", error?.message);
      }
    };

    loadSuggestions();

    return () => {
      isActive = false;
    };
  }, [user?.token]);

  useEffect(() => {
    router.prefetch("/create-date/duration");
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    persistResumePath();
  }, [router.isReady]);

  useEffect(() => {
    writeCreateDateFlow({
      flowMode: router?.query?.new_edit
        ? "edit-existing"
        : router?.query?.edit
        ? "draft-edit"
        : "create",
      editMode: Boolean(router?.query?.new_edit),
      selectedCategory: normalizedAspirationInput,
      selectedAspiration: normalizedAspirationInput,
      selectedCategoryName: normalizedAspirationInput,
      selectedAspirationName: normalizedAspirationInput,
      selectedPrice,
    });
  }, [
    normalizedAspirationInput,
    router?.query?.edit,
    router?.query?.new_edit,
    selectedPrice,
  ]);

  useEffect(() => {
    if (!isSuggestionOpen || typeof document === "undefined") {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!inputWrapRef.current?.contains(event.target)) {
        setIsSuggestionOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isSuggestionOpen]);

  const handleAspirationInputChange = (event) => {
    setAspirationInput(event.target.value);
    setIsSuggestionOpen(true);
    if (inputTouched) {
      setInputTouched(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setAspirationInput(suggestion.label);
    setInputTouched(false);
    setIsSuggestionOpen(false);
    writeCreateDateFlow({
      selectedCategory: suggestion.categoryId || suggestion.label,
      selectedAspiration: suggestion.aspirationId || suggestion.label,
      selectedCategoryName: suggestion.label,
      selectedAspirationName: suggestion.label,
    });
  };

  const handleNext = async () => {
    if (isSubmittingRef.current || isNavigating) {
      return;
    }

    setInputTouched(true);

    if (!normalizedAspirationInput) {
      toast.error("Please enter your aspiration");
      return;
    }
    if (aspirationModerationError) {
      toast.error(aspirationModerationError);
      return;
    }
    if (!selectedPrice) {
      toast.error("Please select a price");
      return;
    }

    isSubmittingRef.current = true;
    setIsNavigating(true);

    try {
      await apiRequest({
        data: {
          categatoryName: normalizedAspirationInput,
          aspirationName: normalizedAspirationInput,
        },
        method: "POST",
        url: "user/save-aspiration",
        token: user?.token,
      });

      if (user?.user_name) {
        try {
          const res = await apiRequest({
            method: "GET",
            url: `user/user-by-name?user_name=${user?.user_name}`,
            token: user?.token,
          });
          dispatch({
            type: "AUTHENTICATE_UPDATE",
            payload: { ...res.data?.data?.user },
          });
        } catch (refreshError) {
          console.error("Failed to refresh user after aspiration save:", refreshError);
        }
      }
    } catch (err) {
      isSubmittingRef.current = false;
      setIsNavigating(false);
      toast.error(
        err?.response?.data?.message ||
          "Failed to save aspiration. Please try again."
      );
      return;
    }

    writeCreateDateFlow({
      selectedCategory: normalizedAspirationInput,
      selectedAspiration: normalizedAspirationInput,
      selectedPrice,
      selectedCategoryName: normalizedAspirationInput,
      selectedAspirationName: normalizedAspirationInput,
    });

    dispatch(
      initialize("CreateStepTwo", {
        education: selectedPrice,
        enter__category: normalizedAspirationInput,
        enter__aspiration: normalizedAspirationInput,
      })
    );

    markCreateDateProgressFromStep(2);

    try {
      await router.push(
        router?.query?.new_edit
          ? "/create-date/duration?new_edit=true"
          : router?.query?.edit
          ? "/create-date/duration?edit=true"
          : "/create-date/duration"
      );
    } catch (error) {
      isSubmittingRef.current = false;
      setIsNavigating(false);
    }
  };

  if (isLimitBlocked) {
    return (
      <MaxDatesReachedPopup
        isOpen={true}
        onClose={() => router.push("/user/user-list")}
      />
    );
  }

  const canContinue =
    Boolean(normalizedAspirationInput) &&
    !aspirationModerationError &&
    Boolean(selectedPrice) &&
    !isNavigating;

  return (
    <>
      <div className="create-date-page">
        <CreateDateNewHeader
          activeStep={2}
          onBack={() => {
            markCreateDateProgressFromStep(2);
            router.push(
              router?.query?.new_edit
                ? "/create-date/choose-date-type?new_edit=true"
                : router?.query?.edit
                ? "/create-date/choose-date-type?edit=true"
                : "/create-date/choose-date-type"
            );
          }}
          onClose={toggleConfirm}
        />

        <div className="create-date-content">
          <h1 className="page-title">Your aspiration. Your price.</h1>
          <p className="page-subtitle">
            When a man chooses <strong>Super Interested</strong>, he&apos;s
            saying: I&apos;ll cover the outing and financially support your
            aspiration to skip straight to our first date - Fast.
          </p>

          <div className="two-column-layout">
            <div className="left-column">
              <div className="form-section">
                <label className="section-label">
                  1. Who do you aspire to be?
                </label>
                <label className="section-sublabel">
                  Type any aspiration or category in your own words.
                </label>

                <div className="aspiration-input-wrap" ref={inputWrapRef}>
                  <input
                    type="text"
                    value={aspirationInput}
                    onChange={handleAspirationInputChange}
                    onFocus={() => {
                      if (normalizedAspirationInput) {
                        setIsSuggestionOpen(true);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setIsSuggestionOpen(false);
                      }
                    }}
                    placeholder="Enter an aspiration or category"
                    className={`custom-input ${
                      inputTouched &&
                      (!normalizedAspirationInput || aspirationModerationError)
                        ? "custom-input-error"
                        : ""
                    }`}
                    autoComplete="off"
                  />
                  {shouldShowSuggestions && (
                    <div className="aspiration-suggestions" role="listbox">
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={`${suggestion.type}-${suggestion.label}`}
                          className="aspiration-suggestion-item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          role="option"
                        >
                          <span className="suggestion-label">
                            {suggestion.label}
                          </span>
                          <span className="suggestion-type">
                            {suggestion.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {inputTouched && !normalizedAspirationInput && (
                  <p className="field-error">Please enter your aspiration.</p>
                )}
                {aspirationModerationError && (
                  <p className="field-error">{aspirationModerationError}</p>
                )}
              </div>
            </div>

            <div className="right-column">
              <div className="form-section">
                <label className="section-label">
                  2. Set your suggested financial gift
                </label>
                <p className="section-description">
                  He hands you the gift in person on the date to help support
                  your goals. Showing his commitment.
                </p>
                <div className="price-grid">
                  {PRICE_OPTIONS.map((price) => {
                    const isSelected = selectedPrice === price;
                    return (
                      <button
                        type="button"
                        key={price}
                        className={`price-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedPrice(price)}
                      >
                        ${price}
                      </button>
                    );
                  })}
                </div>
                <p className="pro-tip">
                  Pro tip: Women who post multiple dates at different price
                  points get 3-5x more Super Interested offers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-button-container">
          <button
            className={`next-button ${!canContinue ? "disabled" : ""}`}
            onClick={handleNext}
            disabled={!canContinue}
            aria-busy={isNavigating}
          >
            <span
              className={`button-label ${
                isNavigating ? "button-label-hidden" : ""
              }`}
            >
              NEXT
            </span>
            {isNavigating && (
              <span className="button-spinner">
                <span className="spin-loader-button"></span>
              </span>
            )}
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
          }

          .create-date-content {
            flex: 1;
            min-height: 0;
            padding: 24px 16px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
          }

          @media (min-width: 768px) {
            .create-date-content {
              padding: 40px 32px;
              padding-bottom: 140px;
            }

            .page-title {
              font-size: 28px;
              margin-bottom: 16px;
            }

            .page-subtitle {
              font-size: 14px;
              margin-bottom: 48px;
            }

            .section-label {
              font-size: 18px;
            }

            .price-card {
              padding: 20px 16px;
              font-size: 18px;
            }
          }

          .page-title {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.15;
            color: #ffffff;
            text-align: center;
            text-wrap: balance;
            max-width: 36ch;
            margin: 0 auto 12px;
          }

          .page-subtitle {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 13px;
            font-weight: 400;
            color: #cccccc;
            text-align: center;
            margin: 0 auto 32px;
            max-width: 500px;
            line-height: 1.5;
          }

          .page-subtitle strong {
            color: #ffffff;
            font-weight: 600;
          }

          .two-column-layout {
            display: flex;
            flex-direction: column;
            gap: 32px;
            max-width: 900px;
            margin: 0 auto;
          }

          .left-column,
          .right-column {
            flex: 1;
            min-width: 0;
          }

          .form-section {
            background: transparent;
            border: none;
            padding: 0;
          }

          .section-label {
            display: block;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 6px;
          }

          .section-sublabel {
            display: block;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            margin-bottom: 16px;
          }

          .section-description {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 14px;
            font-weight: 400;
            color: #cccccc;
            line-height: 1.5;
            margin: 0 0 16px 0;
          }

          .aspiration-input-wrap {
            position: relative;
          }

          .custom-input {
            width: 100%;
            padding: 14px 16px;
            font-size: 16px;
            background: #000000;
            color: #ffffff;
            border: 1px solid #333333;
            border-radius: 8px;
            margin-bottom: 12px;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
          }

          .custom-input:focus {
            outline: none;
            border-color: #f24462;
          }

          .custom-input-error {
            border-color: #f24462;
          }

          .aspiration-suggestions {
            position: absolute;
            top: calc(100% - 8px);
            left: 0;
            right: 0;
            z-index: 120;
            max-height: 252px;
            overflow-y: auto;
            background: #050505;
            border: 1px solid #2a2a2a;
            border-radius: 10px;
            box-shadow: 0 18px 34px rgba(0, 0, 0, 0.48);
            padding: 6px;
          }

          .aspiration-suggestion-item {
            width: 100%;
            min-height: 40px;
            padding: 9px 10px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            cursor: pointer;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            text-align: left;
          }

          .aspiration-suggestion-item:hover,
          .aspiration-suggestion-item:focus {
            outline: none;
            background: rgba(242, 68, 98, 0.16);
          }

          .suggestion-label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
            font-weight: 500;
          }

          .suggestion-type {
            flex: 0 0 auto;
            color: #8d8d8d;
            font-size: 11px;
            font-weight: 500;
          }

          .field-error {
            margin: 2px 0 0;
            font-size: 12px;
            line-height: 1.4;
            color: #f67d94;
          }

          .price-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }

          .price-card {
            background: transparent;
            border: 1px solid #333333;
            border-radius: 10px;
            padding: 18px 12px;
            color: #ffffff;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .price-card:hover {
            border-color: #f24462;
            transform: translateY(-2px);
          }

          .price-card.selected {
            background: #f24462;
            border: 2px solid #f24462;
            color: #ffffff;
          }

          .pro-tip {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 1.5;
            margin: 16px 0 0 0;
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
            align-items: center;
            z-index: 100;
          }

          .next-button {
            width: 100%;
            max-width: 420px;
            height: 52px;
            background: #f24462;
            border: 1px solid #f24462;
            border-radius: 12px;
            color: #ffffff;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
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

          .next-button:hover:not(.disabled) {
            background: #e2466b;
          }

          .next-button.disabled {
            background: #1a1a1a;
            border-color: #1a1a1a;
            color: #666666;
            cursor: not-allowed;
          }

          .next-button :global(.spin-loader-button) {
            margin: 0;
          }

          @media (min-width: 768px) {
            .two-column-layout {
              flex-direction: row;
              align-items: flex-start;
              gap: 48px;
            }

            .bottom-button-container {
              padding: 24px 32px;
            }

            .next-button {
              height: 56px;
              font-size: 18px;
              max-width: 400px;
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

export default CreateStepTwo;
