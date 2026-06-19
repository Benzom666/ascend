import React, { useRef } from "react";
const UserImg = "/assets/img/profile.png";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
import H5 from "../../core/H5";
import { apiRequest, dateCategory } from "utils/Utilities";
import { IoIosClose } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { HiLockOpen } from "react-icons/hi";
import { useRouter } from "next/router";
import SkeletonUserCardListForMessage from "@/modules/skeleton/SkeletonUserCardListForMessage";
import SkeletonElement from "@/modules/skeleton/SkeletonElement";
import ImageShow from "@/modules/ImageShow";
import useWindowSize from "utils/useWindowSize";
import { logout } from "@/modules/auth/authActions";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
const StarIcon = "/assets/star1.svg";
const SuperInterestedHorizontalIcon = "/assets/superinterested-horizontal.svg";
import TimerProgressBar from "../../components/TimerProgressBar";
import PaywallModal from "../../core/PaywallModal";
import { usePaywall } from "../../hooks/usePaywall";

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
  isOpen = false,
  initialRequestId = null,
  onClose = () => {},
}) => {
  const [modalIsOpen, setIsOpen] = React.useState(isOpen);
  const [dateDetailsIsOpen, setDateDetailsIsOpen] = React.useState(false);
  const [msgModal, setMsgModal] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [viewProfileLoadingId, setViewProfileLoadingId] = React.useState(null);
  const [profileFrame, setProfileFrame] = React.useState(null);
  const [profileFrameReady, setProfileFrameReady] = React.useState(false);
  const [replyLoadingId, setReplyLoadingId] = React.useState(null);
  const [chatFrame, setChatFrame] = React.useState(null);
  const [chatFrameReady, setChatFrameReady] = React.useState(false);
  const [liveTimers, setLiveTimers] = React.useState({});
  const user = useSelector((state) => state.authReducer.user);
  const authUser = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const sliderRef = useRef(null);
  const growRef = useRef(null);
  const { paywallConfig, pricingConfig, showLadiesChatPaywall, closePaywall } = usePaywall();

  const dispatch = useDispatch();

  const width = useWindowSize();
  const isMobileViewport = typeof width === "number" ? width <= 767 : false;
  const closeModalRef = useRef(false);
  function openModal() {
    setIsOpen(true);
    setPageLoading(true);
  }
  function closeModal(event) {
    if (event?.preventDefault) event.preventDefault();
    if (closeModalRef.current) return;
    closeModalRef.current = true;
    setPageLoading(false);
    setIsOpen(false);
    setProfileFrame(null);
    setProfileFrameReady(false);
    setViewProfileLoadingId(null);
    setChatFrame(null);
    setChatFrameReady(false);
    setReplyLoadingId(null);
    tabIndexChange(0);
    onClose();
    setTimeout(() => {
      closeModalRef.current = false;
    }, 300);
  }
  
  // Sync external isOpen prop with internal state
  React.useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (!modalIsOpen) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
  }, [modalIsOpen]);

  const pendingConversations = React.useMemo(
    () => conversations?.filter((c) => c.status == 0) || [],
    [conversations]
  );

  React.useEffect(() => {
    if (!modalIsOpen) {
      return;
    }

    setPageLoading(false);
  }, [modalIsOpen, pendingConversations.length]);

  React.useEffect(() => {
    if (!modalIsOpen || !initialRequestId || !sliderRef.current) {
      return;
    }

    const requestIndex = pendingConversations.findIndex((conversation) => {
      return (
        conversation?._id === initialRequestId ||
        conversation?.message?.room_id === initialRequestId
      );
    });

    if (requestIndex >= 0) {
      sliderRef.current.slickGoTo(requestIndex, true);
    }
  }, [initialRequestId, modalIsOpen, pendingConversations]);

  React.useEffect(() => {
    if (!modalIsOpen || !router?.prefetch) {
      return;
    }

    pendingConversations.forEach((conversation) => {
      const userName = conversation?.user?.user_name;
      if (userName) {
        router.prefetch(`/user/user-profile/${userName}`);
      }
      const roomId = conversation?.message?.room_id;
      if (roomId) {
        router.prefetch(`/messages/${roomId}`);
      }
    });
  }, [modalIsOpen, pendingConversations, router]);

  React.useEffect(() => {
    const handleProfileReady = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (
        event.data?.type === "request-profile-ready" &&
        event.data?.userName === profileFrame?.userName
      ) {
        setProfileFrameReady(true);
        setViewProfileLoadingId(null);
      }
    };

    window.addEventListener("message", handleProfileReady);

    return () => {
      window.removeEventListener("message", handleProfileReady);
    };
  }, [profileFrame?.userName]);

  React.useEffect(() => {
    const handleChatFrameMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (
        event.data?.type === "request-chat-ready" &&
        event.data?.roomId === chatFrame?.roomId
      ) {
        setChatFrameReady(true);
        setReplyLoadingId(null);
      }

      if (event.data?.type === "request-chat-replied") {
        const repliedRoomId = event.data?.roomId;
        if (repliedRoomId) {
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation?._id === repliedRoomId ||
              conversation?.message?.room_id === repliedRoomId
                ? {
                    ...conversation,
                    status: 1,
                  }
                : conversation
            )
          );
        }
        if (typeof getConversations === "function") {
          getConversations();
        }
      }

      if (event.data?.type === "request-chat-close") {
        closeChatFrame();
      }
    };

    window.addEventListener("message", handleChatFrameMessage);

    return () => {
      window.removeEventListener("message", handleChatFrameMessage);
    };
  }, [chatFrame?.roomId]);

  const closeProfileFrame = () => {
    setProfileFrame(null);
    setProfileFrameReady(false);
    setViewProfileLoadingId(null);
  };

  // Live countdown: update remaining seconds for all conversations every second
  React.useEffect(() => {
    if (!conversations || conversations.length === 0) return;

    const interval = setInterval(() => {
      setLiveTimers((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        conversations.forEach((c) => {
          const key = c._id || c.message?._id;
          if (!key) return;
          const createdAt =
            c?.expires_at || c?.message?.sent_time || c?.message?.createdAt || c?.createdAt;
          if (!createdAt) return;
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
  }, [conversations]);

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
      })
    );
  };

  const fetchLatestUser = async () => {
    try {
      const freshUserRes = await apiRequest({
        method: "GET",
        url: "user/me",
      });
      if (freshUserRes?.data?.data?.user) {
        dispatch({
          type: AUTHENTICATE_UPDATE,
          payload: freshUserRes.data.data.user,
        });
        return freshUserRes.data.data.user;
      }
    } catch (err) {
      console.log("fetch user error", err);
    }
    return null;
  };

  const openPendingReplyConversation = async (room_id, conversation, expiresIn = 48) => {
    if (replyLoadingId) {
      return;
    }

    const requestId = conversation?._id || room_id;
    setReplyLoadingId(requestId);
    setChatFrameReady(false);

    try {
      const latestUser = await fetchLatestUser();
      const balanceUser = latestUser || authUser;
      const chatTokens = balanceUser?.chat_tokens || 0;
      const remainingChats = balanceUser?.remaining_chats || 0;
      if (balanceUser?.gender === "female" && chatTokens === 0 && remainingChats === 0) {
        showLadiesChatPaywall(expiresIn, true);
        setReplyLoadingId(null);
        return;
      }

      setChatFrame({
        roomId: room_id,
        requestId,
        src: `/messages/${room_id}?embedRequest=1`,
      });
    } catch (error) {
      setReplyLoadingId(null);
      console.log("open reply conversation error", error);
    }
  };

  const closeChatFrame = () => {
    setChatFrame(null);
    setChatFrameReady(false);
    setReplyLoadingId(null);
  };

  const rejectConversation = async (conversation) => {
    try {
      const roomId = conversation?.message?.room_id || conversation?._id;
      const senderId = conversation?.user?.id;

      await apiRequest({
        data: {
          chatRoomId: roomId,
          senderId,
        },
        method: "POST",
        url: `chat/reject`,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversation._id
            ? {
                ...c,
                status: 3,
              }
            : c
        )
      );
    } catch (err) {
      console.log("reject error", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
    }
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
      overflow: "hidden",
      overscrollBehavior: "contain",
    },
    overlay: {
      backdropFilter: "blur(5px)",
    },
  };

  return (
    <>

      {conversations?.length > 0 &&
        conversations?.filter(
          (c) => c.status == 0 && c.message?.sender_id !== user?._id
        )?.length > 0 && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={true}
            style={customStyles}
            className={
              modalIsOpen
                ? "intrested_model modal-open-blur"
                : "intrested_model"
            }
            ariaHideApp={false}
          >
            <div
              className="model_content"
              style={{
                height: "100%",
                overflow: "hidden",
                overscrollBehavior: "contain",
                touchAction: "pan-x",
              }}
            >
              {pageLoading ? (
                <SkeletonElement type="close-icon-view-profile" />
              ) : (
                <button
                  className="close_btn"
                  onClick={closeModal}
                  aria-label="Close"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "none",
                    borderRadius: "50%",
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    zIndex: 999,
                  }}
                >
                  <IoIosClose size={40} color={"#ffffff"} />
                </button>
              )}

              <Slider ref={sliderRef} {...settings}>
                {conversations.length > 0
                  ? pendingConversations?.length > 0
                    ? pendingConversations.map((conversation, index) => {
                          const profilePic =
                            conversation.user?.images.length > 0
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
                            const key = conversation._id || conversation.message?._id;
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
                                (totalHours - elapsed) * 3600,
                                0
                              );
                            }
                          }

                          // Recalculate derived values from the (possibly live) remainingSeconds
                          remainingHours = Math.floor(remainingSeconds / 3600);
                          remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
                          displaySeconds = remainingSeconds % 60;

                          const formatExpiry = () => {
                            if (remainingHours > 0) {
                              return `${remainingHours}h ${remainingMinutes}m ${displaySeconds}s`;
                            }
                            if (remainingMinutes > 0) {
                              return `${remainingMinutes}m ${displaySeconds}s`;
                            }
                            return `${displaySeconds}s`;
                          };

                          const requestId =
                            conversation?._id || conversation?.message?.room_id;

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
                            <div key={index} className="request-slide-card">
                              <H5 style1={true}>
                                {conversation?.user?.user_name} is
                              </H5>
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
                              {isSuper && (
                                <div className="superinterested__icon">
                                  <Image
                                    src={StarIcon}
                                    height={53}
                                    width={53}
                                  />
                                </div>
                              )}
                              <figure className={isSuper ? "request__figure--super" : ""}>
                                <ImageShow
                                  className="requested-profile-img"
                                  max-width={312}
                                  width="95%"
                                  height={320}
                                  src={profilePic}
                                  alt="user image"
                                  placeholderImg="https://i.ibb.co/y8RhMrL/Untitled-design.png"
                                />
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
                              <div className="request-access-inline">
                                You've been granted profile access.
                              </div>
                              {/* Action Buttons - Updated per design */}
                              <div className="d-flex align-items-center my-4 request-action-row">
                                <button
                                  type="button"
                                  className="view-profile-btn"
                                  disabled={Boolean(viewProfileLoadingId || replyLoadingId)}
                                  onClick={() => {
                                    const userName =
                                      conversation?.user?.user_name;
                                    if (!userName) {
                                      return;
                                    }
                                    setViewProfileLoadingId(requestId);
                                    persistReturnState(conversation);
                                    setProfileFrameReady(false);
                                    setProfileFrame({
                                      userName,
                                      requestId,
                                      src: `/user/user-profile/${encodeURIComponent(
                                        userName
                                      )}?embedRequest=1`,
                                    });
                                  }}
                                >
                                  {viewProfileLoadingId ===
                                  (conversation?._id ||
                                    conversation?.message?.room_id) ? (
                                    <span className="spin-loader-button view-profile-loader"></span>
                                  ) : (
                                    "VIEW PROFILE"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="reply-btn"
                                  disabled={Boolean(replyLoadingId || viewProfileLoadingId)}
                                  onClick={async () => {
                                    openPendingReplyConversation(
                                      conversation?.message?.room_id,
                                      conversation,
                                      remainingHours
                                    );
                                  }}
                                >
                                  {replyLoadingId === requestId ? (
                                    <span className="spin-loader-button view-profile-loader"></span>
                                  ) : (
                                    "REPLY"
                                  )}
                                </button>
                              </div>
                              
                              {/* Reject Link - New per design */}
                              <div className="reject-link-container">
                                <a 
                                  className="reject-link"
                                  onClick={() => {
                                    if (viewProfileLoadingId || replyLoadingId) {
                                      return;
                                    }
                                    rejectConversation(conversation);
                                  }}
                                >
                                  Reject User
                                </a>
                              </div>
                              
                            </div>
                          );
                        })
                    : "No Request yet"
                  : "No Request yet"}
              </Slider>
            </div>
          </Modal>
        )}
      <PaywallModal
        isOpen={paywallConfig.isOpen}
        onClose={closePaywall}
        type={paywallConfig.type}
        expiresIn={paywallConfig.expiresIn}
        userName={paywallConfig.userName}
        pricingConfig={pricingConfig}
      />
      {profileFrame?.src && (
        <div
          className={`request-profile-frame-overlay${
            profileFrameReady ? " is-ready" : ""
          }`}
        >
          {profileFrameReady && (
            <button
              type="button"
              className="request-profile-frame-back"
              onClick={closeProfileFrame}
              aria-label="Back to request"
            >
              <IoIosArrowBack size={26} color="#ffffff" />
            </button>
          )}
          <iframe
            title="Request profile"
            src={profileFrame.src}
            className="request-profile-frame"
          />
        </div>
      )}
      {chatFrame?.src && (
        <div
          className={`request-chat-frame-overlay${
            chatFrameReady ? " is-ready" : ""
          }`}
        >
          <iframe
            title="Request chat"
            src={chatFrame.src}
            className="request-chat-frame"
          />
        </div>
      )}
    </>
  );
};

export default UserCardListForMessage;
