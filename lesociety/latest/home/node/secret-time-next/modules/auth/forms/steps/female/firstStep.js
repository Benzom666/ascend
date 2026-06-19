import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Field, reduxForm, change } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import validate from "../../validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import useWindowSize from "../../../../../utils/useWindowSize";
import { components } from "react-select";
import {
  bodyType,
  Ethnicity,
  countriesCode,
  femaleBodyType,
  maleBodyType,
} from "../../../../../utils/Utilities";
import {
  existEmail,
  existUsername,
  fetchLocation,
  fetchLiveLocation,
  fetchRealLocation,
} from "../validateRealTime";
import SkeletonFirstStep from "@/modules/skeleton/Auth/SkeletonFirstStep";

const emailValidate = (value) =>
  !value
    ? "Email is Required"
    : !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? "Invalid email address"
    : "User already exists";
const notRealValidate = (value) =>
  !value
    ? "Email is Required"
    : !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? "Invalid email address"
    : "";

const userValidate = (value) =>
  !value
    ? "Username is Required"
    : value.length < 3
    ? "Min 3 characters Required"
    : value.length > 15
    ? "Username should not longer than 15 characters"
    : "User already exists";
const notRealUserValidate = (value) =>
  !value
    ? "Username is Required"
    : value.length < 3
    ? "Min 3 characters Required"
    : value.length > 15
    ? "Username should not longer than 15 characters"
    : "";

const passwordValidate = (values) =>
  !values
    ? "Password is Required"
    : values.length < 6
    ? "Min 6 characters Required"
    : "";

const ethnicityValidate = (values) =>
  !values ? "Please Select Ethnicity" : "";

const bodyValidate = (values) => (!values ? "Please Select body type" : "");

const ageValidate = (values) =>
  !values
    ? "Age is Required"
    : values < 18
    ? "* Minimum 18 years"
    : values > 99
    ? "* Maximun 99 years"
    : "";

const locationValidate = (values) =>
  !values?.value ? "Location is Required" : "";

const FirstStep = ({ gender, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSubmit, setLoaderSubmit] = useState(false);
  const [loading, setLoader] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isValid, setValid] = useState(false);
  const [loadingUsername, setLoaderUsername] = useState(false);
  const [isValidUsername, setValidUsername] = useState(false);
  const [locationOptions, setLocation] = useState([]);
  const [mailTest, setMailTest] = useState(false);
  const [userTest, setUserTest] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const [places, setPlaces] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [countries, setCountry] = useState("");
  const error = useSelector((state) => state.form.RegisterForm?.syncErrors);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChangeEmail = (event) => {
    setValid(false);
    setMailTest(false);
    existEmail(
      event.target.value,
      setLoader,
      setValid,
      dispatch,
      props?.gender,
      error,
      setMailTest
    );
  };

  const handleChangeUser = (event) => {
    setValidUsername(false);
    setUserTest(false);
    existUsername(
      event.target.value,
      setLoaderUsername,
      setValidUsername,
      dispatch,
      props?.gender,
      error,
      setUserTest
    );
  };

  const submitHandler = (values) => {
    props.onSubmit(values, setLoaderSubmit);
  };

  useEffect(() => {
    const fetch = async () => {
      const location = await fetchLocation();
      console.log("location", location);
      if (location) {
        const locationOption = location
          ?.map((item) =>
            item.isAvailable === 1 ? countriesCode[item.name] : null
          )
          .filter((item) => item !== null)
          .join();
        console.log("locationOption", locationOption);
        setCountry(locationOption);
      }
    };
    fetch();
  }, []);

  const handleIcon = () => {
    setLoadingLive(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (
          position.coords.latitude !== undefined &&
          position.coords.longitude !== undefined
        ) {
          const location = await fetchLiveLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          const data = {
            label:
              location[0].label +
              ", " +
              location[0].province[0]?.short_code?.split("-")[1],
            value: location[0].name,
            country: location[0].country[0],
            province: location[0].province[0],
          };
          props.change("location", data);
          setLoadingLive(false);
        }
      },
      (err) => setLoadingLive(false),
      { enableHighAccuracy: true }
    );
  };

  const handleChange = async (value, inputAction) => {
    if (inputAction.action === "input-change") {
      setInputValue(value);
      fetchRealLocation(value, countries, setPlaces);
    }
  };

  useEffect(() => {
    if (places.length > 0) {
      const options = places.map((item) => ({
        label: item.label,
        country: item.country[0],
        value: item.name,
        province: item.province[0],
      }));
      setLocation(options);
    }
  }, [places]);

  const { handleSubmit, previousPage, invalid, pristine, reset, submitting } =
    props;

  console.log("countries", countries);

  if (pageLoading) {
    return <SkeletonFirstStep theme="dark" />;
  } else {
    return (
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="d-block d-md-none login-text">
          <a href="/">
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
          <span>
            LADIES
            <img src="/images/line.png" alt="line" />
          </span>
        </div>
        <h2>Let’s Sign You Up.</h2>
        <p className="auth-register-p-text">Unlock The Vault.</p>

        <Field
          name="email"
          type="text"
          component={Inputs.inputField}
          label="Email"
          placeholder="E.g. Janedoe@gmail.com"
          onChange={handleChangeEmail}
          loading={loading}
          isValid={isValid}
          validate={mailTest && !isValid ? emailValidate : notRealValidate}
          ignoreTouch={mailTest && !isValid}
        />
        <Field
          name="user_name"
          type="text"
          component={Inputs.inputField}
          label="Username"
          placeholder="Visible by all members"
          // use period, letters, numbers only and replace space with period
          normalize={(value) => {
            // value.replace(/[^a-zA-Z0-9.\s]/g, "").replace(/\s+/g, ".")
            let normalizedValue = value.replace(/[^a-zA-Z0-9.\s]/g, ""); // Remove unwanted characters
            normalizedValue = normalizedValue.replace(/\s{2,}/g, " "); // Replace consecutive spaces with a single space
            normalizedValue = normalizedValue.replace(/\s/g, "."); // Replace spaces with a period
            normalizedValue = normalizedValue.replace(/\.(?=.*\.)/g, ""); // Remove all periods except the first one
            return normalizedValue;
          }}
          onChange={handleChangeUser}
          loading={loadingUsername}
          isValid={isValidUsername}
          validate={
            userTest && !isValidUsername ? userValidate : notRealUserValidate
          }
          ignoreTouch={userTest && !isValidUsername}
        />
        <div className="password-fields">
          <Field
            name="password"
            component={Inputs.inputField}
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Minimum 6 character"
            normalize={(value) => value.replace(/\s+/g, "")}
            validate={passwordValidate}
          />
          <span
            className="icon"
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
          >
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12.5"
                cy="12"
                r="2.6"
                stroke="#4D4C56"
                strokeWidth="0.8"
              />
              <path
                d="M18.5 12C18.5 10.4087 17.8679 8.88258 16.7426 7.75736C15.6174 6.63214 14.0913 6 12.5 6C10.9087 6 9.38258 6.63214 8.25736 7.75736C7.13214 8.88258 6.5 10.4087 6.5 12L6.54917 12C6.54917 10.4217 7.17613 8.90813 8.29213 7.79213C9.40813 6.67613 10.9217 6.04917 12.5 6.04917C14.0783 6.04917 15.5919 6.67613 16.7079 7.79213C17.8239 8.90813 18.4508 10.4217 18.4508 12H18.5Z"
                stroke="#4D4C56"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="0.9"
                y="0.4"
                width="23.2"
                height="23.2"
                rx="6.6"
                stroke="#4D4C56"
                strokeWidth="0.8"
              />
            </svg>
          </span>
        </div>
        <div>
          <Field
            name="location"
            type="text"
            component={Inputs.renderDropdown}
            label="Location"
            placeholder="Enter your city"
            valueField="value"
            id="location1"
            withIcon={true}
            options={locationOptions}
            iconClick={handleIcon}
            loading={loadingLive}
            openMenuOnClick={false}
            inputValue={inputValue}
            onInputChange={handleChange}
            menuIsOpen={inputValue && locationOptions.length}
            isClearable={true}
            backspaceRemovesValue={true}
            onChange={(value) => {
              setInputValue("");
              props.change("location", value);
            }}
            validate={locationValidate}
            components={{
              Option: ({ children, ...rest }) => (
                <components.Option {...rest}>
                  <>
                    {" "}
                    <h6>{children.split(",")[0]}</h6>{" "}
                    <span>
                      {rest.data?.province?.text}, {rest.data?.country?.text}
                    </span>
                  </>
                </components.Option>
              ),
            }}
          />
          <div className="age-field">
            <Field
              name="age"
              type="number"
              component={Inputs.inputField}
              label="Age"
              validate={ageValidate}
            />
          </div>
          <div className="auth-radio">
            <Field
              label="Body Type"
              name="body_type"
              options={gender === "female" ? femaleBodyType : maleBodyType}
              value={gender === "female" ? femaleBodyType : maleBodyType}
              component={Inputs.radioField}
              validate={bodyValidate}
            />
          </div>
          <div className="auth-radio">
            <Field
              label="Ethnicity"
              name="ethnicity"
              options={Ethnicity}
              value={Ethnicity}
              component={Inputs.radioField}
              validate={ethnicityValidate}
            />
          </div>

          {width < 767 && (
            <>
              <div className="d-flex checkbox-label">
                <p className="next-text">
                  By clicking “Next” I certify that I’m at least 18 years old
                  and agree to the Ascend{" "}
                  <Link href="/PrivacyPolicies">PrivacyPolicy</Link> and{" "}
                  <Link href="/TermOfUse">Terms</Link>
                </p>
              </div>
              <div className="bottom-mobile register-bottom">
                <div className="secret-input type-submit">
                  <button type="submit" className="next" disabled={invalid}>
                    {loadingSubmit ? (
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
            </>
          )}
          {width > 767 && (
            <div className="bottom-mobile register-bottom">
              <div className="secret-input type-submit">
                <button type="submit" className="next" disabled={invalid}>
                  {loadingSubmit ? (
                    <span className="spin-loader-button"></span>
                  ) : (
                    <>
                      Next
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
              <p className="next-text">
                By clicking “Next” I certify that I’m at least 18 years old and
                agree to the Ascend{" "}
                <Link href="/PrivacyPolicies">PrivacyPolicy</Link> and{" "}
                <Link href="/TermOfUse">Terms</Link>
              </p>
            </div>
          )}
        </div>
      </form>
    );
  }
};

export default reduxForm({
  form: "RegisterForm",
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
  // validate
})(FirstStep);
