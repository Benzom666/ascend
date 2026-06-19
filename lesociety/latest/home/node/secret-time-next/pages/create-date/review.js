import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { reset } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import { apiRequest } from "utils/Utilities";
import {
  getEligibleDateImages,
  getNormalizedImages,
  normalizeImageIndex,
} from "utils/dateState";
import { toast } from "react-toastify";
import UserCardDetail from "@/core/UserCardDetail";
import { dateCategory } from "utils/Utilities";
import { useCreateDateBrowserBack } from "utils/createDateNavigation";
import { markCreateDateProgressFromStep } from "utils/createDateProgress";
import ConfirmDate from "@/modules/date/confirmDate";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import {
  activateCreateDateFlow,
  clearCreateDateFlow,
  persistCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { loadFromLocalStorage } from "utils/sessionStorage";
import { formatDateDuration } from "utils/dateDuration";
import {
  CREATE_DATE_LIMIT_PATH,
  redirectToCreateDateLimit,
  useCreateDateAccessGuard,
} from "utils/createDateAccessGuard";
import Loader from "@/modules/Loader/Loader";

const DATE_TYPE_META = {
  MorningBeverage: { label: "Brunch Date", field: "standard_class_date" },
  EveningDate: { label: "Evening Date", field: "standard_class_date" },
  GetSporty: { label: "Get Sporty", field: "middle_class_dates" },
  TakeClass: { label: "Take A Class", field: "middle_class_dates" },
  WineDine: { label: "Wine & Dine", field: "middle_class_dates" },
  BottlesDance: { label: "Bottles & Dance", field: "executive_class_dates" },
  EntertainmentSport: {
    label: "Entertainment & Sports",
    field: "executive_class_dates",
  },
  Entertainmentsports: {
    label: "Entertainment & Sports",
    field: "executive_class_dates",
  },
};

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const normalizeImageList = (list = []) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { url: item, index };
      }
      if (typeof item === "object") {
        const url = item.url || item.location || "";
        const idx = Number.isFinite(Number(item.index))
          ? Number(item.index)
          : index;
        return url ? { url, index: idx } : null;
      }
      return null;
    })
    .filter(Boolean)
    .reduce((acc, item) => {
      if (acc.some((existing) => existing.url === item.url)) return acc;
      acc.push(item);
      return acc;
    }, []);
};

const withFlowQuery = (flow = {}, path) => {
  if (flow?.editMode || flow?.flowMode === "edit-existing") {
    return `${path}?new_edit=true`;
  }
  if (flow?.flowMode === "draft-edit") {
    return `${path}?edit=true`;
  }
  return path;
};

const getReviewGuardRoute = (flow = {}) => {
  if (flow?.editMode || flow?.flowMode === "edit-existing") {
    return hasValue(flow?.description)
      ? null
      : withFlowQuery(flow, "/create-date/description");
  }
  if (!hasValue(flow?.city) && !hasValue(flow?.cityData?.label)) {
    return withFlowQuery(flow, "/create-date/choose-city");
  }
  if (!hasValue(flow?.selectedDateType)) {
    return withFlowQuery(flow, "/create-date/choose-date-type");
  }
  if (
    !hasValue(flow?.selectedCategory) ||
    !hasValue(flow?.selectedAspiration) ||
    !hasValue(flow?.selectedPrice)
  ) {
    return withFlowQuery(flow, "/create-date/date-event");
  }
  if (!hasValue(flow?.selectedDurationValue) && !hasValue(flow?.selectedDuration)) {
    return withFlowQuery(flow, "/create-date/duration");
  }
  if (!hasValue(flow?.description)) {
    return withFlowQuery(flow, "/create-date/description");
  }
  return null;
};

function CreateReview() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.authReducer?.user);
  const [fallbackUser, setFallbackUser] = useState(null);
  const chooseCityForm = useSelector((state) => state?.form?.ChooseCity?.values);
  const createStepOneForm = useSelector(
    (state) => state?.form?.CreateStepOne?.values
  );
  const createStepTwoForm = useSelector(
    (state) => state?.form?.CreateStepTwo?.values
  );
  const createStepThreeForm = useSelector(
    (state) => state?.form?.CreateStepThree?.values
  );
  const createStepFourForm = useSelector(
    (state) => state?.form?.CreateStepFour?.values
  );

  // Stable scalar selections used inside the heavy load effect. Tracking the
  // whole form objects in deps would re-run the effect (and its 10k-record
  // fetch) on every keystroke; tracking these scalars keeps it idempotent.
  const cityLabel =
    chooseCityForm?.enter_city?.label ||
    chooseCityForm?.enter_city?.name ||
    "";
  const stepOneTypeLabel = createStepOneForm?.search_type?.label || "";
  const stepOneTypeId = createStepOneForm?.search_type?.id || "";
  const stepTwoPrice = createStepTwoForm?.education || "";
  const stepTwoCategory = createStepTwoForm?.enter__category || "";
  const stepTwoAspiration = createStepTwoForm?.enter__aspiration || "";
  const stepThreeDuration = createStepThreeForm?.education || "";
  const stepFourDescription = createStepFourForm?.date_description || "";
  const [dateData, setDateData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(() => {
    const savedData = readCreateDateFlow();
    const savedIndex = Number(savedData?.image_index);
    
    // CRITICAL FIX: Only use saved image_index if it's explicitly set and valid
    // This prevents defaulting to 0 when there's no saved data
    if (Number.isFinite(savedIndex) && savedData?.image_index !== undefined) {
      console.log(`Using saved image_index: ${savedIndex}`);
      return savedIndex;
    }
    
    // No saved index - let useEffect determine first available image
    console.log('No saved image_index, will select first available');
    return null;
  });
  const [availableImages, setAvailableImages] = useState([]);
  const [resolvedEditImageIndex, setResolvedEditImageIndex] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const effectiveUser = user?.user_name ? user : fallbackUser;
  // REMOVED: useCreateDateAccessGuard - limit check moved to Create Date button for better UX
  // Previously this checked on every review page load, causing confusion
  // Now the check happens when clicking "Create New Date" button
  const isEditMode = Boolean(router?.query?.new_edit || dateData?.editMode);
  const isDraftEditMode = Boolean(
    !isEditMode &&
      (router?.query?.edit ||
        dateData?.flowMode === "draft-edit" ||
        dateData?.dateId)
  );
  useCreateDateBrowserBack(router);
  const editImageIndex = Number(dateData?.editImageIndex);
  const previewImages = useMemo(
    () =>
      normalizeImageList([
        ...(effectiveUser?.images || []),
        ...(effectiveUser?.un_verified_images || []),
      ]),
    [effectiveUser?.images, effectiveUser?.un_verified_images]
  );
  const persistResumePath = (path = router.asPath) => {
    persistCreateDateResumePath(path);
  };
  const toggleConfirm = () => setConfirmPopup((prev) => !prev);
  const handleClosePage = () => {
    persistResumePath();
    router.push("/user/user-list");
  };

  useEffect(() => {
    if (user?.user_name) {
      setFallbackUser(null);
      return;
    }

    if (typeof window === "undefined") return;

    const sessionAuth = loadFromLocalStorage();
    if (sessionAuth?.user?.user_name) {
      setFallbackUser(sessionAuth.user);
      return;
    }

    try {
      const localAuth = JSON.parse(window.localStorage?.getItem("auth") || "null");
      if (localAuth?.user?.user_name) {
        setFallbackUser(localAuth.user);
      }
    } catch (error) {
      console.error("Failed to load fallback auth user", error);
    }
  }, [user?.user_name]);

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

  // Normalize gender for backend validation
  const normalizeGender = (gender) => {
    if (!gender) return null;
    const normalized = String(gender).toLowerCase().trim();
    if (["male", "female", "m", "f"].includes(normalized)) {
      return normalized;
    }
    // Handle common variations
    if (normalized === "man" || normalized === "men") return "male";
    if (normalized === "woman" || normalized === "women") return "female";
    return null;
  };

  useEffect(() => {
    console.log("=== Page Load ===");
    console.log("User:", effectiveUser);
    console.log("User gender:", effectiveUser?.gender);
    console.log("Normalized gender:", normalizeGender(effectiveUser?.gender));
    
    // Check if user data is properly loaded
    if (!effectiveUser?.user_name) {
      return;
    }

    // Check if gender is properly set
    if (!effectiveUser?.gender) {
      toast.error("Gender information is missing. Please update your profile and try again.");
      router.push("/user/user-profile");
      return;
    }

    try {
      const savedData = readCreateDateFlow();
      if (savedData && Object.keys(savedData).length) {
        const durationValue =
          savedData?.selectedDurationValue || createStepThreeForm?.education || "";
        const matchingDateTypeId = Object.keys(DATE_TYPE_META).find(
          (key) =>
            DATE_TYPE_META[key]?.label === createStepOneForm?.search_type?.label
        );
        const selectedDateTypeId =
          savedData?.selectedDateType ||
          createStepOneForm?.search_type?.id ||
          matchingDateTypeId ||
          null;
        const normalizedData = {
          ...savedData,
          flowMode: savedData?.editMode
            ? "edit-existing"
            : savedData?.flowMode || "create",
          city:
            savedData?.city ||
            chooseCityForm?.enter_city?.label ||
            chooseCityForm?.enter_city?.name ||
            "",
          cityData: savedData?.cityData || chooseCityForm?.enter_city || null,
          selectedDateType: selectedDateTypeId || savedData?.selectedDateType || null,
          selectedPrice:
            savedData?.selectedPrice || createStepTwoForm?.education || null,
          selectedCategory:
            savedData?.selectedCategory ||
            createStepTwoForm?.enter__category ||
            "",
          selectedAspiration:
            savedData?.selectedAspiration ||
            createStepTwoForm?.enter__aspiration ||
            "",
          selectedDurationValue: durationValue,
          selectedDuration:
            savedData?.selectedDuration ||
            formatDateDuration(durationValue) ||
            "",
          description:
            savedData?.description || createStepFourForm?.date_description || "",
        };
        const reviewGuardRoute = getReviewGuardRoute(normalizedData);
        if (reviewGuardRoute) {
          router.replace(reviewGuardRoute);
          return;
        }
        writeCreateDateFlow(normalizedData);
        console.log("Date data:", normalizedData);
        setDateData(normalizedData);
      } else {
        toast.error("No date data found. Please start over.");
        router.push("/create-date/choose-city");
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      router.push("/create-date/choose-city");
    }

    const fetchAvailableImages = async () => {
      if (!previewImages.length) {
        setAvailableImages([]);
        return;
      }
      if (!effectiveUser?.user_name) {
        setAvailableImages(previewImages);
        return;
      }

      try {
        const res = await apiRequest({
          url: "date",
          params: {
            user_name: effectiveUser?.user_name,
            current_page: 1,
            per_page: 10000,
          },
        });
        const dates = res?.data?.data?.dates || [];
        const editingDate = dates.find(
          (date) => String(date?._id) === String(dateData?.dateId)
        );
        const preferredEditImageIndex = Number.isFinite(editImageIndex)
          ? editImageIndex
          : Number(editingDate?.image_index);
        setResolvedEditImageIndex(
          Number.isFinite(preferredEditImageIndex)
            ? preferredEditImageIndex
            : null
        );
        const available = getEligibleDateImages(previewImages, dates, {
          includeIndex:
            isEditMode && Number.isFinite(preferredEditImageIndex)
              ? preferredEditImageIndex
              : null,
        });

        setAvailableImages(available);
        
        // CRITICAL FIX: If no images available, block date creation to prevent duplicates
        if (available.length === 0 && !isEditMode) {
          toast.error("No unique photos available. Each date must use a different photo. Please delete an existing date or add more photos to your profile.");
          router.push("/user/user-profile");
          return;
        }
        
        setCurrentImageIndex((prev) => {
          // CRITICAL FIX: Handle all cases properly to prevent duplicate image usage
          if (available.length === 0) {
            // In edit mode, keep current image even if not technically "available"
            if (isEditMode && Number.isFinite(preferredEditImageIndex)) {
              return preferredEditImageIndex;
            }
            // Should never reach here due to earlier check, but log for debugging
            console.error('CRITICAL: No available images and not in edit mode!');
            return 0;
          }
          
          // Edit mode: prefer the existing image if available
          if (
            isEditMode &&
            Number.isFinite(preferredEditImageIndex) &&
            available.some((img) => img.index === preferredEditImageIndex)
          ) {
            return preferredEditImageIndex;
          }
          
          // If prev is set and still available, keep it
          if (prev !== null && available.some((img) => img.index === prev)) {
            return prev;
          }
          
          // Otherwise, use FIRST available image (not necessarily index 0!)
          const firstAvailable = available[0]?.index;
          console.log(`Selecting first available image: index ${firstAvailable}`);
          
          // CRITICAL FIX: Persist the selected image_index immediately to prevent race conditions
          if (typeof firstAvailable === "number") {
            try {
              writeCreateDateFlow({
                image_index: firstAvailable,
              });
            } catch (err) {
              console.error("Failed to persist image index", err);
            }
          }
          
          return firstAvailable;
        });
      } catch (err) {
        console.error("Failed to fetch dates for swap images:", err);
        const fallbackIndex = isEditMode
          ? normalizeImageIndex(editImageIndex, 0)
          : normalizeImageIndex(
              currentImageIndex,
              normalizeImageIndex(dateData?.image_index, 0)
            );
        const normalizedImages = getNormalizedImages(previewImages);
        const selectedFallback =
          normalizedImages.find((img) => img.index === fallbackIndex) ||
          normalizedImages[0];
        const fallback = selectedFallback ? [selectedFallback] : [];
        setAvailableImages(fallback);
        if (
          isEditMode &&
          Number.isFinite(editImageIndex) &&
          fallback.some((img) => img.index === editImageIndex)
        ) {
          setCurrentImageIndex(editImageIndex);
          setResolvedEditImageIndex(editImageIndex);
        }
      }
    };

    fetchAvailableImages();
  }, [
    effectiveUser?.user_name,
    effectiveUser?.gender,
    previewImages.length,
    isEditMode,
    editImageIndex,
    dateData?.dateId,
    cityLabel,
    stepOneTypeLabel,
    stepOneTypeId,
    stepTwoPrice,
    stepTwoCategory,
    stepTwoAspiration,
    stepThreeDuration,
    stepFourDescription,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    persistResumePath();
  }, [router.isReady]);

  const handleSubmit = async () => {
    if (submitInFlightRef.current || isSubmitting) {
      return;
    }

    if (!dateData) {
      toast.error("Missing required information");
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      let effectiveDateId = dateData?.dateId;
      const selectedDateTypeMeta =
        DATE_TYPE_META[dateData?.selectedDateType] || DATE_TYPE_META.MorningBeverage;
      // CRITICAL FIX: Ensure we have a valid image_index before submitting
      // Wait for currentImageIndex to be set by the async fetch
      if (typeof currentImageIndex !== "number" && !isEditMode) {
        toast.error("Photos are still loading. Please wait a moment.");
        setIsSubmitting(false);
        submitInFlightRef.current = false;
        return;
      }
      
      const finalImageIndex = typeof currentImageIndex === "number"
        ? currentImageIndex
        : typeof dateData?.image_index === "number"
        ? dateData.image_index
        : 0;
      
      console.log(`Submitting date with image_index: ${finalImageIndex}`);
      
      const publishPayload = {
        user_name: effectiveUser?.user_name || effectiveUser?.username,
        location: previewCityName,
        province: previewProvince,
        country: previewCountry,
        country_code: previewCountryCode,
        date_length:
          dateData?.selectedDurationValue || dateData?.selectedDuration,
        price: dateData?.selectedPrice,
        date_details: dateData?.description,
        image_index: finalImageIndex,
        date_status: true,
        [selectedDateTypeMeta.field]: selectedDateTypeMeta.label,
      };
      if (isEditMode) {
        if (!effectiveDateId) {
          throw new Error("Date id missing for edit.");
        }

        await apiRequest({
          method: "POST",
          url: "date/update",
          data: {
            user_name: effectiveUser?.user_name || effectiveUser?.username,
            date_id: effectiveDateId,
            date_details: dateData.description,
          },
          token: effectiveUser?.token,
          timeout: 45000,
        });
      } else {
        if (!effectiveDateId) {
          const createdResponse = await apiRequest({
            method: "POST",
            url: "date",
            data: publishPayload,
            token: effectiveUser?.token,
            timeout: 20000,
          });
          effectiveDateId =
            createdResponse?.data?.data?._id ||
            createdResponse?.data?.data?.date?._id ||
            effectiveDateId;
        } else {
          // The original flow saves the full draft earlier and publishes it here
          // by flipping draft status to live. Keep that contract to avoid slow
          // final-step full updates that can time out.
          try {
            // CRITICAL FIX: Must send image_index when publishing draft!
            await apiRequest({
              method: "POST",
              url: "date/update-draft-status",
              data: {
                date_status: true,
                image_index: finalImageIndex, // Include the selected image index!
              },
              token: effectiveUser?.token,
              timeout: 15000,
            });
          } catch (err) {
            if (err?.response?.status !== 404) {
              throw err;
            }

            // Some sessions reach review with local flow state intact but no
            // persisted backend draft. Fall back to creating the live date from
            // the reviewed payload instead of blocking posting entirely.
            const createdResponse = await apiRequest({
              method: "POST",
              url: "date",
              data: publishPayload,
              token: effectiveUser?.token,
              timeout: 20000,
            });
            effectiveDateId =
              createdResponse?.data?.data?._id ||
              createdResponse?.data?.data?.date?._id ||
              effectiveDateId;
          }
        }
      }

      clearCreateDateFlow({ flowMode: "create" });
      clearCreateDateFlow({ flowMode: "draft-edit" });
      if (effectiveDateId) {
        clearCreateDateFlow({ flowMode: "edit-existing", dateId: effectiveDateId });
      } else {
        clearCreateDateFlow();
      }
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));

      router.push({
        pathname: "/user/user-list",
        query: isEditMode
          ? { edited: 1 }
          : {
              posted: 1,
              city: previewCityName,
              province: previewProvince,
              country: previewCountryCode,
            },
      });
    } catch (err) {
      console.error("Error creating date:", err);
      console.log("Error response:", err.response);
      console.log("Error status:", err.response?.status);
      console.log("Error message:", err.response?.data?.message);
      const isTimeoutError =
        err?.code === "ECONNABORTED" ||
        err?.message?.toLowerCase?.().includes("timeout");
      
      if (isTimeoutError) {
        toast.error("Publishing your date took too long. Please try again.");
      } else if (err.response?.status === 403) {
        const errorMsg = err.response?.data?.message || "";
        console.log("403 error detected, checking message:", errorMsg);
        
        if (errorMsg.toLowerCase().includes("limit") || errorMsg.includes("reached")) {
          toast.error(errorMsg || "You have reached your date limit.");
          persistResumePath(CREATE_DATE_LIMIT_PATH);
          redirectToCreateDateLimit(router);
        } else if (errorMsg.includes("draft")) {
          toast.error(errorMsg);
        } else if (errorMsg.toLowerCase().includes("gender") || errorMsg.toLowerCase().includes("invalid gender")) {
          // Specific handling for gender-related validation errors
          toast.error("Gender information is required. Please update your profile and try again.");
          router.push("/user/user-profile");
        } else {
          toast.error(errorMsg || "You cannot create more dates at this time.");
        }
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || "";
        if (errorMsg.toLowerCase().includes("gender") || errorMsg.toLowerCase().includes("invalid gender")) {
          // Specific handling for gender-related validation errors
          toast.error("Gender information is required. Please update your profile and try again.");
          router.push("/user/user-profile");
        } else {
          toast.error(
            err.response?.data?.message || "Invalid data. Please check your information and try again."
          );
        }
      } else if (err.response?.status === 422) {
        // Handle validation errors
        const errorMsg = err.response?.data?.message || "";
        if (errorMsg.toLowerCase().includes("gender") || errorMsg.toLowerCase().includes("invalid gender")) {
          toast.error("Gender information is required. Please update your profile and try again.");
          router.push("/user/user-profile");
        } else {
          toast.error(
            err.response?.data?.message || "Validation failed. Please check your information."
          );
        }
      } else {
        toast.error(
          err.response?.data?.message || "Failed to create date. Please try again."
        );
      }
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // REMOVED: limit check - limit validation now happens at Create Date button
  // This modal will still show if user somehow reaches limit-reached page

  // Removed unnecessary loader - limit check shouldn't block page rendering during flow navigation

  const handleEdit = (step) => {
    const stepRoutes = {
      city: "/create-date/choose-city",
      dateType: "/create-date/choose-date-type",
      category: "/create-date/date-event",
      duration: "/create-date/duration",
      description: "/create-date/description",
    };
    const route = stepRoutes[step] || "/create-date/choose-city";
    router.push(route);
  };

  const handleSwapImage = () => {
    if (availableImages.length <= 1) return;
    
    // FIXED: Debounce to prevent double-clicks causing issues
    if (isSubmitting) return;
    
    setCurrentImageIndex((prev) => {
      const currentIdx = availableImages.findIndex((img) => img.index === prev);
      const nextIdx = (currentIdx + 1) % availableImages.length;
      const nextImageIndex = availableImages[nextIdx]?.index ?? prev;
      
      console.log(`Swapping image from index ${prev} to ${nextImageIndex}`);
      
      // FIXED: Always persist to flow first to ensure correct image is used on submit
      try {
        writeCreateDateFlow({
          flowMode: isEditMode
            ? "edit-existing"
            : isDraftEditMode
            ? "draft-edit"
            : "create",
          editMode: isEditMode,
          image_index: nextImageIndex,
        });
      } catch (err) {
        console.error("Failed to persist image index", err);
      }
      
      // FIXED: Only update draft in DB if it exists, don't block on API call
      if (dateData?.dateId && !isEditMode) {
        apiRequest({
          method: "POST",
          url: "/date/update",
          data: {
            date_id: dateData.dateId,
            user_name: effectiveUser?.user_name || effectiveUser?.username,
            image_index: nextImageIndex,
          },
          token: effectiveUser?.token,
        }).catch((err) => {
          console.error("Failed to update image index:", err);
        });
      }

      return nextImageIndex;
    });
  };

  const getCurrentImage = () => {
    // CRITICAL FIX: Don't show any image until we have a valid currentImageIndex
    // This prevents flash of wrong photo while loading
    if (currentImageIndex === null || typeof currentImageIndex !== "number") {
      console.log('getCurrentImage: waiting for currentImageIndex to be set');
      return null;
    }

    if (isEditMode && typeof dateData?.editImageUrl === "string" && dateData.editImageUrl) {
      return dateData.editImageUrl;
    }

    const effectiveEditImageIndex = Number.isFinite(editImageIndex)
      ? editImageIndex
      : resolvedEditImageIndex;

    if (
      isEditMode &&
      Number.isFinite(effectiveEditImageIndex) &&
      effectiveUser?.images?.[effectiveEditImageIndex]
    ) {
      return effectiveUser.images[effectiveEditImageIndex];
    }

    // Use the selected image index - MUST match currentImageIndex exactly
    if (effectiveUser?.images?.[currentImageIndex]) {
      console.log(`getCurrentImage: returning image at index ${currentImageIndex}`);
      return effectiveUser.images[currentImageIndex];
    }

    // Fallback: find in available images
    if (availableImages.length > 0) {
      const current = availableImages.find((img) => img.index === currentImageIndex);
      if (current?.url) {
        return current.url;
      }
      // CRITICAL: Don't fallback to [0] - return null to show loading state
      console.warn(`getCurrentImage: currentImageIndex ${currentImageIndex} not found in available images`);
      return null;
    }
    
    return null;
  };

  if (!dateData) {
    return (
      <div className="create-date-page" style={{ backgroundColor: '#000' }}>
        <div className="loading-container">
          <div className="spin-loader"></div>
          <p>Loading your date...</p>
        </div>
      </div>
    );
  }

  const selectedDateTypeMeta =
    DATE_TYPE_META[dateData.selectedDateType] || DATE_TYPE_META.MorningBeverage;
  const selectedDateCategory = dateCategory.find(
    (item) => item?.label === selectedDateTypeMeta.label
  );
  const previewCityLabel =
    dateData?.city ||
    dateData?.selectedCity ||
    dateData?.cityData?.label ||
    "Toronto, ON";
  const previewCityName =
    dateData?.cityData?.name || previewCityLabel?.split(",")?.[0] || "Toronto";
  const previewProvince =
    dateData?.cityData?.province?.[0]?.short_code?.split("-")[1] ||
    dateData?.cityData?.province?.[0]?.short_code ||
    previewCityLabel?.split(",")?.[1]?.trim() ||
    "ON";
  const previewCountry =
    dateData?.cityData?.country?.[0]?.text || effectiveUser?.country || "United States";
  const previewCountryCode =
    dateData?.cityData?.country?.[0]?.short_code || effectiveUser?.country_code || "US";
  const previewDuration =
    dateData?.selectedDuration ||
    formatDateDuration(dateData?.selectedDurationValue);
  const canSubmitDate =
    isEditMode || (typeof currentImageIndex === "number" && availableImages.length > 0);

  return (
    <>
      <div className="create-date-page" style={{ backgroundColor: '#000' }}>
        <CreateDateNewHeader
          activeStep={5}
          onBack={() => {
            markCreateDateProgressFromStep(5);
            router.push(
            router?.query?.new_edit
              ? "/create-date/description?new_edit=true"
              : router?.query?.edit
              ? "/create-date/description?edit=true"
              : "/create-date/description"
            );
          }}
          onClose={toggleConfirm}
        />

      <div className="create-date-content">
        <h1 className="page-title">You're almost done!</h1>
        <p className="page-subtitle">
          Take a moment to review your date.<br />
          Your description can only be edited. Everything else is locked.
        </p>

        <div className="preview-container">
          <UserCardDetail
            user={{
              user_name: effectiveUser?.user_name || effectiveUser?.name,
              age: effectiveUser?.age,
              images: effectiveUser?.images || [],
              aspirationName: dateData.selectedAspirationName
            }}
            cityState={{
              enter_city: {
                name: previewCityName,
                province: [{ short_code: previewProvince }]
              }
            }}
            dateSuggestion={{
              search_type: {
                label: selectedDateTypeMeta.label,
                icon: selectedDateCategory?.icon || <span>⭐</span>,
              }
            }}
            timeState={{
              display_duration: previewDuration,
              education: dateData?.selectedDurationValue || previewDuration,
            }}
            priceState={{
              education: dateData.selectedPrice
            }}
            dateDescription={{
              date_description: dateData.description
            }}
            imageSrc={getCurrentImage()}
            showSwap={!isEditMode && availableImages.length > 1}
            onSwap={handleSwapImage}
          />
        </div>

        <div className="bottom-button-container">
          <button
            className="edit-btn"
            onClick={() =>
              router.push(
                isEditMode
                  ? "/create-date/description?new_edit=true"
                  : "/create-date/choose-city?edit=true"
              )
            }
            disabled={isSubmitting}
          >
            EDIT
          </button>
          <button
            className="post-date-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmitDate}
          >
            {isSubmitting ? (
              <>
                <span className="spin-loader-button"></span>
                {isEditMode ? "Updating..." : "Posting..."}
              </>
            ) : !canSubmitDate ? (
              "PREPARING..."
            ) : (
              isEditMode ? "UPDATE DATE" : "POST DATE"
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
          padding: calc(24px + env(safe-area-inset-top, 0px)) 16px calc(120px + env(safe-area-inset-bottom, 0px));
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scroll-padding-top: 24px;
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

        .preview-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto 32px;
        }

        .date-card-preview {
          background: transparent;
          border: 1px solid #222222;
          border-radius: 16px;
          overflow: hidden;
          max-width: 500px;
          margin: 0 auto 32px;
        }

        .date-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
        }

        .swap-image-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.9);
          color: #FFFFFF;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 10;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .swap-image-btn:hover {
          background: rgba(0, 0, 0, 0.95);
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          font-weight: 600;
          color: #F24462;
          font-family: "Inter", -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, sans-serif;
        }

        .price-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 200, 83, 0.95);
          backdrop-filter: blur(8px);
          color: #FFFFFF;
          padding: 6px 14px;
          border-radius: 6px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 700;
        }

        .date-card-details {
          padding: 20px;
          background: #000000;
        }

        .card-header {
          margin-bottom: 20px;
        }

        .user-name-age {
          font-size: 22px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 8px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .name-text {
          color: #FFFFFF;
        }

        .age-text {
          color: #F24462;
        }

        .location-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #999999;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .category-icon-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid #333333;
          padding: 6px 12px;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
        }

        .aspiration-box {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid #222222;
          border-bottom: 1px solid #222222;
          margin-bottom: 20px;
        }

        .aspiration-title {
          font-size: 20px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 6px;
        }

        .aspiration-subtitle {
          font-size: 11px;
          font-weight: 700;
          color: #999999;
          letter-spacing: 1px;
        }

        .details-box {
          margin-bottom: 20px;
        }

        .details-title {
          font-size: 15px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 10px;
        }

        .details-content {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .details-label {
          color: #888888;
        }

        .details-value {
          color: #FFFFFF;
          font-weight: 600;
        }

        .interested-box {
          margin-bottom: 20px;
        }

        .interested-title {
          font-size: 15px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .interested-text {
          font-size: 13px;
          color: #CCCCCC;
          line-height: 1.6;
        }

        .super-interested-box {
          display: flex;
          gap: 14px;
          margin-bottom: 20px;
          padding: 18px;
          background: rgba(242, 68, 98, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(242, 68, 98, 0.15);
        }

        .star-icon {
          font-size: 28px;
          color: #F24462;
          line-height: 1;
          flex-shrink: 0;
        }

        .super-interested-content {
          flex: 1;
        }

        .super-interested-title {
          font-size: 15px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 6px;
        }

        .super-interested-price {
          font-size: 13px;
          color: #CCCCCC;
          margin-bottom: 4px;
        }

        .super-interested-price strong {
          color: #FFFFFF;
          font-weight: 700;
          font-size: 14px;
        }

        .suggested-gift {
          font-size: 11px;
          color: #888888;
        }

        .description-box {
          font-size: 13px;
          color: #CCCCCC;
          line-height: 1.7;
        }

        .description-box p {
          margin: 0;
        }

        .date-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .date-title {
          margin: 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #FFFFFF;
        }

        .edit-icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #F24462;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-icon-btn:hover {
          background: rgba(242, 68, 98, 0.2);
        }

        .date-card-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-icon {
          color: #888888;
          flex-shrink: 0;
        }

        .info-text {
          flex: 1;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-value {
          color: #CCCCCC;
        }

        .edit-link {
          background: none;
          border: none;
          color: #F24462;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }

        .date-card-description {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .date-card-description p {
          margin: 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          color: #CCCCCC;
          line-height: 1.5;
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
          gap: 12px;
        }

        .edit-btn {
          flex: 1;
          max-width: 200px;
          height: 52px;
          background: transparent;
          border: 1px solid #333333;
          border-radius: 12px;
          color: #FFFFFF;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover:not(:disabled) {
          border-color: #555555;
          background: rgba(255, 255, 255, 0.05);
        }

        .edit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .post-date-btn {
          flex: 1;
          max-width: 200px;
          height: 52px;
          background: #F24462;
          border: none;
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
        }

        .post-date-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .post-date-btn:disabled {
          background: #1A1A1A;
          border-color: #1A1A1A;
          color: #666666;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          min-height: 100dvh;
          color: #CCCCCC;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }

        @media (max-width: 767px) {
          .date-card-preview {
            border-radius: 12px;
          }

          .price-badge {
            font-size: 14px;
            padding: 6px 12px;
          }

          .date-card-details {
            padding: 16px;
          }

          .date-title {
            font-size: 18px;
          }
        }

        @media (min-width: 768px) {
          .create-date-content {
            padding: 40px 32px;
          }

          .page-title {
            font-size: 36px;
          }

          .page-subtitle {
            font-size: 18px;
            margin-bottom: 40px;
          }

          .date-card-preview {
            max-width: 600px;
          }

          .date-card-details {
            padding: 24px;
          }

          .date-title {
            font-size: 24px;
          }

          .bottom-button-container {
            padding: 24px 32px;
          }

          .edit-btn {
            height: 56px;
            font-size: 18px;
            max-width: 240px;
          }

          .post-date-btn {
            height: 56px;
            font-size: 18px;
            max-width: 240px;
          }
        }
        `}</style>
      </div>
    </div>
      <ConfirmDate
        isOpen={confirmPopup}
        toggle={toggleConfirm}
        onClosePage={handleClosePage}
      />
    </>
  );
}

export default CreateReview;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
