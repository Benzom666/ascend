import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Field, reduxForm } from "redux-form";
import validate from "../validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
import { IoSync } from "react-icons/io5";
import useWindowSize from "../../../../utils/useWindowSize";
import Slider from "react-rangeslider";
import { deAuthenticateAction, signupStep3 } from "../../authActions";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useRouter } from "next/router";
import { Slider as HeightSlider } from "antd";
const {
  loadEditProfileFlowState,
  saveEditProfileFlowState,
  sanitizeStep3Draft,
  buildStep3InitialValues,
} = require("utils/editProfileFlowState");

const education = [
  {
    id: "High school",
    name: "High school",
  },
  {
    id: "College Degree",
    name: "College Degree",
  },
  {
    id: "Graduate Degree",
    name: "Graduate Degree",
  },
  {
    id: "Master Degree",
    name: "Master Degree",
  },
  {
    id: "In College",
    name: "In College",
  },
  {
    id: "In University",
    name: "In University",
  },
  {
    id: "Undergraduate",
    name: "Undergraduate",
  },
  {
    id: "PHD",
    name: "PHD",
  },
];

const smoker = [
  {
    id: "Yes",
    name: "Yes",
  },
  {
    id: "No",
    name: "No",
  },
];

let occupation = [
  {
    id: "Entrepreneur",
    name: "Entrepreneur",
  },
  {
    id: "Public Figure",
    name: "Public Figure",
  },
  {
    id: "Influencer",
    name: "Influencer",
  },
  {
    id: "Model",
    name: "Model",
  },
  {
    id: "Artist",
    name: "Artist",
  },
  {
    id: "Student",
    name: "Student",
  },
  {
    id: "Medical",
    name: "Medical",
  },
  {
    id: "Executive",
    name: "Executive",
  },
  {
    id: "Photography",
    name: "Photography",
  },
  {
    id: "CEO",
    name: "CEO",
  },
];

const loadMoreOptions = [
  {
    id: "Business",
    name: "Business",
  },
  {
    id: "Sales",
    name: "Sales",
  },
  {
    id: "Finance",
    name: "Finance",
  },
  {
    id: "Designer",
    name: "Designer",
  },

  {
    id: "Legal",
    name: "Legal",
  },
  {
    id: "Teacher",
    name: "Teacher",
  },
  {
    id: "Professor",
    name: "Professor",
  },
  {
    id: "Marketing",
    name: "Marketing",
  },
  {
    id: "Dental",
    name: "Dental",
  },
  {
    id: "Engineer",
    name: "Engineer",
  },
  {
    id: "Political",
    name: "Political",
  },
  {
    id: "Government",
    name: "Government",
  },
  {
    id: "Social Worker",
    name: "Social Worker",
  },
  {
    id: "Freelancer",
    name: "Freelancer",
  },
  {
    id: "Administrator",
    name: "Administrator",
  },
  {
    id: "Secretary",
    name: "Secretary",
  },
  {
    id: "Labor",
    name: "Labor",
  },
  {
    id: "Contractor",
    name: "Contractor",
  },
  {
    id: "Transport",
    name: "Transport",
  },
  {
    id: "Science",
    name: "Science",
  },
  {
    id: "Service",
    name: "Service",
  },
];

const ThirdStep = (props) => {
  const [tallValue, setTallValue] = useState(100);
  const { width } = useWindowSize();
  const [tallValueUnit, setTallValueUnit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);

  const handleTallValueUnit = () => {
    setTallValueUnit(!tallValueUnit);
  };

  const handleLoadMore = () => {
    occupation = occupation.concat(loadMoreOptions);
    setLoadMore(true);
  };

  const convertToFeet = (cmValue) => (cmValue * 0.0328084).toPrecision(2);

  const toFeet = (n) => {
    var realFeet = (n * 0.3937) / 12;
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "'" + inches;
  };

  useEffect(() => {
    if (user) {
      const persistedState = router.query?.edit
        ? loadEditProfileFlowState()
        : null;
      const data = buildStep3InitialValues({
        user,
        draft: persistedState?.step3Draft,
      });
      setTallValue(data.height || 100);
      props.initialize(data);
    }
  }, [user, router.query?.edit]);

  const onSubmit = (values) => {
    values.height = tallValue;
    values.email = user?.email;
    values.step_completed = 3;
    dispatch(
      signupStep3(
        { ...values, isUpdate: router?.query?.edit },
        setLoading,
        props.onSubmit
      )
    );
  };

  const {
    handleSubmit,
    invalid,
    previousPage,
    pristine,
    reset,
    submitting,
    touched,
  } = props;
  const reduxValues = useSelector((state) => state.form.signupStep3?.values);
  const isStep3Valid = Boolean(
    reduxValues?.max_education &&
      reduxValues?.is_smoker &&
      reduxValues?.occupation &&
      tallValue >= 100 &&
      tallValue <= 250
  );

  useEffect(() => {
    if (!router.query?.edit) {
      return;
    }

    saveEditProfileFlowState({
      step3Draft: sanitizeStep3Draft({
        ...(reduxValues || {}),
        height: tallValue,
      }),
    });
  }, [
    router.query?.edit,
    reduxValues?.max_education,
    reduxValues?.is_smoker,
    reduxValues?.occupation,
    tallValue,
  ]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="almost-done-page">
      <div className="d-block d-md-none login-text mb-0">
        <a
          onClick={() => {
            previousPage();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-chevron-left"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </a>
        {/* <span>
                LADIES
                <img src="/images/line.png" alt="line" />
                </span> */}
      </div>
      {width < 767 && (
        <div className="top-head">
          <p>More About</p>
          <h2 style={{ textTransform: "capitalize" }}>
            {user?.user_name || ""}
          </h2>
          <img src="/images/line.png" alt="line" />
        </div>
      )}
      <div className="div-wrapper">
        <h2>You’re almost done!</h2>
        <p className="auth-register-p-text">
          Please answer the final questions
        </p>
      </div>
      <div className="slider">
        <label className="slider-label">
          <span>How tall are you?</span>
          <a
            onClick={handleTallValueUnit}
            className={tallValueUnit ? "active" : ""}
          >
            <IoSync /> {tallValueUnit ? "feet" : "cm"}
          </a>
        </label>
        {/* <Slider
          value={tallValue}
          tooltip={true}
          handleLabel={tallValueUnit ? toFeet(tallValue) : tallValue}
          min={100}
          max={250}
          onChange={(val) => !router?.query?.type && setTallValue(val)}
          disabled={router?.query?.type && router?.query?.edit}
          onAfterChange={(val) => setTallValue(val)}
        /> */}
        <HeightSlider
          value={tallValue}
          tooltip={{
            open: true,
            placement: "bottom",
            autoAdjustOverflow: false,
          }}
          min={100}
          max={250}
          handleLabel={tallValueUnit ? toFeet(tallValue) : tallValue}
          onChange={(val) => !router?.query?.type && setTallValue(val)}
          disabled={router?.query?.type && router?.query?.edit}
          tipFormatter={(value) =>
            tallValueUnit ? toFeet(tallValue) : tallValue
          }
          // use
          onAfterChange={(val) => setTallValue(val)}
        />

        <div className="auth-radio inner-radio">
          <Field
            label="Level of education"
            name="max_education"
            options={education}
            value={education}
            component={Inputs.radioField}
            props={{
              disabled: router?.query?.type && router?.query?.edit,
            }}
          />
        </div>
        <div className="auth-radio inner-radio small-labels-radio">
          <Field
            label="Are you a smoker?"
            name="is_smoker"
            options={smoker}
            value={smoker}
            component={Inputs.radioField}
            props={{
              disabled: router?.query?.type && router?.query?.edit,
            }}
          />
        </div>
        <div className="auth-radio inner-radio occupation-radio">
          <Field
            label="Your occupation"
            name="occupation"
            options={occupation}
            value={occupation}
            component={Inputs.radioField}
            props={{
              disabled: router?.query?.type && router?.query?.edit,
            }}
          />
          {!loadMore && (
            <a className="load-more" onClick={handleLoadMore}>
              Load more
            </a>
          )}
        </div>
      </div>
      <div className="bottom-mobile register-bottom">
        <div className="secret-input type-submit next-prev">
          <a onClick={previousPage} className="prev">
            <FiChevronLeft />
          </a>
          <button type="submit" className="next" disabled={!isStep3Valid || loading}>
            {loading ? (
              <span className="spin-loader-button"></span>
            ) : (
              <>
                Next
                <FiArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default reduxForm({
  form: "signupStep3", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(ThirdStep);
