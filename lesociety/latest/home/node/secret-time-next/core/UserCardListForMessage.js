import React, { useMemo, useRef } from "react";
const UserImg = "/assets/img/profile.png";
const UserImg3 = "/assets/img/user-3.png";
const UserImg4 = "/assets/img/user-4.png";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
import H5 from "./H5";
import { dateCategory } from "utils/Utilities";
import { IoIosClose } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { HiLockOpen } from "react-icons/hi";
import { useRouter } from "next/router";
import { apiRequest } from "./../utils/Utilities";
import SkeletonUserCardListForMessage from "@/modules/skeleton/SkeletonUserCardListForMessage";
import SkeletonElement from "@/modules/skeleton/SkeletonElement";
import ImageShow from "@/modules/ImageShow";
import useWindowSize from "utils/useWindowSize";
import { logout } from "@/modules/auth/authActions";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import { useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/bodyScrollLock";
const StarIcon = "/assets/star1.svg";
const SuperInterestedHorizontalIcon = "/assets/superinterested-horizontal.svg";
import TimerProgressBar from "../components/TimerProgressBar";

const REQUESTS_RETURN_STATE_KEY = "messages-requests-return-state";

const UserCardListForMessage = ({
  conversations,
  setConversations,
  isDesktopView,
  getConversations,
  setCurrentChat,
  tabIndexChange,
  selectedTabIndex,
  socket,
  toggleChat,
  mobile,
}) => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [dateDetailsIsOpen, setDateDetailsIsOpen] = React.useState(false);
  const [msgModal, setMsgModal] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [liveTimers, setLiveTimers] = React.useState({});
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const growRef = useRef(null);
  const pendingConversations = useMemo(
    () => conversations.filter((conversation) => conversation?.status == 0),
    [conversations]
  );

  const getConversationTimerKey = (conversation) =>
    conversation?._id ||
    conversation?.message?._id ||
    conversation?.message?.room_id ||
    [
      conversation?.message?.sender_id || "sender",
      conversation?.user?._id || "user",
      conversation?.expires_at || conversation?.message?.sent_time || conversation?.createdAt || "time",
    ].join("-");

  // Live countdown: update remaining seconds for all conversations every second
  React.useEffect(() => {
    if (!pendingConversations || pendingConversations.length === 0) return;
    const interval = setInterval(() => {
      setLiveTimers((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        pendingConversations.forEach((c) => {
          const key = getConversationTimerKey(c);
          const createdAt =
            c?.expires_at || c?.message?.sent_time || c?.message?.createdAt || c?.createdAt;
          if (!createdAt || !key) return;
          let remainingMs;
          if (c?.expires_at) {
            remainingMs = new Date(c.expires_at).getTime() - Date.now();
          } else {
            const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
            remainingMs = Math.max((48 * 3600 - elapsed) * 1000, 0);
          }
          const newRemaining = Math.max(Math.floor(remainingMs / 1000), 0);
          if (next[key] !== newRemaining) {
            next[key] = newRemaining;
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingConversations]);

  useEffect(() => {
    if (!modalIsOpen) {
      setPageLoading(true);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setPageLoading(false);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [modalIsOpen]);

  useEffect(() => {
    if (modalIsOpen) {
      lockBodyScroll("message-requests-modal");
    } else {
      unlockBodyScroll("message-requests-modal");
    }

    return () => {
      unlockBodyScroll("message-requests-modal");
    };
  }, [modalIsOpen]);

  const dispatch = useDispatch();

  const width = useWindowSize();
  const isMobileViewport = typeof width === "number" ? width <= 767 : false;
  function openModal() {
    setIsOpen(true);
    setPageLoading(true);
  }
  function closeModal() {
    setIsOpen(false);
    setPageLoading(false);
    tabIndexChange(0);
  }

  const persistReturnState = (conversation) => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      REQUESTS_RETURN_STATE_KEY,
      JSON.stringify({
        source: "messages-requests",
        requestId: conversation?._id || null,
        roomId: conversation?.message?.room_id || null,
        reopenModal: true,
      })
    );
  };

  const openPendingReplyConversation = (room_id, conversation) => {
    persistReturnState(conversation);
    setCurrentChat(conversation);
    closeModal();
    router.push(`/messages/${room_id}`);
  };

  const showText = (text) => {
    if (text?.length > 40) {
      return text.substring(0, 40) + "...";
    } else {
      return text;
    }
  };

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1.05,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
    // adaptiveHeight: true,
  };
  const customStyles = {
    content: {
      top: isMobileViewport ? "0" : "50%",
      left: isMobileViewport ? "0" : "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: isMobileViewport ? "none" : "translate(-50%, -50%)",
      width: isMobileViewport ? "100vw" : "312px",
      maxWidth: isMobileViewport ? "100vw" : "312px",
      background: "transparent",
      height: isMobileViewport ? "100dvh" : "100%",
      padding: 0,
      border: "none",
      borderRadius: 0,
      //overFlowY: "auto",
    },
    overlay: {
      backdropFilter: "blur(5px)",
    },
  };

  return (
    <>
      <div
        onClick={openModal}
        className={`${
          pendingConversations.filter(
            (c) => c.status == 0 && c.message?.sender_id !== user?._id
          )?.length === 0 &&
          selectedTabIndex !== 1 &&
          "request__header"
        }`}
      >
        <span>
          {
            // conversations?.length > 0
            //   ? conversations.filter(
            //       (c) => c.status == 0 && c.message?.sender_id !== user?._id
            //     )?.length > 0 &&
            pendingConversations.filter(
              (c) => c.status == 0 && c.message?.sender_id !== user?._id
            )?.length
            // : ""
          }
        </span>{" "}
        Requests
      </div>

      {!isDesktopView &&
        conversations?.length > 0 &&
        pendingConversations.filter(
          (c) => c.status == 0 && c.message?.sender_id !== user?._id
        )?.length > 0 && (
          <Modal
            isOpen={modalIsOpen}
            //onRequestClose={closeModal}
            style={customStyles}
            className={
              modalIsOpen
                ? "intrested_model modal-open-blur"
                : "intrested_model"
            }
            ariaHideApp={false}
          >
            <div className="model_content">
              {pageLoading ? (
                <SkeletonElement type="close-icon-view-profile" />
              ) : (
                <IoIosClose
                  size={100}
                  className="close_btn"
                  onClick={closeModal}
                  color={"#A8A8A8"}
                />
              )}

              <Slider {...settings}>
                {pendingConversations.length > 0
                  ? pendingConversations.map((conversation) => {
                          const profilePic =
                            conversation.user?.images?.length > 0
                              ? conversation.user?.images[0]
                              : "";

                          const isSuper =
                            conversation?.isSuperInterested ??
                            conversation?.message?.isSuperInterested ??
                            conversation?.message?.is_super_interested ??
                            false;
                          const totalHours = 48;
                          const createdAt =
                            conversation?.expires_at ||
                            conversation?.message?.sent_time ||
                            conversation?.message?.createdAt ||
                            conversation?.createdAt;
                          let remainingHours = totalHours;
                          let remainingSeconds = totalHours * 3600;
                          let remainingMinutes = 0;
                          let displaySeconds = 0;
                          if (createdAt) {
                            const key = getConversationTimerKey(conversation);
                            if (key && liveTimers[key] !== undefined) {
                              remainingSeconds = liveTimers[key];
                            } else if (conversation?.expires_at) {
                              const remainingMs =
                                new Date(conversation.expires_at).getTime() - Date.now();
                              remainingSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
                            } else {
                              const elapsed =
                                (Date.now() - new Date(createdAt).getTime()) /
                                (1000 * 60 * 60);
                              remainingSeconds = Math.max(
                                Math.floor((totalHours - elapsed) * 3600),
                                0
                              );
                            }
                            remainingHours = Math.floor(remainingSeconds / 3600);
                            remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
                            displaySeconds = remainingSeconds % 60;
                          }

                          const formatExpiry = () => {
                            if (remainingHours > 0) {
                              return `${remainingHours}h ${remainingMinutes}m ${displaySeconds}s`;
                            }
                            if (remainingMinutes > 0) {
                              return `${remainingMinutes}m ${displaySeconds}s`;
                            }
                            return `${displaySeconds}s`;
                          };

                          return pageLoading ? (
                            <SkeletonUserCardListForMessage
                              conversation={conversation}
                              getConversations={getConversations}
                              user={user}
                              setCurrentChat={setCurrentChat}
                              tabIndexChange={tabIndexChange}
                              selectedTabIndex={selectedTabIndex}
                              socket={socket}
                              profilePic={profilePic}
                            />
                          ) : (
                            <div
                              key={getConversationTimerKey(conversation)}
                              className="request-slide-card"
                            >
                              <H5 style1={true}>
                                {conversation?.user?.user_name} is
                              </H5>
                              {/* <div ">
                                Super
                              </div> */}
                              <div className="request__message__super__text">
                                {isSuper ? (
                                  <Image
                                    src={SuperInterestedHorizontalIcon}
                                    width={304}
                                    height={87}
                                    alt="Super Interested"
                                    className="request__message__super__label"
                                  />
                                ) : (
                                  <CustomIcon.IntrestedText
                                    color={"white"}
                                    size={150}
                                  />
                                )}
                              </div>
                              <div
                                className={`superinterested__icon__div ${
                                  isSuper
                                    ? "superinterested__margin"
                                    : ""
                                }`}
                              >
                                {isSuper && (
                                  <div className="superinterested__icon">
                                    <Image
                                      src={StarIcon}
                                      height={53}
                                      width={53}
                                    />
                                  </div>
                                )}

                                <figure
                                  className={isSuper ? "request__figure--super" : ""}
                                  style={{ position: 'relative' }}
                                >
                                  <ImageShow
                                    className="requested-profile-img"
                                    max-width={312}
                                    width="95%"
                                    height={320}
                                    src={profilePic}
                                    alt="user image"
                                    placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                                  />
                                  {remainingHours > 0 && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '40px',
                                      right: '20px',
                                      background: '#000000',
                                      border: '2px solid #F24462',
                                      borderRadius: '50%',
                                      width: '36px',
                                      height: '36px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontFamily: '"Conv_Helvetica", "Helvetica", Arial, sans-serif',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      color: '#FFFFFF',
                                      zIndex: 10
                                    }}>
                                      {remainingHours > 0 ? `${remainingHours}h` : remainingMinutes > 0 ? `${remainingMinutes}m` : `${displaySeconds}s`}
                                    </div>
                                  )}
                                  <div className="image_tagline">
                                    <div className="image_tagline-message">
                                      "{showText(conversation?.message?.message)}"
                                    </div>
                                    <div className="request-expiry">
                                      <div className="request-expiry-text">
                                        Request expires in {formatExpiry()}
                                      </div>
                                      <TimerProgressBar
                                        totalSeconds={totalHours * 3600}
                                        remainingSeconds={remainingSeconds}
                                        maxWidth={240}
                                        height={5}
                                      />
                                    </div>
                                  </div>
                                </figure>
                              </div>
                              <div className="d-flex align-items-center my-4 header_btn_wrap">
                                <a
                                  className="create-date"
                                  style={{
                                    height: "40px",
                                    width: "85%",
                                    marginLeft: "6%",
                                    paddingTop: "2px",
                                  }}
                                  onClick={() => {
                                    openPendingReplyConversation(
                                      conversation?.message?.room_id,
                                      conversation
                                    );
                                  }}
                                >
                                  START CONVERSATION
                                </a>
                              </div>
                              <div className="my-4 bottom_content">
                                {/* <Link href="/user/user-profile"> */}
                                <a
                                  className="view_profile"
                                  onClick={() => {
                                    persistReturnState(conversation);
                                    router.push({
                                      pathname: "/user/user-profile/[userName]",
                                      query: {
                                        userName: conversation?.user?.user_name,
                                        source: "message-request",
                                        requestId:
                                          conversation?._id ||
                                          conversation?.message?.room_id,
                                        roomId:
                                          conversation?.message?.room_id ||
                                          conversation?._id,
                                      },
                                    });
                                  }}
                                >
                                  <HiLockOpen />{" "}
                                  <span style={{ textDecoration: "underline" }}>
                                    View Profile
                                  </span>
                                </a>
                                {/* </Link> */}
                                <p>
                                  {conversation?.user?.user_name} has granted
                                  you the access to his profile
                                </p>
                              </div>
                            </div>
                          );
                    })
                  : "No Request yet"}
              </Slider>
            </div>
          </Modal>
        )}
    </>
  );
};

export default UserCardListForMessage;
