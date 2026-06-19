import { VALIDATION_RULES } from "../constants/dateOptions";

/**
 * Custom hook for date form validation
 * Provides validation rules and error messages for each step
 */
export const useDateValidation = () => {
  /**
   * Validate Step 1: Experience Type
   */
  const validateExperience = (search_type) => {
    if (!search_type || !search_type.id) {
      return "Please select an experience type";
    }
    return null;
  };

  /**
   * Validate Step 2: Category & Price
   */
  const validateCategoryAndPrice = (category, aspiration, price) => {
    const errors = {};

    if (!category) {
      errors.category = "Please select a category";
    }

    if (!aspiration) {
      errors.aspiration = "Please select an aspiration";
    }

    if (!price) {
      errors.price = "Please select a price";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  /**
   * Validate Step 3: Duration
   */
  const validateDuration = (duration) => {
    if (!duration) {
      return "Please select a duration";
    }
    return null;
  };

  /**
   * Validate Step 4: Description
   */
  const validateDescription = (description) => {
    if (!description) {
      return "Please provide a description";
    }

    if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      return `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`;
    }

    if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      return `Description must not exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`;
    }

    return null;
  };

  /**
   * Validate all form data
   */
  const validateAll = (formData) => {
    const errors = {};

    // Validate experience
    const experienceError = validateExperience(formData.search_type);
    if (experienceError) {
      errors.experience = experienceError;
    }

    // Validate category and price
    const categoryError = validateCategoryAndPrice(
      formData.enter__category,
      formData.enter__aspiration,
      formData.education
    );
    if (categoryError) {
      errors.category = categoryError;
    }

    // Validate duration
    const durationError = validateDuration(formData.date_duration);
    if (durationError) {
      errors.duration = durationError;
    }

    // Validate description
    const descriptionError = validateDescription(formData.date_description);
    if (descriptionError) {
      errors.description = descriptionError;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  /**
   * Check if a specific step is valid
   */
  const isStepValid = (step, formData) => {
    switch (step) {
      case 0: // Experience
        return !validateExperience(formData.search_type);
      case 1: // Category & Price
        return !validateCategoryAndPrice(
          formData.enter__category,
          formData.enter__aspiration,
          formData.education
        );
      case 2: // Duration
        return !validateDuration(formData.date_duration);
      case 3: // Description
        return !validateDescription(formData.date_description);
      case 4: // Preview
        return true; // Preview step doesn't need validation
      default:
        return false;
    }
  };

  /**
   * Get character count info for description
   */
  const getDescriptionStatus = (description) => {
    const length = description?.length || 0;
    const min = VALIDATION_RULES.DESCRIPTION_MIN_LENGTH;
    const max = VALIDATION_RULES.DESCRIPTION_MAX_LENGTH;

    return {
      current: length,
      min,
      max,
      isValid: length >= min && length <= max,
      isTooShort: length < min,
      isTooLong: length > max,
      remaining: max - length,
    };
  };

  return {
    validateExperience,
    validateCategoryAndPrice,
    validateDuration,
    validateDescription,
    validateAll,
    isStepValid,
    getDescriptionStatus,
  };
};
