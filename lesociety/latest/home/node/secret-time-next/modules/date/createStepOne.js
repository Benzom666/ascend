import React from "react";
import { Field, reduxForm } from "redux-form";
import validate from "modules/auth/forms/validate/validate";
import { FiArrowRight } from "react-icons/fi";
import { CustomIcon } from "core/icon";
import { useSelector } from "react-redux";
import CreateDateHeader from "@/core/CreateDateHeader";
import Image from "next/image";
const BrunchImg = "/assets/img/Brunch Date.png";
const EveningImg = "/assets/img/Evening Date.png";
const SportyImg = "/assets/img/Get Sporty.png";
const ClassImg = "/assets/img/Take a class.png";
const WineImg = "/assets/img/Wine & Dine.png";
const BottlesImg = "/assets/img/Bottles & Dance.png";
const EntertainmentImg = "/assets/img/Entertainment  & Sports.png";

const CreateStepOne = (props) => {
  const { handleSubmit, previousPage, invalid, onClose, confirmPopup } = props;
  const state = useSelector((state) => state.form.CreateStepOne);

  const experienceGroups = [
    {
      title: "Flex on time?",
      options: [
        {
          id: "MorningBeverage",
          displayLabel: "Brunch",
          backendLabel: "Brunch Date",
          description: "Perfect when you're free mornings to early afternoon.",
          category: "standard_class_date",
          badge: "Budget",
          image: BrunchImg,
          icon: <CustomIcon.Sun color={"#AFABAB"} size={20} />,
        },
        {
          id: "EveningDate",
          displayLabel: "Evening",
          backendLabel: "Evening Date",
          description: "Perfect when you're free evenings and nights.",
          category: "standard_class_date",
          badge: "Budget",
          image: EveningImg,
          icon: <CustomIcon.Moon color={"#AFABAB"} size={20} />,
        },
      ],
    },
    {
      title: "Crave a vibe?",
      options: [
        {
          id: "GetSporty",
          displayLabel: "Get Sporty",
          backendLabel: "Get Sporty",
          description:
            "Adventure dates with a splash twist-think golf, go-karts, kayaking, or anything with a thrill.",
          category: "middle_class_dates",
          badge: "Mid",
          image: SportyImg,
          icon: <CustomIcon.Sporty color={"#AFABAB"} size={20} />,
        },
        {
          id: "TakeClass",
          displayLabel: "Take A Class",
          backendLabel: "Take A Class",
          description:
            "Fun classes or activities: gym, pilates, painting, pottery, or any creative moment.",
          category: "middle_class_dates",
          badge: "Mid",
          image: ClassImg,
          icon: <CustomIcon.TakeClass color={"#AFABAB"} size={20} />,
        },
      ],
    },
    {
      title: "A night out?",
      options: [
        {
          id: "WineDine",
          displayLabel: "Wine & Dine",
          backendLabel: "Wine & Dine",
          description:
            "Make the most of the night with upscale dining and conversation.",
          category: "middle_class_dates",
          badge: "Lux",
          image: WineImg,
          icon: <CustomIcon.WineDine color={"#AFABAB"} size={20} />,
        },
        {
          id: "BottlesDance",
          displayLabel: "Bottles & Dance",
          backendLabel: "Bottles & Dance",
          description:
            "Make the most of the night with a night out-VIP style.",
          category: "executive_class_dates",
          badge: "Lux",
          image: BottlesImg,
          icon: <CustomIcon.BottlesDance color={"#AFABAB"} size={20} />,
        },
      ],
    },
    {
      title: "",
      options: [
        {
          id: "Entertainmentsports",
          displayLabel: "Entertainment & Sports",
          backendLabel: "Entertainment & Sports",
          description:
            "Live concerts, Broadway shows, or a memorable night out.",
          category: "middle_class_dates",
          badge: "Mid",
          image: EntertainmentImg,
          icon: <CustomIcon.EntertainmentSports color={"#AFABAB"} size={20} />,
        },
      ],
    },
  ];

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell">
          <CreateDateHeader
            activeStep={1}
            onBack={previousPage}
            onClose={onClose}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>What kind of outing do you want him to take you on?</h2>
                <div className="intro-subtitle">
                  When a man chooses Interested, he&apos;s saying: I&apos;ll take
                  you on the date you create here and cover everything.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender step-1 experience-section">
              <form
                onSubmit={handleSubmit}
                style={{
                  paddingRight: "10px",
                  paddingLeft: "10px",
                  paddingTop: "0px",
                }}
              >
                <div className="inner_container">
                  <Field
                    name="search_type"
                    component={({ input }) => (
                      <>
                        {experienceGroups.map((group, groupIndex) => (
                          <div className="experience-group" key={groupIndex}>
                            {group.title && (
                              <div className="experience-group-title">
                                {group.title}
                              </div>
                            )}
                            <div
                              className={`experience-grid ${
                                group.options.length === 1 ? "single" : ""
                              }`}
                            >
                              {group.options.map((option) => {
                                const isSelected = input.value?.id === option.id;
                                return (
                                  <button
                                    type="button"
                                    key={option.id}
                                    className={`experience-card ${
                                      isSelected ? "is-selected" : ""
                                    }`}
                                    onClick={() =>
                                      input.onChange({
                                        id: option.id,
                                        label: option.backendLabel,
                                        displayLabel: option.displayLabel,
                                        icon: option.icon,
                                        category: option.category,
                                      })
                                    }
                                  >
                                    <span className="experience-badge">
                                      {option.badge}
                                    </span>
                                    <span className="experience-card-image">
                                      <Image
                                        src={option.image}
                                        alt={option.displayLabel}
                                        fill
                                        sizes="(max-width: 600px) 50vw, 200px"
                                        style={{ objectFit: "cover" }}
                                      />
                                    </span>
                                    <span className="experience-card-content">
                                      <div className="experience-card-title">
                                        {option.displayLabel}
                                      </div>
                                      <div className="experience-card-desc">
                                        {option.description}
                                      </div>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  />
                  <div className="bottom-mobile register-bottom">
                    <div className="secret-input type-submit next-prev">
                      {!confirmPopup && (
                        <button
                          type="submit"
                          className="next"
                          disabled={!state?.values?.search_type || invalid}
                        >
                          Next <FiArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default reduxForm({
  form: "CreateStepOne",
  destroyOnUnmount: false,
  validate,
  enableReinitialize: true,
})(CreateStepOne);
