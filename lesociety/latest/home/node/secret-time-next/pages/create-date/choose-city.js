import React, { useState, useEffect } from "react";
import { initialize } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { FiMapPin } from "react-icons/fi";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import {
  fetchLiveLocation,
  fetchRealLocation,
} from "@/modules/auth/forms/steps/validateRealTime";
import CreateDateIntroPopup from "@/components/popups/CreateDateIntroPopup";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import { apiRequest, countriesCode, dateCategory } from "utils/Utilities";
import {
  getActiveDateCount,
  getLatestDraftDate,
  normalizeImageIndex,
} from "utils/dateState";
import { useCreateDateBrowserBack } from "utils/createDateNavigation";
import { markCreateDateProgressFromStep } from "utils/createDateProgress";
import { formatDateDuration } from "utils/dateDuration";
import { formatDisplayLocation, formatDisplayText } from "utils/formatDisplayText";
import {
  activateCreateDateFlow,
  clearCreateDateFlow,
  getCreateDateEntryPath,
  getCreateDateResumePath,
  isExistingDateEditFlow,
  isValidCreateDatePath,
  persistCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { consumeCreateDateIntroSkipOnce, hasCompletedFirstLogin } from "utils/createDateIntroState";
import {
  CREATE_DATE_LIMIT_PATH,
  redirectToCreateDateLimit,
  useCreateDateAccessGuard,
} from "utils/createDateAccessGuard";
import Loader from "@/modules/Loader/Loader";
import ConfirmDate from "@/modules/date/confirmDate";

function ChooseCity() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer?.user);
  const isExistingEditQuery = Boolean(router?.query?.new_edit);
  const isDraftEditQuery = Boolean(router?.query?.edit);
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [introCheckComplete, setIntroCheckComplete] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [draftDateLoading, setDraftDateLoading] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [serverDraftResolved, setServerDraftResolved] = useState(false);
  // Removed showLimitPopup,  activeDateCheckResolved - using limit check removed - now at button
  const shouldGuardCreateAccess = !isExistingEditQuery && !isDraftEditQuery;
  // REMOVED: useCreateDateAccessGuard - limit check moved to Create Date button
  // This was causing unnecessary network calls and button lag
  useCreateDateBrowserBack(router);

  const normalizeLookupValue = (value = "") =>
    String(value || "").trim().toLowerCase();

  // Capitalize first letter of each word
  const capitalizeWords = (str = "") => {
    if (!str) return "";
    return String(str)
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getPlaceCountryCode = (place = {}) =>
    normalizeLookupValue(place?.country?.[0]?.short_code || "");

  const getPlaceProvinceCode = (place = {}) => {
    const provinceCode = place?.province?.[0]?.short_code || "";
    return normalizeLookupValue(
      provinceCode.includes("-") ? provinceCode.split("-")[1] : provinceCode
    );
  };

  const sortSuggestionsForUser = (places = []) => {
    const preferredCountryCode = normalizeLookupValue(user?.country_code);
    const preferredProvince = normalizeLookupValue(user?.province);
    const preferredCity = normalizeLookupValue(user?.location);

    return [...places].sort((left, right) => {
      const score = (place) => {
        let total = 0;
        if (preferredCountryCode && getPlaceCountryCode(place) === preferredCountryCode) {
          total += 100;
        }
        if (preferredProvince && getPlaceProvinceCode(place) === preferredProvince) {
          total += 20;
        }
        if (preferredCity && normalizeLookupValue(place?.name) === preferredCity) {
          total += 10;
        }
        return total;
      };

      return (
        score(right) - score(left) ||
        String(left?.label || left?.name || "").localeCompare(
          String(right?.label || right?.name || "")
        )
      );
    });
  };

  const buildCityOption = (
    locationName,
    provinceCode,
    countryCode,
    countryName
  ) => {
    if (!locationName) return null;

    // Capitalize city name and province code
    const capitalizedCity = capitalizeWords(locationName);
    const capitalizedProvince = provinceCode ? provinceCode.toUpperCase() : "";
    
    const label = capitalizedProvince
      ? `${capitalizedCity}, ${capitalizedProvince}`
      : capitalizedCity;

    return {
      label,
      name: capitalizedCity,
      country:
        countryCode || countryName
          ? [
              {
                short_code: countryCode || "",
                text: countryName || "",
              },
            ]
          : [],
      province: capitalizedProvince
        ? [
            {
              short_code: capitalizedProvince,
              text: capitalizedProvince,
            },
          ]
        : [],
    };
  };

  const getResumePathFromDraft = (draftedDate, selectedDateTypeId) => {
    const selectedDuration = formatDateDuration(draftedDate?.date_length);
    const draftedCountryName =
      Object.keys(countriesCode).find(
        (key) =>
          countriesCode[key]?.toLowerCase() ===
          draftedDate?.country_code?.toLowerCase()
      ) ||
      draftedDate?.country ||
      "";
    const draftedCityData = draftedDate?.location
      ? {
          label: draftedDate?.province
            ? formatDisplayLocation(draftedDate?.location, draftedDate?.province)
            : formatDisplayText(draftedDate?.location),
          name: draftedDate?.location,
          country: draftedDate?.country_code
            ? [
                {
                  short_code: draftedDate?.country_code,
                  text: draftedCountryName,
                },
              ]
            : [],
          province: draftedDate?.province
            ? [{ short_code: draftedDate?.province?.toUpperCase() }]
            : [],
        }
      : null;

    return (
      getCreateDateResumePath({
        flowMode: "draft-edit",
        city: draftedDate?.province
          ? `${formatDisplayText(draftedDate?.location)}, ${draftedDate?.province?.toUpperCase()}`
          : formatDisplayText(draftedDate?.location),
        cityData: draftedCityData,
        selectedDateType: selectedDateTypeId || null,
        selectedPrice: draftedDate?.price,
        selectedDuration,
        selectedDurationValue: draftedDate?.date_length,
        description: draftedDate?.date_details || "",
        dateId: draftedDate?._id,
      }) || "/create-date/review"
    );
  };

  const hydrateLocalFlow = (data) => {
    if (typeof window === "undefined") return;
    writeCreateDateFlow(data);
  };

  const persistResumePath = (path = router.asPath) => {
    persistCreateDateResumePath(path);
  };

  const toggleConfirm = () => setConfirmPopup((prev) => !prev);

  const handleClosePage = () => {
    persistResumePath();
    router.push("/user/user-list");
  };

  const fetchDraftedDate = async () => {
    // OG logic: Only skip draft check if editing existing draft (edit=true)
    // Allow draft check when creating new date (new_edit is fine)
    if (
      !user?.user_name ||
      isDraftEditQuery
    ) {
      setServerDraftResolved(true);
      return;
    }

    // PERFORMANCE FIX: Don't show loading spinner - check happens in background
    // This prevents the slow UI response when clicking "Create New Date"
    setDraftDateLoading(false);
    try {
      // Use the dedicated /date/create-entry endpoint instead of fetching the
      // user's full date list. The old call paginated up to 100 docs and then
      // filtered client-side via getLatestDraftDate; the create-entry endpoint
      // runs two indexed queries (one findOne for the draft, one
      // countDocuments for the active count) in parallel server-side and
      // returns just what we need. Cuts both bandwidth and latency on the
      // critical "Create New Date" click path.
      const res = await apiRequest({
        url: "date/create-entry",
        timeout: 3000,
      });

      const draftedDate = res?.data?.data?.draft_date || null;

      if (!draftedDate) {
        const localFlow = readCreateDateFlow();
        const isStaleDraftBackedFlow =
          !isExistingDateEditFlow(localFlow) && Boolean(localFlow?.dateId);

        if (isStaleDraftBackedFlow) {
          clearCreateDateFlow({ flowMode: "create" });
          clearCreateDateFlow({ flowMode: "draft-edit" });
          activateCreateDateFlow({ 
            flowMode: "create",
            // CRITICAL FIX: Clear image_index to prevent reusing deleted date's photo
            image_index: undefined,
          });
        }
        setDraftDateLoading(false);
        setServerDraftResolved(true);
        return;
      }

      const selectedDateType = dateCategory.find(
        (item) =>
          item?.label === draftedDate?.standard_class_date ||
          item?.label === draftedDate?.middle_class_dates ||
          item?.label === draftedDate?.executive_class_dates
      );
      const countryName = Object.keys(countriesCode).find(
        (key) =>
          countriesCode[key]?.toLowerCase() ===
          draftedDate?.country_code?.toLowerCase()
      );
      const draftedCity = {
        name: draftedDate?.location,
        country: [
          {
            short_code: draftedDate?.country_code,
            text: countryName,
          },
        ],
        label: draftedDate?.province
          ? formatDisplayLocation(draftedDate?.location, draftedDate?.province)
          : formatDisplayText(draftedDate?.location),
        province: draftedDate?.province
          ? [{ short_code: draftedDate?.province?.toUpperCase() }]
          : [],
      };

      dispatch(
        initialize("ChooseCity", {
          enter_country: {
            label: countryName || draftedDate?.country,
            value: draftedDate?.country_code,
          },
          enter_city: draftedCity,
        })
      );
      dispatch(
        initialize("CreateStepOne", {
          search_type: selectedDateType,
          dateId: draftedDate?._id,
          image_index: normalizeImageIndex(draftedDate?.image_index),
        })
      );
      dispatch(
        initialize("CreateStepTwo", {
          education: draftedDate?.price,
          enter__category: user?.categatoryId,
          enter__aspiration: user?.aspirationId,
        })
      );
      dispatch(
        initialize("CreateStepThree", { education: draftedDate?.date_length })
      );
      dispatch(
        initialize("CreateStepFour", {
          date_description: draftedDate?.date_details,
        })
      );

      const flowData = readCreateDateFlow();
      const sameDraftFlow =
        !isExistingDateEditFlow(flowData) &&
        String(flowData?.dateId || "") === String(draftedDate?._id || "");
      const resumePath = sameDraftFlow
        ? getCreateDateResumePath(flowData, { includeExistingEdit: false })
        : getResumePathFromDraft(draftedDate, selectedDateType?.id);

      hydrateLocalFlow({
        flowMode: "draft-edit",
        editMode: false,
        city: draftedCity.label,
        cityData: draftedCity,
        selectedDateType: selectedDateType?.id || null,
        selectedPrice: draftedDate?.price,
        selectedDuration: formatDateDuration(draftedDate?.date_length),
        selectedDurationValue: draftedDate?.date_length,
        description: draftedDate?.date_details || "",
        dateId: draftedDate?._id,
        image_index:
          typeof draftedDate?.image_index === "number"
            ? draftedDate.image_index
            : 0,
        selectedAspirationName: user?.aspirationName || "",
        resumePath,
      });

      setCity(draftedCity.label);
      setSelectedCity(draftedCity);
      setServerDraftResolved(true);
      
      // PERFORMANCE FIX: Use replace instead of push to prevent back button issues
      // and navigate smoothly without delay
      router.replace(resumePath);
    } catch (err) {
      console.error("Failed to fetch drafted date", err);
      setServerDraftResolved(true);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    activateCreateDateFlow({
      flowMode: isExistingEditQuery
        ? "edit-existing"
        : isDraftEditQuery
        ? "draft-edit"
        : "create",
    });
  }, [isDraftEditQuery, isExistingEditQuery, router.isReady]);

  // Limit check is now handled by useCreateDateAccessGuard hook - no need for duplicate logic here
  // Removed fetchActiveDates useEffect - limit check now handled by useCreateDateAccessGuard hook

  // Check if user has dismissed the intro popup before
  useEffect(() => {
    if (!router.isReady) return;
    if (introCheckComplete) return;
    
    // Skip intro for edit modes - ALWAYS skip, regardless of other state changes
    if (isDraftEditQuery || isExistingEditQuery) {
      setIntroCheckComplete(true);
      setShowIntroPopup(false); // Explicitly set to false to prevent showing
      return;
    }
    
    // FIXED: Only show intro if user hasn't dismissed it AND we're on initial load (not resuming draft)
    // This prevents the glitchy popup behavior when resuming a draft
    const hideIntro = localStorage.getItem("hide_create_date_intro") === "true";
    const hasDraftFlow = Boolean(readCreateDateFlow()?.dateId);
    const skipIntroOnce = consumeCreateDateIntroSkipOnce(user);
    const isFirstLogin = !hasCompletedFirstLogin(user);
    
    setIntroCheckComplete(true);
    
    // Show popup only if: not hidden AND no draft flow in progress AND has completed first login before
    if (!hideIntro && !hasDraftFlow && !skipIntroOnce && !isFirstLogin) {
      setShowIntroPopup(true);
    } else {
      setShowIntroPopup(false);
    }
  }, [
    introCheckComplete,
    router.isReady,
    isDraftEditQuery,
    isExistingEditQuery,
    user,
  ]);

  // Removed duplicate popup trigger - now handled in the useEffect above

  useEffect(() => {
    // REMOVED: limit check removed - limit validation now at button

    // OG behavior: fetch draft on mount (matching OG's simple useEffect)
    fetchDraftedDate();
  }, [
    isDraftEditQuery,
    user?.user_name,
  ]);

  useEffect(() => {
    if (
      !router.isReady ||
      isDraftEditQuery ||
      isExistingEditQuery ||
      
      
      
      !serverDraftResolved
    ) {
      return;
    }
    try {
      const savedData = readCreateDateFlow();
      const resumePath = getCreateDateResumePath(savedData, {
        includeExistingEdit: false,
      });
      if (
        resumePath &&
        resumePath !== router.asPath &&
        savedData?.cityData &&
        savedData?.dateId &&
        isValidCreateDatePath(resumePath)
      ) {
        router.replace(resumePath);
      }
    } catch (err) {
      console.error("Failed to restore resume path", err);
    }
  }, [
    isDraftEditQuery,
    isExistingEditQuery,
    
    
    router.isReady,
    router.asPath,
    serverDraftResolved,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    const existingResumePath = getCreateDateResumePath(readCreateDateFlow(), {
      includeExistingEdit: false,
    });
    if (
      router.pathname === "/create-date/choose-city" &&
      !isDraftEditQuery &&
      !isExistingEditQuery &&
      existingResumePath &&
      existingResumePath !== router.asPath
    ) {
      return;
    }
    persistResumePath();
  }, [
    isDraftEditQuery,
    isExistingEditQuery,
    router.isReady,
    router.asPath,
    router.pathname,
  ]);

  useEffect(() => {
    try {
      const savedData = readCreateDateFlow();
      
      // Only use saved city if in edit mode OR if we're resuming an in-progress flow
      const shouldUseSavedCity = (isDraftEditQuery || isExistingEditQuery) && 
                                  savedData?.cityData;
      
      if (shouldUseSavedCity) {
        if (savedData.city) setCity(savedData.city);
        if (savedData.cityData) setSelectedCity(savedData.cityData);
        return;
      }

      // For new dates, always prefill with user's default city
      const defaultCity = buildCityOption(
        user?.location,
        user?.province,
        user?.country_code,
        user?.country
      );

      if (defaultCity) {
        setCity(defaultCity.label);
        setSelectedCity(defaultCity);
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  }, [user?.country, user?.country_code, user?.location, user?.province, isDraftEditQuery, isExistingEditQuery]);

  useEffect(() => {
    router.prefetch("/create-date/choose-date-type");
  }, [router]);

  const handleCloseLimit = () => {
    
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/user/user-list");
    }
  };

  // REMOVED: limit check removed

  // Removed unnecessary loader - limit check moved to button

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setSelectedCity(null);
    setLocationError("");

    if (value.length >= 2) {
      setLoading(true);
      const preferredCountryCode = user?.country_code || undefined;
      fetchRealLocation(value, preferredCountryCode, (places) => {
        const normalizedPlaces = sortSuggestionsForUser(places || []);
        if (!normalizedPlaces.length && preferredCountryCode) {
          fetchRealLocation(value, undefined, (fallbackPlaces) => {
            const orderedFallbackPlaces = sortSuggestionsForUser(
              fallbackPlaces || []
            );
            setSuggestions(orderedFallbackPlaces);
            setShowSuggestions(orderedFallbackPlaces.length > 0);
            setLoading(false);
          });
          return;
        }
        setSuggestions(normalizedPlaces);
        setShowSuggestions(normalizedPlaces.length > 0);
        setLoading(false);
      });
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (cityOption) => {
    const displayLabel = cityOption?.label || cityOption?.name || "";
    setCity(displayLabel);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedCity(cityOption);
    setLocationError("");

    try {
      hydrateLocalFlow({
        ...readCreateDateFlow(),
        flowMode: isExistingEditQuery
          ? "edit-existing"
          : isDraftEditQuery
          ? "draft-edit"
          : "create",
        editMode: isExistingEditQuery,
        city: displayLabel,
        cityData: cityOption,
      });
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      setLocationError("Location is not supported on this device.");
      return;
    }

    setLocationError("");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (
            position.coords.latitude === undefined ||
            position.coords.longitude === undefined
          ) {
            setLocationError("Could not determine your current location.");
            return;
          }

          const location = await fetchLiveLocation(
            position.coords.latitude,
            position.coords.longitude
          );

          if (Array.isArray(location) && location[0]) {
            const resolvedCity = {
              label:
                location[0].label +
                ", " +
                location[0].province[0]?.short_code?.split("-")[1],
              name: location[0].name,
              country: [location[0].country[0]],
              province: [location[0].province[0]],
            };
            handleSelectCity(resolvedCity);
            return;
          }

          setLocationError("Could not detect your city. Try typing it manually.");
        } catch (error) {
          console.error("Failed to resolve current city:", error);
          setLocationError("Could not detect your city. Try typing it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        if (error?.code === error.PERMISSION_DENIED) {
          setLocationError("Location access was denied. Enable it and try again.");
        } else if (error?.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Try again.");
        } else {
          setLocationError("Could not get your current location. Try again.");
        }

        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleNext = async () => {
    if (!city.trim()) {
      alert("Please enter a city");
      return;
    }
    if (!selectedCity) {
      alert("Please select a city from the suggestions");
      return;
    }

    dispatch(
      initialize("ChooseCity", {
        enter_country: {
          label: selectedCity?.country?.[0]?.text || user?.country || "",
          value: selectedCity?.country?.[0]?.short_code || user?.country_code || "",
        },
        enter_city: selectedCity,
      })
    );

    writeCreateDateFlow({
      flowMode: isExistingEditQuery
        ? "edit-existing"
        : isDraftEditQuery
        ? "draft-edit"
        : "create",
      editMode: isExistingEditQuery,
      city,
      cityData: selectedCity,
    });

    markCreateDateProgressFromStep(0);
    setIsNavigating(true);

    try {
      await router.push(
        isExistingEditQuery
          ? "/create-date/choose-date-type?new_edit=true"
          : isDraftEditQuery
          ? "/create-date/choose-date-type?edit=true"
          : "/create-date/choose-date-type"
      );
    } catch (error) {
      setIsNavigating(false);
    }
  };

  // REMOVED: LS GIF loader - page renders immediately for better UX
  // if (draftDateLoading) {
  //   return <Loader />;
  // }

  return (
    <>
    <div className="create-date-page" style={{ backgroundColor: '#000' }}>
      <CreateDateNewHeader
        activeStep={0}
        onBack={() => router.push("/user/user-list")}
        onClose={toggleConfirm}
        showBack={false}
      />

      <div className="create-date-content">
        <h1 className="page-title">Where does your adventure&nbsp;start?</h1>
        <p className="page-subtitle">Pick your city.</p>
        <p className="page-note">
          Want to be discoverable in multiple cities? Just create a separate
          date for each one.
        </p>

        <div className="input-section">
          <div className="input-wrapper">
            <svg
              className="input-icon-left"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="#888888"
              />
            </svg>
            <input
              type="text"
              value={city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              className="city-input"
              autoComplete="off"
            />
            <button
              className="input-icon-right"
              onClick={handleUseCurrentLocation}
              type="button"
              title="Use current location"
              disabled={isLocating}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="3" stroke="#888888" strokeWidth="2" />
                <circle cx="12" cy="12" r="9" stroke="#888888" strokeWidth="2" />
                <line
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="5"
                  stroke="#888888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="19"
                  x2="12"
                  y2="23"
                  stroke="#888888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="1"
                  y1="12"
                  x2="5"
                  y2="12"
                  stroke="#888888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="19"
                  y1="12"
                  x2="23"
                  y2="12"
                  stroke="#888888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion?.label || suggestion?.name}-${index}`}
                  className="suggestion-item"
                  onClick={() => handleSelectCity(suggestion)}
                  type="button"
                >
                  <FiMapPin size={16} />
                  {suggestion?.label || suggestion?.name}
                </button>
              ))}
            </div>
          )}

          {loading && !suggestions.length && (
            <div className="suggestions-loading">Searching cities...</div>
          )}

          {locationError && <p className="location-error">{locationError}</p>}
        </div>
      </div>

      <div className="bottom-button-container">
        <button
          className={`next-button ${
            !selectedCity || isNavigating ? "disabled" : ""
          }`}
          onClick={handleNext}
          disabled={!selectedCity || isNavigating}
          aria-busy={isNavigating}
        >
          <span
            className={`button-label ${
              isNavigating ? "button-label-hidden" : ""
            }`}
          >
            NEXT <span className="arrow-icon">→</span>
          </span>
          {isNavigating && (
            <span className="button-spinner">
              <span className="spin-loader-button"></span>
            </span>
          )}
        </button>
      </div>

      {showIntroPopup && (
        <CreateDateIntroPopup
          isOpen={showIntroPopup}
          onClose={() => setShowIntroPopup(false)}
          onDoNotShowAgain={() => {
            localStorage.setItem("hide_create_date_intro", "true");
            setShowIntroPopup(false);
          }}
        />
      )}

      )}

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

        .page-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: clamp(18px, 5vw, 28px);
          font-weight: 600;
          line-height: 1.15;
          color: #ffffff;
          text-align: center;
          white-space: nowrap;
          max-width: 100%;
          margin: 0 auto 12px;
        }

        .page-subtitle {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #cccccc;
          text-align: center;
          margin: 0 0 16px 0;
        }

        .page-note {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #888888;
          text-align: center;
          line-height: 1.5;
          margin: 0 0 48px 0;
          padding: 0 16px;
        }

        .input-section {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon-left {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #888888;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-icon-right {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #888888;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: all 0.2s ease;
        }

        .input-icon-right:hover {
          color: #ffffff;
        }

        .input-icon-right:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .city-input {
          width: 100%;
          padding: 18px 54px 18px 52px;
          font-size: 16px;
          background: #1a1a1a;
          color: #ffffff;
          border: 1px solid #333333;
          border-radius: 12px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          transition: all 0.3s ease;
        }

        .city-input:focus {
          outline: none;
          border-color: #ff3b81;
          box-shadow: 0 0 0 1px #ff3b81;
        }

        .city-input::placeholder {
          color: #666666;
        }

        .location-error,
        .suggestions-loading {
          margin: 12px 4px 0;
          color: #ff7a7a;
          font-size: 14px;
          line-height: 1.4;
        }

        .suggestions-loading {
          color: #bcbcc8;
        }

        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #0a0a0a;
          border: 1px solid #333333;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 10;
          overflow: hidden;
          max-height: 280px;
          overflow-y: auto;
        }

        .suggestion-item {
          width: 100%;
          padding: 14px 18px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #1a1a1a;
          color: #ffffff;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 15px;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s ease;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: rgba(242, 68, 98, 0.08);
        }

        .bottom-button-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
          background: #000000;
          display: flex;
          justify-content: center;
          z-index: 20;
        }

        .next-button {
          width: 100%;
          max-width: 420px;
          height: 52px;
          background: #F24462;
          border: 1px solid #F24462;
          border-radius: 12px;
          color: #ffffff;
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

        .next-button.disabled {
          background: #1A1A1A;
          border-color: #1A1A1A;
          color: #666666;
          cursor: not-allowed;
          opacity: 1;
        }

        .button-label-hidden {
          opacity: 0;
        }

        .button-spinner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
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

export default ChooseCity;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
