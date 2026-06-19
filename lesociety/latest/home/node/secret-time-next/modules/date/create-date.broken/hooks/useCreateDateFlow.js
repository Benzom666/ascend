import { useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { apiRequest } from "utils/Utilities";
import { reset } from "redux-form";
import { logout } from "modules/auth/authActions";
import { toast } from "react-toastify";
import { getNormalizedImages } from "utils/dateState";

/**
 * Custom hook for Create Date Flow logic
 * Handles all API calls, form submission, and navigation
 */
export const useCreateDateFlow = (createDateContext) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    formData,
    cityState,
    user,
    isEditMode,
    dateId,
    setSaving,
    setErrorState,
    setEditMode,
    updateFormData,
    resetForm,
  } = createDateContext;

  /**
   * Fetch categories from API
   */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `categories`,
        token: user?.token,
      });

      return (
        res.data?.data?.map((cat) => ({
          label: cat?.name,
          value: cat?._id,
        })) || []
      );
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout(router, dispatch);
        }, 1000);
      }
      return [];
    }
  }, [router, dispatch, user]);

  /**
   * Fetch aspirations for a category
   */
  const fetchAspirations = useCallback(async (categoryId) => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `aspirations?category_id=${categoryId}`,
        token: user?.token,
      });

      return (
        res.data?.data?.map((asp) => ({
          label: asp?.name,
          value: asp?._id,
        })) || []
      );
    } catch (err) {
      console.error("Failed to fetch aspirations:", err);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout(router, dispatch);
        }, 1000);
      }
      return [];
    }
  }, [router, dispatch, user]);

  /**
   * Save user's aspiration preference
   */
  const saveAspiration = useCallback(async (category, aspiration) => {
    try {
      const data = {
        categatoryName: category?.label,
        aspirationName: aspiration?.label,
        aspirationId: aspiration?.value,
        categatoryId: category?.value,
      };

      await apiRequest({
        data: data,
        method: "POST",
        url: `user/save-aspiration`,
        token: user?.token,
      });

      // Fetch updated user details
      if (user?.user_name) {
        const res = await apiRequest({
          method: "GET",
          url: `user/user-by-name?user_name=${user?.user_name}`,
          token: user?.token,
        });

        // Update Redux state
        dispatch({
          type: "AUTHENTICATE_UPDATE",
          payload: { ...res.data?.data?.user },
        });
      }

      return true;
    } catch (err) {
      console.error("Failed to save aspiration:", err);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout(router, dispatch);
        }, 1000);
      } else {
        toast.error("Failed to save aspiration. Please try again.");
      }
      return false;
    }
  }, [router, dispatch, user]);

  /**
   * Fetch eligible images (not used in published dates)
   */
  const fetchEligibleImages = useCallback(async () => {
    try {
      if (!user?.user_name) {
        return [];
      }

      const res = await apiRequest({
        url: "date",
        params: {
          user_name: user?.user_name,
          current_page: 1,
          per_page: 10000,
        },
        token: user?.token,
      });

      const dates = res?.data?.data?.dates || [];
      const usedIndices = dates
        .filter((date) => date?.date_status === true)
        .map((date) => (typeof date?.image_index === "number" ? date.image_index : 0));

      const images = getNormalizedImages([
        ...(user?.images || []),
        ...(user?.un_verified_images || []),
      ]);
      let available = images.filter((img) => !usedIndices.includes(img.index));

      // If all images are used, make all available
      if (!available.length && images.length) {
        available = images;
      }

      return available.map((img) => ({ url: img.url, idx: img.index }));
    } catch (err) {
      console.error("Failed to fetch eligible images:", err);
      return getNormalizedImages([
        ...(user?.images || []),
        ...(user?.un_verified_images || []),
      ]).map((img) => ({ url: img.url, idx: img.index }));
    }
  }, [user]);

  /**
   * Create or update draft date
   */
  const saveDraft = useCallback(async () => {
    setSaving(true);
    setErrorState(null);

    try {
      const isUpdate = isEditMode && dateId;

      const selectedExperience = formData.search_type;
      const experienceCategory = selectedExperience?.category;
      const resolvedCityName =
        cityState?.enter_city?.name ||
        cityState?.enter_city?.label ||
        cityState?.enter_city ||
        "";
      const resolvedCountryLabel =
        cityState?.enter_country?.label ||
        cityState?.enter_country?.text ||
        cityState?.enter_country?.name ||
        "Unknown";
      const resolvedCountryCode =
        cityState?.enter_country?.value ||
        cityState?.enter_country?.short_code ||
        "XX";
      const data = {
        user_name: user?.user_name,
        location: resolvedCityName,
        country: resolvedCountryLabel,
        country_code: resolvedCountryCode,
        province: cityState?.enter_city?.province?.[0]?.short_code,
        standard_class_date:
          experienceCategory === "standard_class_date"
            ? selectedExperience?.label
            : "",
        middle_class_dates:
          experienceCategory === "middle_class_dates"
            ? selectedExperience?.label
            : "",
        executive_class_dates:
          experienceCategory === "executive_class_dates"
            ? selectedExperience?.label
            : "",
        date_length: formData.date_duration,
        price: formData.education,
        date_details: formData.date_description,
        image_index: formData.image_index,
      };

      const hasAllRequiredForCreate =
        !!user?.user_name &&
        !!resolvedCityName &&
        !!resolvedCountryCode &&
        !!resolvedCountryLabel &&
        !!formData.date_duration &&
        !!formData.education &&
        !!formData.date_description;

      if (!isUpdate && !hasAllRequiredForCreate) {
        setSaving(false);
        return null;
      }

      let res;
      if (isUpdate) {
        res = await apiRequest({
          method: "POST",
          url: `/date/update`,
          data: {
            ...data,
            date_id: dateId,
          },
          token: user?.token,
        });
      } else {
        res = await apiRequest({
          method: "POST",
          url: `/date`,
          data: data,
          token: user?.token,
        });

        // Update form data with new date ID
        const newDateId = res.data?.data?._id || res.data?.data?.date?._id;
        if (newDateId) {
          updateFormData("dateId", newDateId);
        }
      }

      setSaving(false);
      return res.data?.data?.date;
    } catch (err) {
      setSaving(false);
      console.error("Failed to save draft:", err);

      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout(router, dispatch);
        }, 1000);
      } else if (err?.response?.status === 403) {
        toast.error("You already have a draft date. Please complete or delete it first.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to save draft. Please try again.");
      }

      setErrorState(err);
      return null;
    }
  }, [
    formData,
    cityState,
    isEditMode,
    dateId,
    setSaving,
    setErrorState,
    updateFormData,
    user,
    router,
    dispatch,
  ]);

  /**
   * Publish the date
   */
  const publishDate = useCallback(async () => {
    setSaving(true);
    setErrorState(null);

    try {
      const res = await apiRequest({
        method: "POST",
        url: `/date/update-draft-status`,
        data: {
          date_status: true,
        },
        token: user?.token,
      });

      setSaving(false);

      // Clear Redux forms
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));

      // Navigate to user list
      router.push(
        {
          pathname: "/user/user-list",
          query: {
            city: cityState?.enter_city?.name,
            country: cityState?.enter_country?.value,
            posted: true,
            province: cityState?.enter_city?.province?.[0]?.short_code?.split("-")[1]
              ? cityState?.enter_city?.province[0]?.short_code.split("-")[1]
              : cityState?.enter_city?.province?.[0]?.short_code,
          },
        },
        "/user/user-list"
      );

      toast.success("Date posted successfully!");

      return true;
    } catch (err) {
      setSaving(false);
      console.error("Failed to publish date:", err);

      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          logout(router, dispatch);
        }, 1000);
      } else {
        toast.error(err?.response?.data?.message || "Failed to publish date. Please try again.");
      }

      setErrorState(err);
      return false;
    }
  }, [cityState, setSaving, setErrorState, router, dispatch, user]);

  /**
   * Update date image index
   */
  const updateImageIndex = useCallback(async (imageIndex) => {
    try {
      if (!dateId) {
        return false;
      }

      await apiRequest({
        method: "POST",
        url: `/date/update`,
        data: {
          user_name: user?.user_name,
          date_id: dateId,
          image_index: imageIndex,
        },
        token: user?.token,
      });

      updateFormData("image_index", imageIndex);
      return true;
    } catch (err) {
      console.error("Failed to update image index:", err);
      toast.error("Failed to update image. Please try again.");
      return false;
    }
  }, [dateId, updateFormData, user]);

  /**
   * Navigate to user list
   */
  const goToList = useCallback(() => {
    router.push(
      {
        pathname: "/user/user-list",
        query: {
          city: cityState?.enter_city?.name,
          country: cityState?.enter_country?.value,
          province: cityState?.enter_city?.province?.[0]?.short_code?.split("-")[1]
            ? cityState?.enter_city?.province[0]?.short_code.split("-")[1]
            : cityState?.enter_city?.province?.[0]?.short_code,
        },
      },
      "/user/user-list"
    );
  }, [router, cityState]);

  return {
    // API methods
    fetchCategories,
    fetchAspirations,
    saveAspiration,
    fetchEligibleImages,
    saveDraft,
    publishDate,
    updateImageIndex,

    // Navigation
    goToList,

    // State
    isLoading: false, // Can be added if needed
  };
};
