import React, { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "core/header";
import Footer from "core/footer";
import withAuth from "@/core/withAuth";
import { apiRequest } from "utils/Utilities";
import { PROFILE_UNVERIFIED } from "data/constants";
import { logout } from "@/modules/auth/authActions";

const VerifyProfile = () => {
  const user = useSelector((state) => state.authReducer.user);
  const [tokenValid, setTokenValid] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const [notifData, setNotifData] = useState(null);

  const fetchNotifications = async () => {
    try {
      const params = {
        user_email: user.email,
        sort: "sent_time",
      };
      const { data } = await apiRequest({
        method: "GET",
        url: `notification`,
        params: params,
      });
      setNotifData(
        data?.data?.notification[data?.data?.notification?.length - 1]
      );
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

  const authState = useSelector((state) => state.authReducer);
  const userLogin = authState?.user;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    console.log("called", authState);
    if (authState?.isLoggedIn) {
      //debugger
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
        } else if (userLogin?.status === 3) {
          router.push({
            pathname: "/auth/block",
          });
        }

        // else if (userLogin?.request_change_fired) {
        //   console.log("request change called")
        //   router.push({
        //     pathname: "/auth/verify-profile",
        //   });
        // }

        // else {
        //   console.log("auth/profile called")
        //   router.push({
        //     pathname: "/auth/profile",
        //   });
        // }
      }
    }
  }, [userLogin, router?.isReady]);

  console.log("notif ", notifData);

  return (
    <div className="inner-page">
      <Header />

      <div className="inner-part-page auth-section">
        <div className="container">
          <div className="auth-section auth-section-register">
            <div>
              <div className="upload-pics profile-completion">
                <h2>Verification Unsuccessful</h2>
                <p className="pt-4">{`${PROFILE_UNVERIFIED}`}</p>
                <p className="pt-4" style={{ color: "#fff" }}>
                  {`${notifData?.message}`}
                </p>
              </div>
            </div>
            <div className="btn-container-2">
              <button
                className="edit-btn-verify"
                onClick={() =>
                  router.push({
                    pathname: "/auth/profile",
                    query: {
                      edit: true,
                      type: notifData?.type,
                      id: notifData?._id,
                    },
                  })
                }
              >
                Edit now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default withAuth(VerifyProfile);
