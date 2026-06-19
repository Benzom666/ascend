import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CustomIcon } from "core/icon";
const UserImg = "/assets/img/profile.png";
import Image from "next/image";
import { formatDisplayName } from "utils/formatDisplayText";
import SubHeading from "./SubHeading";
import H5 from "./H5";
import { HiBadgeCheck } from "react-icons/hi";
import { FiChevronRight } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { deAuthenticateAction, logout } from "../modules/auth/authActions";
import { useRouter } from "next/router";
import _ from "lodash";
import { BiTime } from "react-icons/bi";
const close1 = "/assets/close1.png";
import { reset, initialize } from "redux-form";
import classNames from "classnames";
import useWindowSize from "utils/useWindowSize";
import { apiRequest, showToast } from "utils/Utilities";
import io from "socket.io-client";
import { socket } from "pages/user/user-list";
import PricingMenuModal from "./PricingMenuModal";
import DynamicRing from "../components/common/DynamicRing";
import CreateDatePrimaryButton from "../components/common/CreateDatePrimaryButton";
const interestedLocked = "/assets/interested-locked.svg";
const superInterestedLocked = "/assets/superinterested-locked.svg";
const interestedText = "/assets/interestedtext.svg";
const superInterestedText = "/assets/superinterestedtext.svg";
import { startOrResumeCreateDate } from "utils/createDateFlow";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import { fetchPricingConfig, getDefaultPricingConfig } from "../utils/pricingConfig";

function sideBarPopup({ isOpen, toggle, count }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showMaxDatesPopup, setShowMaxDatesPopup] = useState(false);
  const [pricingConfig, setPricingConfig] = useState(getDefaultPricingConfig());
  const width = useWindowSize();
  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [documentUpoaded, setDocumentUpoaded] = useState(false);
  const [notifData, setNotifdata] = useState(null);

  // Fetch live pricing config when user token changes
  useEffect(() => {
    let isActive = true;
    const loadPricingConfig = async () => {
      try {
        const config = await fetchPricingConfig(user?.token);
        if (isActive) {
          setPricingConfig(config);
        }
      } catch (error) {
        console.log("[SIDEBAR_POPUP] Failed to load pricing config", error?.message);
      }
    };
    if (user?.token) {
      loadPricingConfig();
    }
    return () => { isActive = false; };
  }, [user?.token]);
  
  // Token counts for both genders
  const interestedTokens = user?.interested_tokens || 0;
  const superInterestedTokens = user?.super_interested_tokens || 0;
  const chatTokens = user?.chat_tokens || 0;
  const interestedTokensMax = Math.max(
    Number(user?.interested_tokens_max) || 0,
    interestedTokens
  );
  const superInterestedTokensMax = Math.max(
    Number(user?.super_interested_tokens_max) || 0,
    superInterestedTokens
  );
  const chatTokensMax = Math.max(Number(user?.chat_tokens_max) || 0, chatTokens);
  const isPaidMember = interestedTokens > 0 || superInterestedTokens > 0;
  const hasEverPurchasedTokens = Math.max(
    interestedTokensMax,
    superInterestedTokensMax,
    chatTokensMax
  ) > 0;
  const showLockedTokens = !isPaidMember && !hasEverPurchasedTokens;
  const forceFullSidebarRings = false;

  const handleCreateDate = async () => {
    const activeCount = user?.active_dates_count || 0;
    if (activeCount >= 4) {
      setShowMaxDatesPopup(true);
      return;
    }
    const result = await startOrResumeCreateDate(router, {
      token: user?.token,
      userName: user?.user_name,
      activeDatesCount: activeCount,
      onLimitReached: () => setShowMaxDatesPopup(true),
    });

    if (result?.status === "started" || result?.status === "resumed") {
      toggle();
    }
  };

  useEffect(() => {
    if (user?.selfie && user?.document) {
      setDocumentUpoaded(true);
    }
  }, [user]);

  // Prefetch /create-date/choose-city for female users so the route bundle
  // is downloaded in the background; clicking "Create New Date" then only
  // costs a navigation, not a bundle fetch. Mirrors the same prefetch in
  // core/sidebar.js so both desktop popup and mobile drawer benefit.
  useEffect(() => {
    if (user?.gender !== "female") return;
    if (!router?.prefetch) return;
    try {
      router.prefetch("/create-date/choose-city");
    } catch (e) {
      // best-effort prefetch
    }
  }, [router, user?.gender]);

  // const fetchNotifications = async () => {
  //   try {
  //     const params = {
  //       user_email: user.email,
  //       sort: "sent_time",
  //     };
  //     const { data } = await apiRequest({
  //       method: "GET",
  //       url: `notification`,
  //       params: params,
  //     });
  //     setNotifdata(data?.data?.notification);
  //   } catch (err) {
  //     console.error("err", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // useEffect(() => {
  //   if (isOpen) {
  //     fetchNotifications();
  //   }
  // }, [isOpen]);

  // useEffect(() => {
  //   socket.auth = { user: "admin@getnada.com" };
  //   socket.connect();
  //   console.log("socket", socket.auth);
  //   socket.on("connect", () => {
  //     console.log("connected", socket.connected);
  //   });
  //   socket.on("disconnect", (reason) => {
  //     console.log("socket disconnected reason", reason);
  //   });
  //   console.log("socket Notif socket intiated called");
  // }, []);

  // useEffect(() => {
  //   socket.on("connect_error", () => {
  //     console.log("connect_error");
  //     socket.auth = { user: user };
  //     socket.connect();
  //   });
  // }, [!socket.connected]);

  // useEffect(() => {
  //   console.log("Notif socket connected", socket.connected);
  //   socket.on("connect", () => {
  //     console.log(socket.id);
  //   });
  //   socket.on(`push-notification-${user.email}`, (message) => {
  //     console.log("notif received", message);
  //     const unc = message?.notifications?.filter(
  //       (item) => item.status === 0 && item.type !== "notification"
  //     ).length;
  //     localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
  //     setCount(unc);
  //   });
  // }, [socket.connected]);

  // useEffect(() => {
  //   console.log("notiffff ", notifData);
  //   const unc = notifData?.filter(
  //     (item) => item.status === 0 && item.type !== "notification"
  //   ).length;
  //   console.log("count ", unc);
  //   localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
  //   let unreadNotifCount;
  //   unreadNotifCount = localStorage.getItem("unreadNotifCount");
  //   setCount(unreadNotifCount);
  //   console.log("unreadNotifCount ", unreadNotifCount);
  // }, [notifData]);

  const memberSince = user?.created_at
    ? new Date(user?.created_at)?.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const defaultMaxChats = 15;
  const freeChats = Number(user?.remaining_chats) || 0;
  const remainingChats = (Number(chatTokens) || 0) + freeChats;
  const ringMaxChats = Math.max(0, (chatTokensMax || 0)) + defaultMaxChats;
  const womenPlan = (() => {
    if (user?.gender !== "female") return null;
    if (chatTokensMax >= 100) return { title: "Supercharged Pass", detail: "Queens 100" };
    if (chatTokensMax > 0) return { title: "Priority Pass", detail: "A la carte" };
    return { title: "Test Drive", detail: "Limited Access" };
  })();

  return (
    <>
      <MaxDatesReachedPopup
        isOpen={showMaxDatesPopup}
        onClose={() => {
          setShowMaxDatesPopup(false);
        }}
      />
      <PricingMenuModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
        returnContext="sidebar"
        pricingConfig={pricingConfig}
      />
      <div
        className={classNames(
        `modal fade ${
          isOpen ? "show d-block modal-open modal-open-1" : "d-none"
        }`,
        width > 1399 && "modal-fade-1"
      )}
      id="sidebarPop"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      //style={{ padding: "15px" }}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div
        className="modal-dialog modal-custom-dailog"
        style={{ marginTop: "47px" }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "black",
            width: "290px",
            //borderRadius: "10px",
          }}
        >
          <div
            className="modal-header p-0"
            style={{ borderBottom: "none", postion: "relative" }}
          >
            <button
              type="button"
              className="btn-close btn-custom"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={toggle}
            >
              <Image
                src={close1}
                alt="user image"
                width={52}
                height={52}
                // className="date-preview-img"
              />
            </button>
          </div>
          <div className="modal-body" style={{ height: `cal(100vh-25%)` }}>
            <div className="sidebar_wrap">
              <div
                className="user-card-sidebar"
                style={{ padding: " 20px 25px" }}
              >
                <div className="d-flex align-items-center mb-4">
                  <figure className="mb-0 p-0">
                    <img
                      src={!_.isEmpty(user) ? user?.images?.[0] : UserImg}
                      alt="user image"
                      width={40}
                      height={40}
                    />
                  </figure>
                  <span className="userdetails">
                    <H5>{formatDisplayName(user?.user_name) || ""}</H5>
                    <SubHeading title={`Member since ${memberSince}`} />
                  </span>
                </div>
                <div className="d-flex align-items-center mb-0 header_btn_wrap">
                  {router.asPath === "/user/user-profile" ? (
                    <a className="cursor-pointer" onClick={toggle}>
                      View Profile
                    </a>
                  ) : (
                    <Link href="/user/user-profile">
                      <a onClick={toggle}>View Profile</a>
                    </Link>
                  )}

                  <Link href="/auth/profile?edit=true">
                    <a onClick={toggle}>Edit Profile</a>
                  </Link>
                </div>
              </div>
              {/* Current Plan Section - Men Only */}
              {user?.gender === "male" && (
                <div className="user-card-sidebar sidebar-plan-card">
                  <div className="sidebar-plan-header">
                    <div className="sidebar-plan-label">Current Plan</div>
                    <div className="sidebar-plan-name">
                      {isPaidMember ? (
                        <>
                          <span><strong className="priority-member-strong">Priority Member</strong> – Full Access</span>
                        </>
                      ) : (
                        <>
                          <span>
                            <strong className="priority-member-strong">The Test Drive</strong>: Limited Access
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {!isPaidMember ? (
                    <>
                      <div className="sidebar-plan-icons sidebar-plan-active">
                        {showLockedTokens ? (
                          <>
                            <div className="token-circle locked">
                              <img
                                src={interestedLocked.src || interestedLocked}
                                alt="Interested locked"
                              />
                            </div>
                            <div className="token-circle locked">
                              <img
                                src={superInterestedLocked.src || superInterestedLocked}
                                alt="Super Interested locked"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="token-circle active">
                              <img
                                src={interestedText.src || interestedText}
                                alt="Interested"
                                className="token-label-svg interested-label"
                              />
                              <DynamicRing
                                className="token-circle-inner"
                                valueClassName="token-value-unlocked"
                                value={0}
                                max={interestedTokensMax || undefined}
                                alt="Interested Ring"
                                baseRingImage="/ringmenout.svg"
                                progressRingImage="/ringmen.svg"
                                preferSvg={true}
                                roundedCaps={true}
                                startAngleDeg={90}
                                minVisibleSweep={0}
                                max={interestedTokensMax}
                                forceProgress={forceFullSidebarRings ? 0 : undefined}
                              />
                            </div>
                            <div className="token-circle active">
                              <img
                                src={superInterestedText.src || superInterestedText}
                                alt="Super Interested"
                                className="token-label-svg super-interested-label"
                              />
                              <DynamicRing
                                className="token-circle-inner"
                                valueClassName="token-value-unlocked"
                                value={0}
                                max={superInterestedTokensMax || undefined}
                                alt="Super Interested Ring"
                                baseRingImage="/ringmenout.svg"
                                progressRingImage="/ringmen.svg"
                                preferSvg={true}
                                roundedCaps={true}
                                startAngleDeg={90}
                                minVisibleSweep={0}
                                max={superInterestedTokensMax}
                                forceProgress={forceFullSidebarRings ? 0 : undefined}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="sidebar-plan-note">Add tokens to get started.</div>
                    </>
                  ) : (
                    <>
                      <div className="sidebar-plan-icons sidebar-plan-active">
                        <div className="token-circle active">
                          <img 
                            src={interestedText.src || interestedText}
                            alt="Interested" 
                            className="token-label-svg interested-label"
                          />
                          <DynamicRing
                            className="token-circle-inner"
                            valueClassName="token-value-unlocked"
                            value={interestedTokens}
                            max={interestedTokensMax || undefined}
                            alt="Interested Ring"
                            baseRingImage="/ringmenout.svg"
                            progressRingImage="/ringmen.svg"
                            preferSvg={true}
                            roundedCaps={true}
                            startAngleDeg={90}
                            minVisibleSweep={0}
                            max={interestedTokensMax}
                            forceProgress={
                              forceFullSidebarRings
                                ? (interestedTokens > 0 ? 1 : 0)
                                : undefined
                            }
                          />
                        </div>
                        <div className="token-circle active">
                          <img 
                            src={superInterestedText.src || superInterestedText}
                            alt="Super Interested" 
                            className="token-label-svg super-interested-label"
                          />
                          <DynamicRing
                            className="token-circle-inner"
                            valueClassName="token-value-unlocked"
                            value={superInterestedTokens}
                            max={superInterestedTokensMax || undefined}
                            alt="Super Interested Ring"
                            baseRingImage="/ringmenout.svg"
                            progressRingImage="/ringmen.svg"
                            preferSvg={true}
                            roundedCaps={true}
                            startAngleDeg={90}
                            minVisibleSweep={0}
                            max={superInterestedTokensMax}
                            forceProgress={
                              forceFullSidebarRings
                                ? (superInterestedTokens > 0 ? 1 : 0)
                                : undefined
                            }
                          />
                        </div>
                      </div>
                      <div className="sidebar-plan-note">Need more? Top up anytime.</div>
                    </>
                  )}
                  
                  <button
                    type="button"
                    className="sidebar-topup-btn"
                    onClick={() => setShowPricingModal(true)}
                  >
                    Top Up Tokens
                  </button>
                </div>
              )}
              {/* Membership Section - Women Only (Conversations) */}
              {user?.gender === "female" && (
                <div className="user-card-sidebar sidebar-membership-card sidebar-membership-card--women">
                  <div className="sidebar-membership-header">
                    <div className="sidebar-membership-label">Membership</div>
                    <div className="sidebar-membership-plan">
                      {womenPlan ? (
                        <span>
                          <strong className="priority-member-strong">{womenPlan.title}</strong>{" "}
                          - {womenPlan.detail}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="sidebar-membership-row">
                    <div className="sidebar-membership-text">
                      <div
                        className="sidebar-membership-title women-membership-title"
                      >
                        <span>Conversations Left.</span>
                      </div>
                      <div className="sidebar-membership-subtext">
                        <span className="sidebar-membership-subtext-line">
                          Start a new chat anytime.
                        </span>
                        <span className="sidebar-membership-subtext-line">
                          Your balance updates as you go.
                        </span>
                      </div>
                    </div>
                    <DynamicRing
                      className="sidebar-ring"
                      valueClassName="sidebar-ring-value women-ring-value"
                      value={remainingChats}
                      max={ringMaxChats}
                      minMax={defaultMaxChats}
                      alt="Chat Ring"
                      baseRingImage="/ringmenout.svg"
                      progressRingImage="/ringmen.svg"
                      preferSvg={true}
                      roundedCaps={true}
                      startAngleDeg={90}
                      minVisibleSweep={0}
                      forceProgress={
                        forceFullSidebarRings
                          ? (remainingChats > 0 ? 1 : 0)
                          : undefined
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="sidebar-topup-btn"
                    onClick={() => {
                      toggle();
                      setShowPricingModal(true);
                    }}
                  >
                    Top Up Tokens
                  </button>
                </div>
              )}
              <div className="verification_card_header text-center mb-3 women-verify-section">
                <div className="d-flex align-items-center mb-0 header_btn_wrap">
                  <button
                    type="button"
                    className="d-flex align-items-center justify-content-center profile-btn women-sidebar-action-btn"
                    style={{
                      position: "static",
                      bottom: "auto",
                      width: "100%",
                      marginBottom: 0,
                    }}
                    onClick={() =>
                      !documentUpoaded && router.push("/verified-profile")
                    }
                  >
                    <span className="pt-0">
                      {user?.documents_verified
                        ? "VERIFIED"
                        : !documentUpoaded
                        ? "VERIFY PROFILE"
                        : "PENDING"}
                    </span>
                    {user?.documents_verified ? (
                      <HiBadgeCheck
                        color={"white"}
                        size={25}
                        style={{ paddingLeft: "5px" }}
                      />
                    ) : !documentUpoaded ? (
                      <HiBadgeCheck
                        color={"white"}
                        size={25}
                        style={{ paddingLeft: "5px" }}
                      />
                    ) : (
                      <BiTime
                        color={"grey"}
                        size={25}
                        style={{ paddingLeft: "5px" }}
                      />
                    )}
                  </button>
                </div>
                <SubHeading title="Let them know you are real" />
              </div>
              {user?.gender === "female" && (
                <div className="verification_card_header text-center mb-0 women-create-date-section">
                  {/* <div className="mb-1">
                                        <CustomIcon.ChampaignCaviar color={"#AFABAB"} size={50} />
                                    </div> */}
                  {/* <SubHeading title="Stay ahead of the crowd" /> */}
                  <div className="d-flex align-items-center mb-0 mt-1 header_btn_wrap women-create-date-wrap">
                    <CreateDatePrimaryButton
                      onClick={handleCreateDate}
                      className="create-date women-sidebar-action-btn women-create-date-btn"
                    >
                      Create New Date
                    </CreateDatePrimaryButton>
                  </div>
                  <SubHeading title="Stay ahead of the crowd" />
                </div>
              )}
              {user?.gender !== "female" && (
                <div className="user-card-sidebar">
                  <div
                    className="sidebar_nav_links "
                    style={{ marginTop: "50px", padding: "15px 15px 0px 15px" }}
                  >
                    <ul>
                      <li>
                        <Link href="/">
                          <a>
                            Setting <FiChevronRight size={22} />{" "}
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/">
                          <a>
                            Privacy <FiChevronRight size={22} />
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/">
                          <a>
                            Terms <FiChevronRight size={22} />
                          </a>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              <div
                className="bottom-footer-sidebar"
                style={{ position: "inherit" }}
              >
                <div className="d-flex align-items-center mb-0 header_btn_wrap log-btn login-btn">
                  <button
                    className="log-btn d-flex align-items-center justify-content-center"
                    type="button"
                    style={{ lineHeight: "3" }}
                    onClick={() => {
                      logout(router, dispatch);
                    }}
                  >
                    Log Out
                  </button>
                </div>
                <div className="d-flex align-items-center mb-0 header_btn_wrap">
                  <button
                    className="d-flex align-items-center justify-content-center"
                    type="button"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#f24462",
                      fontSize: "13px",
                      margin: "8px auto 0 auto",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Are you sure you want to permanently delete your account? This cannot be undone."
                      );
                      if (!confirmed) return;
                      try {
                        await apiRequest({
                          method: "DELETE",
                          url: "user/account",
                          token: user?.token,
                        });
                        showToast(
                          "Your account has been deleted successfully.",
                          "success"
                        );
                        logout(router, dispatch);
                      } catch (err) {
                        showToast(
                          err?.response?.data?.message ||
                            "Failed to delete account. Please try again.",
                          "error"
                        );
                      }
                    }}
                  >
                    Delete Account
                  </button>
                </div>
                <SubHeading title="Ascend. Copyright 2026 " />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default sideBarPopup;

//calc(-0.5 * var(--bs-gutter-x))
