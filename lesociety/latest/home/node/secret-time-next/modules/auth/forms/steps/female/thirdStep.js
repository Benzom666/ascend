import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Field, reduxForm } from "redux-form";
import validate from "../../validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
import { IoSync } from "react-icons/io5";
import useWindowSize from "utils/useWindowSize";
import Slider from "react-rangeslider";
import { deAuthenticateAction } from "@/modules/auth/authActions";
import { Slider as HeightSlider } from "antd";

const education = [
  {
    id: "1",
    name: "High school",
  },
  {
    id: "2",
    name: "College Degree",
  },
  {
    id: "3",
    name: "Graduate Degree",
  },
  {
    id: "4",
    name: "Master Degree",
  },
  {
    id: "5",
    name: "In College",
  },
  {
    id: "6",
    name: "In University",
  },
  {
    id: "7",
    name: "Undergraduate",
  },
  {
    id: "8",
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
    id: "1",
    name: "Entrepreneur",
  },
  {
    id: "2",
    name: "Public Figure",
  },
  {
    id: "3",
    name: "Influencer",
  },
  {
    id: "4",
    name: "Model",
  },
  {
    id: "5",
    name: "Artist",
  },
  {
    id: "6",
    name: "Student",
  },
  {
    id: "7",
    name: "Retired",
  },
  {
    id: "8",
    name: "Executive",
  },
  {
    id: "9",
    name: "Photography",
  },
  {
    id: "10",
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
    id: "Medical",
    name: "Medical",
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

const imageRequired = (value) => (!value ? "Image is required" : undefined);

const setValue = "";

const ThirdStep = (props) => {
  const [tallValue, setTallValue] = useState(10);
  const { width } = useWindowSize();
  const [tallValueUnit, setTallValueUnit] = useState(false);
  const [loadMore, setLoadMore] = useState(false);

  const handleTallValueUnit = () => {
    setTallValueUnit(!tallValueUnit);
  };

  const handleLoadMore = () => {
    occupation = occupation.concat(loadMoreOptions);
    setLoadMore(true);
  };

  const convertToFeet = (cmValue) => (cmValue * 0.0328084).toPrecision(3);

  const toFeet = (n) => {
    var realFeet = (n * 0.3937) / 12;
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "'" + inches;
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

  return (
    <form onSubmit={handleSubmit} className="almost-done-page">
      <div className="d-block d-md-none login-text mb-0">
        <a
          onClick={() => {
            previousPage();
            dispatch(reset("signupStep2"));
            dispatch(reset("DatePreview"));
            dispatch(reset("RegisterFormMale"));
            dispatch(reset("signupStep3"));
            dispatch(reset("RegisterForm"));
            dispatch(reset("forgotpassword"));
            dispatch(reset("LoginForm"));
            dispatch(reset("SecondStep"));
            dispatch(reset("ThirdStep"));
            dispatch(reset("CreateStepFour"));
            dispatch(reset("CreateStepOne"));
            dispatch(reset("CreateStepThree"));
            dispatch(reset("CreateStepTwo"));
            dispatch(reset("SkeletonUserProfile"));
            dispatch(reset("Messages"));
            dispatch(reset("VerifiedProfilePage"));
            dispatch(reset("ChooseCity"));
            dispatch(deAuthenticateAction());
            router.push("/auth/login");
            // window.location.reload();
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
          <h2>{user?.user_name || ""}</h2>
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
          min={0}
          handleLabel={tallValueUnit ? toFeet(tallValue) : tallValue}
          max={250}
          onChange={(val) => setTallValue(val)}
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
            name="education"
            options={education}
            value={education}
            component={Inputs.radioField}
          />
        </div>
        <div className="auth-radio inner-radio small-labels-radio">
          <Field
            label="Are you a smoker?"
            name="smoker"
            options={smoker}
            value={smoker}
            component={Inputs.radioField}
          />
        </div>
        <div className="auth-radio inner-radio occupation-radio">
          <Field
            label="Your occupation"
            name="occupation"
            options={occupation}
            value={occupation}
            component={Inputs.radioField}
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
          <button type="submit" className="next" disabled={invalid}>
            Next
            <FiArrowRight />
          </button>
        </div>
      </div>
    </form>
  );
};

export default reduxForm({
  form: "ThirdStep", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(ThirdStep);
