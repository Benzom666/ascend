import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useWindowSize from "utils/useWindowSize";
import { CreateDateProvider, useCreateDate } from "./context/CreateDateContext";
import Step1ExperienceMobile from "./components/CreateDateMobile/Step1Experience";
import Step2CategoryMobile from "./components/CreateDateMobile/Step2Category";
import Step3DurationMobile from "./components/CreateDateMobile/Step3Duration";
import Step4DescriptionMobile from "./components/CreateDateMobile/Step4Description";
import Step5PreviewMobile from "./components/CreateDateMobile/Step5Preview";
import Step1ExperienceDesktop from "./components/CreateDateDesktop/Step1Experience";
import Step2CategoryDesktop from "./components/CreateDateDesktop/Step2Category";
import Step3DurationDesktop from "./components/CreateDateDesktop/Step3Duration";
import Step4DescriptionDesktop from "./components/CreateDateDesktop/Step4Description";
import Step5PreviewDesktop from "./components/CreateDateDesktop/Step5Preview";

/**
 * Internal component that uses the CreateDate context
 * Handles step routing and renders appropriate component
 */
const normalizeCityState = (rawCityData, fallbackLabel) => {
  if (!rawCityData) return null;

  const countryItem = Array.isArray(rawCityData.country)
    ? rawCityData.country[0]
    : rawCityData.country;
  const countryLabel =
    countryItem?.text ||
    rawCityData?.country?.text ||
    rawCityData?.country?.label ||
    "";
  const rawCountryCode =
    countryItem?.short_code ||
    rawCityData?.country?.short_code ||
    rawCityData?.country_code ||
    "";
  const countryCode = rawCountryCode
    ? rawCountryCode.toUpperCase().replace(/^([a-z]{2})-.+$/i, "$1")
    : "";

  const cityName =
    rawCityData?.name ||
    (typeof rawCityData?.label === "string"
      ? rawCityData.label.split(",")[0]
      : "") ||
    fallbackLabel ||
    "";

  return {
    enter_city: {
      name: cityName,
      province: rawCityData?.province || [],
    },
    enter_country: {
      label: countryLabel || "Unknown",
      value: countryCode || "XX",
    },
  };
};

const CreateDateFlow = () => {
  const router = useRouter();
  const { width } = useWindowSize();
  const { currentStep, setCity, setUserInfo, setEditMode, goToStep, formData } =
    useCreateDate();

  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const user = useSelector((state) => state?.authReducer?.user);
  const mobile = width < 768;
  const [localCityState, setLocalCityState] = useState(null);

  const resolveLocalCityState = () => {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem("create_date_flow");
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed?.cityData) {
        return normalizeCityState(parsed.cityData, parsed.city);
      }
      if (parsed?.city) {
        return normalizeCityState({ name: parsed.city }, parsed.city);
      }
      return null;
    } catch (err) {
      console.error("Failed to read create_date_flow from localStorage", err);
      return null;
    }
  };

  const resolvedCityState = useMemo(() => {
    if (cityState?.enter_city) return cityState;
    if (localCityState?.enter_city) return localCityState;
    return null;
  }, [cityState, localCityState]);

  // Initialize city and user in context
  useEffect(() => {
    if (cityState?.enter_city) {
      setCity(cityState);
      return;
    }

    const localState = resolveLocalCityState();
    if (localState?.enter_city) {
      setLocalCityState(localState);
      setCity(localState);
    }
  }, [cityState, setCity]);

  useEffect(() => {
    if (user?.user_name) {
      setUserInfo(user);
    }
  }, [user, setUserInfo]);

  // Handle edit mode from URL params
  useEffect(() => {
    if (router.query.new_edit) {
      setEditMode(true, null);
      goToStep(3); // Go to description step for edit
    }
  }, [router.query, setEditMode, goToStep]);

  useEffect(() => {
    if (router.query.drafted === "true" && formData?.dateId) {
      setEditMode(true, formData.dateId);
    }
  }, [router.query.drafted, formData?.dateId, setEditMode]);

  // Protect route - require city selection
  if (!resolvedCityState?.enter_city) {
    if (typeof window !== "undefined") {
      router.push("/create-date/choose-city");
      window.scrollTo(0, 0);
    }
    return null;
  }

  // Render appropriate step component based on current step and device type
  const renderStep = () => {
    if (mobile) {
      // Mobile components
      switch (currentStep) {
        case 0:
          return <Step1ExperienceMobile />;
        case 1:
          return <Step2CategoryMobile />;
        case 2:
          return <Step3DurationMobile />;
        case 3:
          return <Step4DescriptionMobile />;
        case 4:
          return <Step5PreviewMobile />;
        default:
          return <Step1ExperienceMobile />;
      }
    } else {
      // Desktop components
      switch (currentStep) {
        case 0:
          return <Step1ExperienceDesktop />;
        case 1:
          return <Step2CategoryDesktop />;
        case 2:
          return <Step3DurationDesktop />;
        case 3:
          return <Step4DescriptionDesktop />;
        case 4:
          return <Step5PreviewDesktop />;
        default:
          return <Step1ExperienceDesktop />;
      }
    }
  };

  return <>{renderStep()}</>;
};

/**
 * Main Create Date Component
 * Wraps the flow in the CreateDateProvider and handles initialization
 */
const CreateDate = (props) => {
  const router = useRouter();
  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const user = useSelector((state) => state?.authReducer?.user);
  const [initialCityState, setInitialCityState] = useState(null);

  useEffect(() => {
    if (cityState?.enter_city) return;
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem("create_date_flow");
      if (!data) return;
      const parsed = JSON.parse(data);
      const fallbackState = parsed?.cityData
        ? normalizeCityState(parsed.cityData, parsed.city)
        : parsed?.city
        ? normalizeCityState({ name: parsed.city }, parsed.city)
        : null;
      if (fallbackState?.enter_city) {
        setInitialCityState(fallbackState);
      }
    } catch (err) {
      console.error("Failed to initialize city state from localStorage", err);
    }
  }, [cityState]);

  // Get initial data from Redux form if editing
  const stepOneData = useSelector((state) => state?.form?.CreateStepOne?.values);
  const stepTwoData = useSelector((state) => state?.form?.CreateStepTwo?.values);
  const stepThreeData = useSelector(
    (state) => state?.form?.CreateStepThree?.values
  );
  const stepFourData = useSelector(
    (state) => state?.form?.CreateStepFour?.values
  );

  // Compile initial form data from Redux forms (for backward compatibility)
  const initialFormData = {
    search_type: stepOneData?.search_type || null,
    enter__category: stepTwoData?.enter__category || "",
    enter__aspiration: stepTwoData?.enter__aspiration || "",
    education: stepTwoData?.education || "",
    date_duration: stepThreeData?.date_duration || stepThreeData?.education || "",
    date_description: stepFourData?.date_description || "",
    image_index: stepOneData?.image_index || 0,
    dateId: stepOneData?.dateId || null,
  };

  return (
    <CreateDateProvider
      initialData={{
        ...initialFormData,
        cityState: cityState?.enter_city ? cityState : initialCityState,
        user,
      }}
    >
      <CreateDateFlow {...props} />
    </CreateDateProvider>
  );
};

export default CreateDate;
