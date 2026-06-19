import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { initialize } from "redux-form";
import { useDispatch } from "react-redux";
import CreateDateNewHeader from "@/core/CreateDateNewHeader";
import Image from "next/image";
const BrunchImg = "/assets/img/Brunch Date.png";
const EveningImg = "/assets/img/Evening Date.png";
const SportyImg = "/assets/img/Get Sporty.png";
const ClassImg = "/assets/img/Take a class.png";
const WineImg = "/assets/img/Wine & Dine.png";
const BottlesImg = "/assets/img/Bottles & Dance.png";
const EntertainmentImg = "/assets/img/Entertainment  & Sports.png";
import ConfirmDate from "@/modules/date/confirmDate";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import { useCreateDateBrowserBack } from "utils/createDateNavigation";
import { markCreateDateProgressFromStep } from "utils/createDateProgress";
import {
  activateCreateDateFlow,
  persistCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { useCreateDateAccessGuard } from "utils/createDateAccessGuard";
import { useSelector } from "react-redux";
import Loader from "@/modules/Loader/Loader";

const DATE_TYPES = [
  {
    id: "MorningBeverage",
    label: "Brunch",
    description: "Perfect when you're free mornings to early afternoon",
    time: "10 AM - 2 PM",
    category: "standard_class_date",
    badge: "Low",
    image: BrunchImg,
    section: "flex",
  },
  {
    id: "EveningDate",
    label: "Evening",
    description: "Perfect when you're evening and nights are open",
    time: "6 PM - 10 PM",
    category: "standard_class_date",
    badge: "Low",
    image: EveningImg,
    section: "flex",
  },
  {
    id: "GetSporty",
    label: "Get Sporty",
    description: "Adventure dates with a playful twist - mini-golf, ice skating, kayaking, anything real fun. Get thrilling, anything real thrilling or fun",
    time: "Flexible",
    category: "middle_class_dates",
    badge: "Mid",
    image: SportyImg,
    section: "vibe",
  },
  {
    id: "TakeClass",
    label: "Take A Class",
    description: "Enjoy couples cooking class, pilates class lessons, painting, pottery, or anything creative where you'll learn together",
    time: "Flexible",
    category: "middle_class_dates",
    badge: "Mid",
    image: ClassImg,
    section: "vibe",
  },
  {
    id: "WineDine",
    label: "Wine & Dine",
    description: "Indulge in fine dining, meaningful evening at top restaurants, perfect pairing, and pure indulgence",
    time: "7 PM - Late",
    category: "middle_class_dates",
    badge: "Lux",
    image: WineImg,
    section: "vibe",
  },
  {
    id: "BottlesDance",
    label: "Bottles & Dance",
    description: "VIP tables with bottle lounges or clubs around - VIP style",
    time: "9 PM - Late",
    category: "executive_class_dates",
    badge: "Lux",
    image: BottlesImg,
    section: "vibe",
  },
  {
    id: "Entertainmentsports",
    label: "Entertainment & Sports",
    description: "Live concerts, Broadway shows, courtside seats. Big-stage thrills that make the night unforgettable.",
    time: "Flexible",
    category: "executive_class_dates",
    badge: "Lux",
    image: EntertainmentImg,
    section: "vibe",
  },
];

const DateTypeCard = React.memo(function DateTypeCard({ type, isSelected, onSelect }) {
  const handleClick = useCallback(() => onSelect(type.id), [type.id, onSelect]);
  return (
    <button
      className={`date-type-card ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div className="card-image-wrapper">
        {type.badge && <div className="price-badge">{type.badge}</div>}
        <Image
          src={type.image}
          alt={type.label}
          width={400}
          height={250}
          className={`card-image card-image--${type.id}`}
        />
        <div className="image-gradient-overlay" />
      </div>
      <div className="card-content">
        <div
          className={`card-label ${
            type.id === "TakeClass" || type.id === "BottlesDance"
              ? "card-label-tight"
              : ""
          }`}
        >
          {type.label}
        </div>
        <div className="card-description">{type.description}</div>
      </div>
    </button>
  );
});

const BACKEND_LABEL_MAP = {
  MorningBeverage: "Brunch Date",
  EveningDate: "Evening Date",
  GetSporty: "Get Sporty",
  TakeClass: "Take A Class",
  WineDine: "Wine & Dine",
  BottlesDance: "Bottles & Dance",
  Entertainmentsports: "Entertainment & Sports",
};

function ChooseDateType() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.authReducer?.user);
  const [selectedType, setSelectedType] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  // REMOVED: useCreateDateAccessGuard - limit check moved to Create Date button
  // This was causing unnecessary network calls and button lag
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
    if (!router.isReady) return;
    if (!router?.query?.new_edit) return;

    router.replace("/create-date/description?new_edit=true");
  }, [router, router.isReady, router?.query?.new_edit]);

  useEffect(() => {
    try {
      const savedData = readCreateDateFlow();
      if (savedData && Object.keys(savedData).length) {
        if (savedData.selectedDateType) {
          setSelectedType(savedData.selectedDateType);
        }
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    router.prefetch("/create-date/date-event");
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    persistResumePath();
  }, [router.isReady]);

  const flexTypes = useMemo(
    () => DATE_TYPES.filter((t) => t.section === "flex"),
    []
  );
  const vibeTypes = useMemo(
    () => DATE_TYPES.filter((t) => t.section === "vibe"),
    []
  );

  const flowMode = router?.query?.new_edit
    ? "edit-existing"
    : router?.query?.edit
    ? "draft-edit"
    : "create";
  const isEditFlow = Boolean(router?.query?.new_edit);

  const handleSelect = useCallback(
    (typeId) => {
      setSelectedType(typeId);
      const selectedTypeMeta = DATE_TYPES.find((type) => type.id === typeId);
      writeCreateDateFlow({
        flowMode,
        editMode: isEditFlow,
        selectedDateType: typeId,
        selectedDateLabel: selectedTypeMeta?.label || "",
        selectedDateField: selectedTypeMeta?.category || "",
      });
    },
    [flowMode, isEditFlow]
  );

  const handleNext = useCallback(async () => {
    if (!selectedType) return;
    const selectedTypeMeta = DATE_TYPES.find((type) => type.id === selectedType);
    if (selectedTypeMeta) {
      dispatch(
        initialize("CreateStepOne", {
          search_type: {
            id: selectedTypeMeta.id,
            label:
              BACKEND_LABEL_MAP[selectedTypeMeta.id] || selectedTypeMeta.label,
            displayLabel: selectedTypeMeta.label,
            category: selectedTypeMeta.category,
          },
        })
      );
    }
    markCreateDateProgressFromStep(1);
    setIsNavigating(true);

    try {
      await router.push(
        router?.query?.new_edit
          ? "/create-date/date-event?new_edit=true"
          : router?.query?.edit
          ? "/create-date/date-event?edit=true"
          : "/create-date/date-event"
      );
    } catch (error) {
      setIsNavigating(false);
    }
  }, [selectedType, dispatch, router]);

  // REMOVED: limit check removed

  // Removed unnecessary loader - limit check shouldn't block page rendering during flow navigation

  return (
    <>
    <div className="create-date-page" style={{ backgroundColor: '#000' }}>
      <CreateDateNewHeader
        activeStep={1}
        onBack={() => {
          markCreateDateProgressFromStep(1);
          router.push(
            router?.query?.new_edit
              ? "/create-date/choose-city?new_edit=true"
              : router?.query?.edit
              ? "/create-date/choose-city?edit=true"
              : "/create-date/choose-city"
          );
        }}
        onClose={toggleConfirm}
      />

      <div className="create-date-content">
        <h1 className="page-title">What kind of outing do you want him to take you on?</h1>
        <p className="page-subtitle">
          When a man chooses <strong>Interested</strong>, he's saying: I'll take you on the date you create here and cover everything.
        </p>

        {/* Flex on time? Section */}
        <div className="section-header">Flex on time?</div>
        <div className="date-type-grid">
          {flexTypes.map((type) => (
            <DateTypeCard
              key={type.id}
              type={type}
              isSelected={selectedType === type.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Crave a vibe? Section */}
        <div className="section-header">Crave a vibe?</div>
        <div className="date-type-grid">
          {vibeTypes.map((type) => (
            <DateTypeCard
              key={type.id}
              type={type}
              isSelected={selectedType === type.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <p className="helper-text">
          You will discuss and finalize the exact venue/event in chat.
        </p>
      </div>

      <div className="bottom-button-container">
        <button
          className={`next-button ${
            !selectedType || isNavigating ? "disabled" : ""
          }`}
          onClick={handleNext}
          disabled={!selectedType || isNavigating}
          aria-busy={isNavigating}
        >
          <span className={`button-label ${isNavigating ? "button-label-hidden" : ""}`}>
            NEXT <span className="arrow-icon">→</span>
          </span>
          {isNavigating && <span className="button-spinner"><span className="spin-loader-button"></span></span>}
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

        .page-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 22px;
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
          font-size: 14px;
          font-weight: 400;
          color: #CCCCCC;
          text-align: center;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .page-subtitle strong {
          color: #F24462;
          font-weight: 600;
        }

        .section-header {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #FFFFFF;
          margin: 24px 0 16px 0;
        }

        .date-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }

        .date-type-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .date-type-card:hover {
          border-color: #333333;
        }

        .date-type-card.selected {
          border: 1px solid transparent;
          box-shadow: 0 6px 14px rgba(242, 68, 98, 0.12);
        }

        .date-type-card.selected::before,
        .date-type-card.selected::after {
          content: "";
          position: absolute;
          left: 8px;
          right: 8px;
          height: 2px;
          background: linear-gradient(90deg, rgba(242, 68, 98, 0) 0%, rgba(242, 68, 98, 0.9) 50%, rgba(242, 68, 98, 0) 100%);
          opacity: 0.9;
          z-index: 3;
          border-radius: 10px;
          pointer-events: none;
        }

        .date-type-card.selected::before {
          top: 0;
        }

        .date-type-card.selected::after {
          bottom: 0;
        }

        .card-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #0A0A0A;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }

        .card-image--MorningBeverage {
          object-position: center 20%;
        }

        .card-image--BottlesDance {
          object-position: center 18%;
        }

        .card-image--TakeClass {
          object-position: center 18%;
        }

        .image-gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.6) 35%, transparent 100%);
          pointer-events: none;
        }

        .price-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: rgba(0, 0, 0, 0.8);
          color: #FFFFFF;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 2;
          backdrop-filter: blur(8px);
        }

        .card-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 102px;
          padding: 7px 10px 10px;
          text-align: left;
          background: #000000;
        }

        .card-label {
          min-height: 2.8em;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 3px;
          letter-spacing: 0.24em;
          text-align: center;
          text-wrap: balance;
          line-height: 1.35;
        }

        .card-label-tight {
          letter-spacing: 0.2em;
        }

        .card-description {
          flex: 1;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #888888;
          line-height: 1.4;
        }

        .helper-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #FFFFFF;
          text-align: center;
          margin: 8px 0 80px 0;
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
          align-items: center;
          z-index: 100;
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
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
        }

        .arrow-icon {
          font-size: 18px;
        }

        .button-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
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
          background: #E2466B;
        }

        .next-button.disabled {
          background: #1A1A1A;
          border-color: #1A1A1A;
          color: #666666;
          cursor: not-allowed;
        }

        .next-button :global(.spin-loader-button) {
          margin: 0;
        }

        @media (max-width: 767px) {
          .date-type-grid {
            gap: 8px;
          }

          .card-image-wrapper {
            aspect-ratio: 16 / 10;
          }

          .card-image--MorningBeverage {
            object-position: center 16%;
          }

          .card-image--BottlesDance {
            object-position: center 12%;
          }

          .card-image--TakeClass {
            object-position: center 18%;
          }

          .card-content {
            min-height: 110px;
            padding: 6px 9px 9px;
          }

          .card-label {
            min-height: 2.8em;
            font-size: 14px;
            letter-spacing: 0.22em;
          }

          .card-label-tight {
            letter-spacing: 0.18em;
          }

          .card-description {
            font-size: 10.5px;
          }
        }

        @media (min-width: 768px) {
          .create-date-content {
            padding: 40px 32px;
            max-width: 900px;
            margin: 0 auto;
          }

          .page-title {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .page-subtitle {
            font-size: 16px;
            margin-bottom: 40px;
          }

          .section-header {
            font-size: 20px;
            margin: 32px 0 20px 0;
          }

          .date-type-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .card-image-wrapper {
            aspect-ratio: 16 / 10;
          }

          .card-image--MorningBeverage {
            object-position: center 24%;
          }

          .card-image--BottlesDance {
            object-position: center 14%;
          }

          .card-image--TakeClass {
            object-position: center 14%;
          }

          .card-content {
            min-height: 116px;
            padding: 8px 12px 12px;
          }

          .card-label {
            min-height: 2.9em;
            font-size: 16px;
            letter-spacing: 0.26em;
          }

          .card-label-tight {
            letter-spacing: 0.22em;
          }

          .card-description {
            font-size: 12px;
          }

          .helper-text {
            font-size: 14px;
            margin: 18px 0 120px 0;
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

export default ChooseDateType;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
