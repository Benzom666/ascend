import React from "react";
import { Field, reduxForm } from "redux-form";
import { useSelector } from "react-redux";
import { FiArrowRight } from "react-icons/fi";
import validate from "modules/auth/forms/validate/validate";
import CreateDateHeader from "@/core/CreateDateHeader";

const durationOptions = [
  {
    id: "1",
    title: "1-2 hours",
    description: "A quick drink or coffee.",
    value: "1-2 hours",
  },
  {
    id: "2",
    title: "2-3 hours",
    description: "Dinner and a relaxed evening.",
    value: "2-3 hours",
  },
  {
    id: "3",
    title: "3-4 hours",
    description: "Dinner + drinks or a show.",
    value: "3-4 hours",
  },
  {
    id: "4",
    title: "Full evening (4+ hours)",
    description: "Let the night unfold beautifully.",
    value: "Full evening (4+ hours)",
  },
];

const CreateStepThree = (props) => {
  const { handleSubmit, previousPage, invalid, onClose, confirmPopup } = props;
  const state = useSelector((state) => state.form.CreateStepThree);

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell">
          <CreateDateHeader
            activeStep={3}
            onBack={previousPage}
            onClose={onClose}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>How long do you want this date to last?</h2>
                <div className="intro-subtitle">
                  Be upfront - great dates start with perfect timing.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender">
              <form
                onSubmit={handleSubmit}
                className="inner_container"
                style={{
                  paddingRight: "20px",
                  paddingLeft: "20px",
                  paddingTop: "0px",
                }}
              >
                <div className="mb-4">
                  <Field
                    name="education"
                    component={({ input }) => (
                      <div className="duration-list">
                        {durationOptions.map((option) => {
                          const isSelected = input.value === option.value;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`duration-card ${
                                isSelected ? "is-selected" : ""
                              }`}
                              onClick={() => input.onChange(option.value)}
                            >
                              <div className="duration-title">
                                {option.title}
                              </div>
                              {option.description && (
                                <div className="duration-desc">
                                  {option.description}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
                <div className="bottom-mobile register-bottom">
                  <div className="secret-input type-submit next-prev">
                    {!confirmPopup && (
                      <button
                        type="submit"
                        className="next"
                        disabled={!state.values?.education || invalid}
                      >
                        Next <FiArrowRight />
                      </button>
                    )}
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
  form: "CreateStepThree",
  destroyOnUnmount: false,
  validate,
})(CreateStepThree);
