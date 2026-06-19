import React, { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PRICE_OPTIONS } from "../../constants/dateOptions";
import { useCreateDate } from "../../context/CreateDateContext";
import { useDateValidation } from "../../hooks/useDateValidation";
import { useCreateDateFlow } from "../../hooks/useCreateDateFlow";
import CreateDateHeader from "@/core/CreateDateHeader";
import ConfirmDate from "../../../confirmDate";
import { toast } from "react-toastify";

/**
 * Desktop Step 2: Category & Price Selection
 * Split layout with category dropdown on left and price grid on right
 */
const Step2CategoryDesktop = () => {
  const {
    formData,
    user,
    nextStep,
    prevStep,
    updateFormData,
  } = useCreateDate();
  const { validateCategoryAndPrice } = useDateValidation();
  const { fetchCategories, fetchAspirations, saveAspiration, saveDraft } =
    useCreateDateFlow(useCreateDate());

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Category and aspiration state
  const [categories, setCategories] = useState([]);
  const [aspirations, setAspirations] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [aspirationId, setAspirationId] = useState("");

  const toggle = () => setConfirmPopup(!confirmPopup);

  // Check if dropdowns should be disabled (30-day lock)
  const first30DaysDateCreateTime = user?.first30DaysDateCreateTime;
  const disableDropdowns =
    first30DaysDateCreateTime &&
    new Date(first30DaysDateCreateTime).getTime() +
      30 * 24 * 60 * 60 * 1000 -
      new Date().getTime() >
      0;

  /**
   * Fetch categories on mount
   */
  useEffect(() => {
    const loadCategories = async () => {
    const cats = await fetchCategories();
      setCategories(cats);

      // Set initial category if in form data
      if (formData.enter__category) {
        setCategoryId(formData.enter__category);
      }
    };

    loadCategories();

    // Set initial aspiration if in form data
    if (formData.enter__aspiration) {
      setAspirationId(formData.enter__aspiration);
    }
  }, []);

  /**
   * Fetch aspirations when category changes
   */
  useEffect(() => {
    const loadAspirations = async () => {
      if (categoryId) {
        const asps = await fetchAspirations(categoryId);
        setAspirations(asps);

        // Clear aspiration when category changes
        if (!formData.enter__aspiration) {
          setAspirationId("");
        }
      } else {
        setAspirations([]);
        setAspirationId("");
      }
    };

    loadAspirations();
  }, [categoryId]);

  /**
   * Handle category change
   */
  const handleCategoryChange = (value) => {
    setCategoryId(value);
    updateFormData("enter__category", value);
    setAspirations([]);
    setAspirationId("");
    updateFormData("enter__aspiration", "");
  };

  /**
   * Handle aspiration change
   */
  const handleAspirationChange = (value) => {
    setAspirationId(value);
    updateFormData("enter__aspiration", value);
  };

  /**
   * Handle price selection
   */
  const handlePriceSelect = (price) => {
    updateFormData("education", price);
  };

  /**
   * Handle next button click
   */
  const handleNext = async () => {
    // Validate
    const categoryObj = categories.find((c) => c.value === formData.enter__category);
    const aspirationObj = aspirations.find((a) => a.value === formData.enter__aspiration);

    const errors = validateCategoryAndPrice(
      formData.enter__category,
      formData.enter__aspiration,
      formData.education
    );

    if (errors) {
      if (errors.category) toast.error(errors.category);
      if (errors.aspiration) toast.error(errors.aspiration);
      if (errors.price) toast.error(errors.price);
      return;
    }

    setIsSaving(true);
    try {
      // Save aspiration if not locked
      if (!disableDropdowns && categoryObj && aspirationObj) {
        await saveAspiration(categoryObj, aspirationObj);
      }

      // Save draft
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
        <div className="create-date-shell create-date-desktop">
          <CreateDateHeader
            activeStep={2}
            onBack={prevStep}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>Your aspiration. Your price.</h2>
                <div className="intro-subtitle">
                  When a man chooses Super Interested, he's saying: I'll cover
                  the outing and financially support your aspiration to skip
                  straight to our first date - Fast.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender">
              <div className="inner_container desktop-category-container">
                <div className="desktop-category-layout">
                  {/* Left side - Category & Aspiration */}
                  <div className="desktop-category-left">
                    <div className="mb-4">
                      <div className="aspiration__main__dropdown">
                        <label htmlFor="category" className="aspiration__label1">
                          1. Who do you aspire to be?
                        </label>
                        <label htmlFor="category" className="aspiration__label2">
                          Your selection will be locked for 30 days
                        </label>

                        <select
                          className="form-control aspiration-select"
                          value={categoryId || ""}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          disabled={disableDropdowns}
                        >
                          <option value="" disabled>
                            Select A Category
                          </option>
                          {categories.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>

                        <label
                          htmlFor="aspiration"
                          className="aspiration__label1 aspiration__label1--spaced"
                        >
                          Select Your Aspiration
                        </label>
                        <select
                          className="form-control aspiration-select"
                          value={aspirationId || ""}
                          onChange={(e) => handleAspirationChange(e.target.value)}
                          disabled={!categoryId || disableDropdowns}
                        >
                          <option value="" disabled>
                            Select Your Aspiration
                          </option>
                          {aspirations.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Price */}
                  <div className="desktop-category-right">
                    <div className="mb-4">
                      <label htmlFor="category" className="price__radio__label">
                        2. Set your suggested financial gift
                      </label>
                      <p className="price__radio__gentlemen">
                        He hands you the gift in person on the date to help
                        support your goals. Showing his commitment.
                      </p>
                      <div className="price-grid desktop-price-grid">
                        {PRICE_OPTIONS.map((price) => {
                          const isSelected = Number(formData.education) === price;
                          return (
                            <button
                              type="button"
                              key={price}
                              className={`price-card desktop-price-card ${
                                isSelected ? "is-selected" : ""
                              }`}
                              onClick={() => handlePriceSelect(price)}
                            >
                              ${price}
                            </button>
                          );
                        })}
                      </div>
                      <p className="price__radio__gentlemen mt-3">
                        Pro tip: Women who post multiple dates at different
                        price points get 3-5x more Super Interested offers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="desktop-navigation">
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNext}
                  disabled={!formData.education || isSaving}
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

export default Step2CategoryDesktop;
