import React, { useEffect, useRef } from "react";
import { apiRequest, showToast } from "../../../../utils/Utilities";
import { AUTHENTICATE, AUTHENTICATE_UPDATE } from "../../actionConstants";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useState } from "react";
import Loader from "@/modules/Loader/Loader";
import _ from "lodash";
import { startOrResumeCreateDate } from "utils/createDateFlow";
import { markCreateDateIntroSkipOnce, markFirstLoginCompleted } from "utils/createDateIntroState";
const { clearEditProfileFlowState } = require("utils/editProfileFlowState");

const CompleteProfile = (props) => {
  const user = useSelector((state) => state.authReducer.user);
  const [tokenValid, setTokenValid] = useState(true);
  const [updatedUser, setUpdatedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  const handleResendMail = async () => {
    setLoading(true);
    if (user?.email) {
      try {
        const res = await apiRequest({
          data: {
            email: user?.email,
          },
          method: "POST",
          url: `user/verify-email`,
        });
        setTimeout(() => {
          setLoading(false);
        }, 3000);
        // showToast(res.data.message, 'success')
      } catch (err) {
        setTimeout(() => {
          setLoading(false);
        }, 3000);
        console.log("error", err);
        // if (
        //   err?.response?.status === 401 &&
        //   err?.response?.data?.message === "Failed to authenticate token!"
        // ) {
        //   setTimeout(() => {
        //     logout(router, dispatch);
        //   }, 100);
        // }
        // return err;
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    const verifyEmail = async () => {
      if (router?.query?.token && router?.query?.email) {
        try {
          const res = await apiRequest({
            data: {
              email: router?.query?.email,
              token: router?.query?.token,
            },
            method: "POST",
            url: `user/email-verification`,
          });
          setTimeout(() => {
            setLoading(false);
          }, 3000);
          // debugger
          // dispatch({
          //     type: AUTHENTICATE_UPDATE,
          //     payload: {email_verified: true}
          // })
          dispatch({
            type: AUTHENTICATE,
            payload: res.data.data,
          });
          // showToast(res.data.message, 'success')
        } catch (err) {
          setTimeout(() => {
            setLoading(false);
          }, 3000);
          setTokenValid(false);

          // if (
          //   err?.response?.status === 401 &&
          //   err?.response?.data?.message === "Failed to authenticate token!"
          // ) {
          //   setTimeout(() => {
          //     logout(router, dispatch);
          //   }, 100);
          // }
          // return err;
        }
      }
    };
    verifyEmail();
  }, [router?.query?.token]);

  // console.log("router", router);

  const getUpdatedUserDetails = async () => {
    if (!user?.user_name) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest({
        method: "GET",
        url: `user/user-by-name?user_name=${user?.user_name}`,
        token: user?.token, // Pass token explicitly from Redux state
      });
      console.log("res", res.data?.data?.user);
      setUpdatedUser(res.data?.data?.user);
      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: { ...res.data?.data?.user },
      });
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
      console.log("err", err);

      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        // setTimeout(() => {
        //   logout(router, dispatch);
        // }, 100);
      }
      return err;
    }
  };

  useEffect(() => {
    getUpdatedUserDetails();
  }, []);

  useEffect(() => {
    if (router?.query?.edit) {
      clearEditProfileFlowState();
    }
  }, [router?.query?.edit]);

  useEffect(() => {
    if (!router.isReady || hasRedirectedRef.current) return;

    if (user?.status === 2 && user?.verified_screen_shown === false) {
      hasRedirectedRef.current = true;
      router.push({
        pathname: "/user/verified",
      });
    } else if (
      router.query?.edit &&
      user?.status === 2 &&
      user?.verified_screen_shown === true
    ) {
      hasRedirectedRef.current = true;
      router.push({
        pathname: "/auth/update-profile",
      });
    } else if (
      router.query?.type &&
      router.query?.edit
      // user?.status === 2 &&
      // user?.verified_screen_shown === true
    ) {
      hasRedirectedRef.current = true;
      router.push({
        pathname: "/auth/update-profile",
      });
    } else if (user?.status === 2 && user?.verified_screen_shown === true) {
      hasRedirectedRef.current = true;
      if (user?.gender === "female") {
        markCreateDateIntroSkipOnce(user);
        markFirstLoginCompleted(user);
        startOrResumeCreateDate(router, {
          token: user?.token,
          userName: user?.user_name,
        });
        return;
      }
      router.push({
        pathname: "/user/user-list",
      });
    } else if (user?.status === 3) {
      hasRedirectedRef.current = true;
      router.push({
        pathname: "/auth/block",
      });
    }
    //  else if (_.isEmpty(user)) {
    //   router.push({
    //     pathname: "/auth/login",
    //   });
    // }
  }, [
    router,
    router.isReady,
    router.query?.edit,
    router.query?.type,
    user,
  ]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="upload-pics profile-completion">
      <span className="completion-sign">
        {/* <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" className='success_svg'>
                    <g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                        <path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z" />
                        <path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621" />
                    </g>
                </svg> */}
        <svg
          width="55"
          height="49"
          viewBox="0 0 55 49"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="success_svg"
        >
          <path
            d="M13 20C13 20 16.2474 22.9845 18 25C19.7526 27.0155 23 31.5 23 31.5C23 31.5 30.2048 20.8885 36 15.5C41.7952 10.1115 51.5 5 51.5 5"
            stroke="white"
            stroke-width="5.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="circle"
          />
          <rect width="49" height="49" rx="16" fill="currentColor" />
          <mask
            id="mask0_2_1437"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="49"
            height="49"
          >
            <rect width="49" height="49" rx="16" fill="currentColor" />
          </mask>
          <g mask="url(#mask0_2_1437)">
            <path
              d="M14 20C14 20 17.2474 22.9845 19 25C20.7526 27.0155 24 31.5 24 31.5C24 31.5 31.2048 20.8885 37 15.5C42.7952 10.1115 52.5 5 52.5 5"
              stroke="white"
              stroke-width="5.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="circle"
            />
          </g>
        </svg>
      </span>
      <h2>
        {!loading && (router?.query?.token || user?.email_verified)
          ? //  user?.email_verified
            //   ?
            "Email Verified"
          : // : "Email Verification"
          router?.query?.edit
          ? "Profile Updated"
          : "Profile Completed"}
      </h2>
      <p className="pt-4">
        {!loading &&
          !user?.email_verified &&
          !tokenValid &&
          "You have already verified your email. Please provide us with 24hrs to conduct the review process. Ascend ensures optimal experience by only allowing serious members to join."}
        {!loading && user?.email_verified && (
          <>
            <p className="mb-4" style={{ color: "#fff" }}>
              Thanks for verifying your email address!
            </p>
            <p className="mb-4">
              Your profile description and images are currently under review.
              Please provide us with 24 hours to conduct the review process.
            </p>
            <p className="mb-4">
              Ascend takes pride in only allowing serious members who follow
              our policy and guidelines to join, which enables us to provide the
              most incredible experience to our users.
            </p>
            <a href="/home" style={{ textDecoration: "none" }}>
              <button className="explore-home-page-btn">
                Explore Our HomePage
              </button>
            </a>
          </>
        )}
        {!loading && !user?.email_verified && (
          <>
            <p>
              Thank you for creating your profile with Ascend. Please verify
              your account by clicking the link in the message sent to the email
              address on file. If you don't see the email, kindly check your
              spam folder.
            </p>
            {/* <p className="mt-4">
              please check your junk mail in case email not recieved on inbox.
            </p> */}
          </>
        )}

        {/* {!user?.email_verified ? (
          !tokenValid ? (
            "You have already verified your email. Please provide us with 24hrs to conduct the review process. Ascend ensures optimal experience by only allowing serious members to join."
          ) : (
            <>
              <p>
                Please verify your email address, by clicking on the link in the
                email that was delivered to your inbox.
              </p>
              <p className="mt-4">
                please check your junk mail in case email not recieved on inbox.
              </p>
            </>
          )
        ) : (
          <>
            <p className="mb-4">
              Please wait up to 24 hours for your profile to be verified.
            </p>
            <p>
              Ascend provide optimal experience by only allowing serious
              members to join.
            </p>
          </>
        )} */}
      </p>
      {!user?.email_verified ? (
        <span
          className={
            loading
              ? "resend-mail-text-active profile mt-5"
              : "resend-mail-text profile mt-5"
          }
          tabIndex="0"
          onClick={handleResendMail}
        >
          Resend an email
        </span>
      ) : (
        ""
      )}
      {/* <label className="text-label">
                Don’t wait any longer, start earning <br />
                now by posting your first date!
            </label> */}
      {/* <div className="secret-input type-submit" style={{ marginTop: '75px' }}>
                <button onClick={() => user?.gender === "male" ? router.push('/user/user-list') : router.push("/create-date/choose-city?showIntro=true")} className={`next ${!user?.email_verified ? 'disable' : ''}`} disabled={!user?.email_verified}>
                    {user?.gender === "male" ? 'GO TO GALLERY' : 'CREATE NEW DATE'}
                </button>
            </div> */}
    </div>
  );
};

export default CompleteProfile;
