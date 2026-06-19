import React, { useState } from "react";
import { Field, reduxForm } from "redux-form";
import { useSelector, useDispatch } from "react-redux";
import { Inputs } from "core";
import loginValidate from "./validate/loginValidate";
import Link from "next/link";
import { useRouter } from "next/router";
import useWindowSize from "../../../utils/useWindowSize";
import { login } from "../authActions";
import { useEffect } from "react";
import { useRef } from "react";
import { apiRequest } from "utils/Utilities";

const SimpleForm = (props) => {
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.authReducer);
  const userLogin = authState?.user;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passRef = useRef(null);
  const [notifData, setNotifdata] = useState(null);

  const submitHandler = async (values) => {
    console.log('=== FORM SUBMIT ===', values);
    values.email = values.email?.toLowerCase();
    console.log('=== DISPATCHING LOGIN ===', values);
    dispatch(login(values, setLoading));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
    if (passRef.current) {
      setTimeout(() => {
        const length = passRef.current.value?.length || 0;
        passRef.current.setSelectionRange(length, length);
      }, 10);
    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const fetchNotifications = async () => {
    debugger;
    try {
      const params = {
        user_email: userLogin.email,
        sort: "sent_time",
      };

      const { data } = await apiRequest({
        method: "GET",
        url: `notification`,
        params: params,
      });
      setNotifdata(data?.data?.notification);
    } catch (err) {
      console.error("err", err);
    }
  };

  useEffect(() => {
    console.log("called", authState);
    if (authState?.isLoggedIn) {
      // debugger
      // fetchNotifications()
      if (userLogin?.step_completed === 1 || userLogin?.step_completed === 2) {
        router.push({
          pathname: "/auth/profile",
        });
      } else {
        if (
          userLogin?.status === 2 &&
          userLogin?.verified_screen_shown === false
        ) {
          router.push({
            pathname: "/user/verified",
          });
        } else if (
          userLogin?.status === 2 &&
          userLogin?.verified_screen_shown === true
        ) {
          router.push({
            pathname: "/user/user-list",
          });
        } else if (userLogin?.request_change_fired) {
          console.log("request change called");
          router.push({
            pathname: "/auth/verify-profile",
          });
        } else if (userLogin?.status === 3) {
          router.push({
            pathname: "/auth/block",
          });
        }

        // else {
        //   console.log("auth/profile called")
        //   router.push({
        //     pathname: "/auth/profile",
        //   });
        // }
      }
    }
  }, [userLogin, router?.isReady]);

  useEffect(() => {
    console.log("notiffff ", notifData);
    //localStorage.setItem('notifications', JSON.stringify(notifData));
  }, [notifData]);

  const {
    handleSubmit,
    invalid,
    pristine,
    reset,
    submitting,
    submitSucceeded,
    syncErrors,
  } = props;

  // Log validation errors for debugging
  console.log('=== FORM STATE ===', {
    invalid,
    pristine,
    submitting,
    syncErrors
  });

  // console.log("userLogin", userLogin);

  return (
    <form autoComplete="off" onSubmit={handleSubmit(submitHandler)}>
      {width > 767 && (
        <>
          <Field
            name="email"
            component={Inputs.inputField}
            type="text"
            label="User Email"
            placeholder="E.g. Janedoe@gmail.com"
          />
          <div className="password-fields">
            <Field
              name="password"
              component={Inputs.inputField}
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Password"
              normalize={(value) => value.replace(/\s+/g, "")}
              refName={passRef}
              withRef={true}
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
                  d="M18.5 12C18.5 10.4087 17.8679 8.88258 8.25736 7.75736C15.6174 6.63214 14.0913 6 12.5 6C10.9087 6 9.38258 6.63214 8.25736 7.13214C7.13214 8.88258 6.5 10.4087 6.5 12L6.54917 12C6.54917 10.4217 7.17613 8.90813 8.29213 7.79213C9.40813 6.67613 10.9217 6.04917 12.5 6.04917C14.0783 6.04917 15.5919 6.67613 16.7079 7.79213C17.8239 8.90813 18.4508 10.4217 18.4508 12H18.5Z"
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
          <Inputs.buttonField
            type="submit"
            name="login"
            disabled={invalid}
            label="Sign In"
            loading={loading}
          />
        </>
      )}

      {width < 767 && (
        <>
          <Field
            name="email"
            component={Inputs.inputField}
            type="text"
            label="User Email"
            placeholder="E.g. Janedoe@gmail.com"
          />
          <div className="password-fields mobile-side-password">
            <Field
              name="password"
              component={Inputs.inputField}
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              normalize={(value) => value.replace(/\s+/g, "")}
              refName={passRef}
              withRef={true}
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
                  d="M18.5 12C18.5 10.4087 17.8679 8.88258 8.25736 7.75736C15.6174 6.63214 14.0913 6 12.5 6C10.9087 6 9.38258 6.63214 8.25736 7.13214C7.13214 8.88258 6.5 10.4087 6.5 12L6.54917 12C6.54917 10.4217 7.17613 8.90813 8.29213 7.79213C9.40813 6.67613 10.9217 6.04917 12.5 6.04917C14.0783 6.04917 15.5919 6.67613 16.7079 7.79213C17.8239 8.90813 18.4508 10.4217 18.4508 12H18.5Z"
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
          <Link href="/auth/forgot-password">
            <a className="forgot-passwrd">Forgot password?</a>
          </Link>
          <div className="bottom-mobile">
            <div className="dont-have">
              <p>
                Don't have an account? <Link href="/">Register</Link>
              </p>
            </div>
            <Inputs.buttonField
              type="submit"
              name="login"
              disabled={invalid}
              label="Sign In"
              loading={loading}
            />
          </div>
        </>
      )}
    </form>
  );
};

export default reduxForm({
  form: "LoginForm",
  validate: loginValidate,
})(SimpleForm);
