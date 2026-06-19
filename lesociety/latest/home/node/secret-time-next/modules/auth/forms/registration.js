import React, { useState } from "react";

import MaleFirstStep from "./steps/firstStep";
import FemaleFirstStep from "./steps/female/firstStep";
import SecondStep from "./steps/secondStep";
import ThirdStep from "./steps/thirdStep";
import CompleteProfile from "./steps/completeProfile";
import { useRouter } from "next/router";
import { registration, storeUserGender } from "../authActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const RegisterForm = ({ page, setPage, ...props }) => {
  const router = useRouter();
  // const [page, setPage] = useState(0);
  const [male, setMale] = useState(false);
  const [gender, setGender] = useState("");
  const [female, setFemale] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authReducer);
  const userLogin = authState?.user;
  const nextPage = (values, loader) => {
    if (page === 0) {
      setPage(page + 1);
    } else {
      const data = {
        ...values,
        gender: gender,
        country: values.location.country?.text,
        country_code: values.location.country?.short_code,
        province: values?.location?.province?.short_code?.split("-")[1],
        location: values.location.value,
        email: values.email?.toLowerCase(),
      };
      dispatch(registration(data, loader));
      // router.push('/auth/profile')
    }
  };

  const nextPageMale = (gender) => {
    // setPage(page + 1);
    // setMale(!male);
    // dispatch(storeUserGender("male"));
    setGender(gender);
    // window.scrollTo(0, 0);
  };

  const nextPageFemale = (gender) => {
    // setPage(page + 1);
    // setFemale(!female);
    // dispatch(storeUserGender("female"));
    setGender(gender);
    // window.scrollTo(0, 0);
  };

  const previousPage = () => {
    setPage(page - 1);
    window.scrollTo(0, 0);
    setFemale(false);
    setMale(false);
  };

  useEffect(() => {
    if (authState?.gender === "female") {
      nextPageFemale("female");
    } else {
      nextPageMale("male");
    }
  }, [authState?.gender]);

  useEffect(() => {
    if (authState?.isLoggedIn) {
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
        } else if (userLogin?.status === 3) {
          router.push({
            pathname: "/auth/block",
          });
        } else {
          router.push("/auth/profile");
        }
      }
    }
  }, [userLogin]);

  return (
    <div>
      {/* {page == 0 && (
        <div className="choose-gender">
          <h2>Let’s Sign You Up.</h2>
          <p className="auth-register-p-text">Select Gender</p>
          <div className="gender-select">
            <button
              className="male"
              onClick={() => {
                nextPageMale("male");
              }}
            >
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                viewBox="0 0 24 25"
                color="#222326"
              >
                <path d="M16.5 13.5c0 .828-.56 1.5-1.25 1.5s-1.25-.672-1.25-1.5.56-1.5 1.25-1.5 1.25.672 1.25 1.5zm-7.75-1.5c-.69 0-1.25.672-1.25 1.5s.56 1.5 1.25 1.5 1.25-.672 1.25-1.5-.56-1.5-1.25-1.5zm15.25 2.313c0 1.765-.985 3.991-3.139 4.906-2.063 3.295-4.987 5.781-8.861 5.781-3.741 0-6.846-2.562-8.861-5.781-2.154-.916-3.139-3.142-3.139-4.906 0-2.053.754-3.026 1.417-3.489-.39-1.524-1.03-5.146.963-7.409.938-1.065 2.464-1.54 4.12-1.274.719-1.532 3.612-2.141 5.5-2.141 3 0 6.609.641 9.141 3.516 1.969 2.236 1.648 5.741 1.388 7.269.676.446 1.471 1.419 1.471 3.528zm-9.6 4.687h-4.8s.678 1.883 2.4 1.883c1.788 0 2.4-1.883 2.4-1.883zm7.063-6.508c-4.11.393-7.778-3.058-9.073-5.274-.081.809.186 2.557.969 3.355-3.175.064-5.835-1.592-7.46-3.868-.837 1.399-1.242 3.088-1.242 4.775 0 .722-.746 1.208-1.406.914-.14-.063-.436-.101-.671.053-1 .648-.895 4.183 1.553 5.012.224.076.413.228.536.43.655 1.086 1.354 1.98 2.086 2.722.922.633 1.056-1.875 1.667-2.72.686-.949 2.455-1.126 3.578-.322 1.124-.804 2.892-.627 3.578.322.611.846.745 3.354 1.667 2.72.731-.741 1.43-1.636 2.086-2.722.123-.202.313-.354.536-.43 2.363-.8 2.596-4.185 1.596-4.967z"></path>
              </svg>
            </button>
            <button
              className="female"
              onClick={() => {
                nextPageFemale("female");
              }}
            >
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                viewBox="0 0 26 24"
                color="#222326"
              >
                <path d="M17.5 12.5c0 .828-.56 1.5-1.25 1.5s-1.25-.672-1.25-1.5.56-1.5 1.25-1.5 1.25.672 1.25 1.5zm-7.75-1.5c-.69 0-1.25.672-1.25 1.5s.56 1.5 1.25 1.5 1.25-.672 1.25-1.5-.56-1.5-1.25-1.5zm3.25 8.354c2.235 0 3-2.354 3-2.354h-6s.847 2.354 3 2.354zm13 3.639c-2.653 1.714-5.418 1.254-6.842-1.488-1.672 1.505-3.706 2.487-6.158 2.487-2.53 0-4.517-.91-6.184-2.445-1.431 2.702-4.178 3.15-6.816 1.446 4.375-1.75-2.729-11.813 4.104-19.375 2.282-2.525 5.472-3.618 8.896-3.618s6.614 1.093 8.896 3.618c6.833 7.562-.271 17.625 4.104 19.375zm-5.668-6.111c.122-.202.312-.354.535-.43 2.447-.828 2.554-4.361 1.554-5.012-.235-.152-.531-.115-.672-.053-.664.295-1.406-.194-1.406-.914 0-.471-.034-1.001-.096-1.473h-10.101c-.813-1.021-.771-2.945-.396-4.57-.903.982-1.693 3.249-1.875 4.57h-2.121c-.062.472-.096 1.002-.096 1.473 0 .72-.742 1.209-1.406.914-.141-.062-.436-.1-.672.053-1 .651-.893 4.184 1.554 5.012.224.076.413.228.535.43 1.709 2.829 4.015 5.111 7.332 5.111 3.316 0 5.623-2.283 7.331-5.111z"></path>
              </svg>
            </button>
          </div>
        </div>
      )} */}

      {page == 1 && (
        <>
          {authState?.gender === "female" ? (
            <FemaleFirstStep
              previousPage={previousPage}
              onSubmit={nextPage}
              gender={"female"}
            />
          ) : (
            <MaleFirstStep
              previousPage={previousPage}
              onSubmit={nextPage}
              gender={"male"}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RegisterForm;
