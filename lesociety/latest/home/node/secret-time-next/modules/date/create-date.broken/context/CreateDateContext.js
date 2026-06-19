import React, { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_FORM_VALUES } from "../constants/dateOptions";

/**
 * Create Date Context
 * Manages shared state across all steps of the date creation flow
 */
const CreateDateContext = createContext();

/**
 * Create Date Provider Component
 * Wraps the entire create date flow to provide shared state and methods
 */
export const CreateDateProvider = ({ children, initialData = {} }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dateId, setDateId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    ...DEFAULT_FORM_VALUES,
    ...initialData,
  });

  // City and user info (passed from Redux or parent component)
  const [cityState, setCityState] = useState(initialData.cityState || null);
  const [user, setUser] = useState(initialData.user || null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Eligible images for swapping
  const [eligibleImages, setEligibleImages] = useState([]);

  /**
   * Update form data for a specific field
   */
  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Update multiple form fields at once
   */
  const updateFormDataBatch = useCallback((updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  /**
   * Navigate to previous step
   */
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Go to a specific step
   */
  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, 4)));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_VALUES });
    setCurrentStep(0);
    setIsEditMode(false);
    setDateId(null);
    setError(null);
  }, []);

  /**
   * Set city state
   */
  const setCity = useCallback((city) => {
    setCityState(city);
  }, []);

  /**
   * Set user info
   */
  const setUserInfo = useCallback((userInfo) => {
    setUser(userInfo);
  }, []);

  /**
   * Set edit mode and date ID
   */
  const setEditMode = useCallback((editMode, existingDateId = null) => {
    setIsEditMode(editMode);
    if (existingDateId) {
      setDateId(existingDateId);
    }
  }, []);

  /**
   * Set eligible images for swapping
   */
  const setEligibleImagesList = useCallback((images) => {
    setEligibleImages(images);
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  /**
   * Set saving state
   */
  const setSaving = useCallback((saving) => {
    setIsSaving(saving);
  }, []);

  /**
   * Set error
   */
  const setErrorState = useCallback((err) => {
    setError(err);
  }, []);

  /**
   * Context value
   */
  const value = {
    // State
    currentStep,
    isEditMode,
    dateId,
    formData,
    cityState,
    user,
    isLoading,
    isSaving,
    error,
    eligibleImages,

    // Methods
    updateFormData,
    updateFormDataBatch,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    setCity,
    setUserInfo,
    setEditMode,
    setEligibleImagesList,
    setLoading,
    setSaving,
    setErrorState,
  };

  return (
    <CreateDateContext.Provider value={value}>
      {children}
    </CreateDateContext.Provider>
  );
};

/**
 * Hook to use the Create Date Context
 * Throws an error if used outside of CreateDateProvider
 */
export const useCreateDate = () => {
  const context = useContext(CreateDateContext);
  if (!context) {
    throw new Error("useCreateDate must be used within CreateDateProvider");
  }
  return context;
};

/**
 * HOC to inject Create Date Context into a component
 * Alternative to using the hook
 */
export const withCreateDate = (Component) => {
  return (props) => {
    const createDateContext = useCreateDate();
    return <Component {...props} createDateContext={createDateContext} />;
  };
};
