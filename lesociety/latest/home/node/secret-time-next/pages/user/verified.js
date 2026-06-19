import React, { useEffect, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { startOrResumeCreateDate } from "utils/createDateFlow";
import { markCreateDateIntroSkipOnce } from "utils/createDateIntroState";
import { useState } from "react";
import Header from "core/header";
import Footer from "core/footer";
import withAuth from "../../core/withAuth";
import { apiRequest } from "utils/Utilities";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import { logout } from "@/modules/auth/authActions";

const Verfied = (props) => {
  const user = useSelector((state) => state.authReducer.user);
  const [tokenValid, setTokenValid] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (user?.verified_screen_shown === false && user?.status === 2) {
      redirectUserToList();
    }
  }, [user]);

  useEffect(() => {
    if (!router.isReady || hasRedirectedRef.current) return;
    if (user?.status !== 2 || user?.verified_screen_shown !== true) return;

    hasRedirectedRef.current = true;

    if (user?.gender === "female") {
      markCreateDateIntroSkipOnce(user);
      startOrResumeCreateDate(router, {
        token: user?.token,
        userName: user?.user_name,
      });
      return;
    }

    router.replace("/user/user-list");
  }, [
    router,
    router.isReady,
    user?.gender,
    user?.status,
    user?.token,
    user?.user_name,
    user?.verified_screen_shown,
  ]);

  // useEffect(() => {
  //   if (user?.verified_screen_shown === true && user?.status === 2) {
  //     router.push({
  //       pathname: "/user/user-list",
  //     });
  //   }
  // }, []);

  const redirectUserToList = async () => {
    try {
      const data = {
        email: user?.email,
        status: true,
      };

      const res = await apiRequest({
        data: data,
        method: "PUT",
        url: `user/update-verifiedscreen-status`,
      });
      console.log("res", res);
      if (res?.data)
        dispatch({
          type: AUTHENTICATE_UPDATE,
          payload: {
            verified_screen_shown: res?.data?.data?.user?.verified_screen_shown,
          },
        });
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };
  return (
    <div className="inner-page">
      <Header />

      <div className="inner-part-page auth-section">
        <div className="container">
          <div className="auth-section auth-section-register">
            <div>
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
                      <rect
                        width="49"
                        height="49"
                        rx="16"
                        fill="currentColor"
                      />
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
                <h2>Profile Verified</h2>
                <p className="pt-4">
                  <p className="mb-4 text-white">
                    Your Profile with Ascend Has Been Approved!
                  </p>
                  <p>
                    {user?.gender === "female"
                      ? "Thank you for being so patient! We've had the opportunity to review your images and profile and are pleased to let you know you can now browse Ascend and start the journey of finding your perfect match."
                      : "You can now start enjoying your new dating experience."}
                  </p>
                </p>
                {/* <label className="text-label">
                Don’t wait any longer, start earning <br />
                now by posting your first date!
            </label> */}
                <div
                  className="secret-input type-submit"
                  style={{ marginTop: "75px" }}
                >
                  <button
                    onClick={() =>
                      user?.gender === "male"
                        ? router.push("/user/user-list")
                        : (() => {
                            markCreateDateIntroSkipOnce(user);
                            return startOrResumeCreateDate(router, {
                              token: user?.token,
                              userName: user?.user_name,
                            });
                          })()
                    }
                    className={`next ${!user?.email_verified ? "disable" : ""}`}
                    disabled={!user?.email_verified}
                  >
                    {user?.gender === "male"
                      ? "FIND A DATE"
                      : "CREATE NEW DATE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withAuth(Verfied);
