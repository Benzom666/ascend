import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CustomIcon } from "core/icon";
const UserImg = "/assets/img/profile.png";
import SideBar from "./sidebar";
import useWindowSize from "utils/useWindowSize";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useRouter } from "next/router";
import { apiRequest } from "utils/Utilities";
import io from "socket.io-client";
import SideBarPopup from "./sideBarPopup";
import Image from "next/image";
import { IoIosArrowBack } from "react-icons/io";
const close1 = "/assets/close1.png";
const LeSlogoWhite = "/assets/LeS logoWhite.png";
const LeSlogoText = "/assets/img/LeSocietylogotext.png";
//const Logo_Mob = "/assets/img/Logo_Mob.png";
const Logo_Mob$ = "/assets/img/LeSociety Icon White.png";
const Logo_Web = "/assets/img/Logo_Web.png";
import { logout } from "@/modules/auth/authActions";
import { getUnreadActionableNotificationCount } from "utils/notificationState";
// const socket = io(socketURL, {
//   autoConnect: true,
// });

export default function HeaderLoggedIn({
  fixed,
  isBlack,
  unReadedConversationLength,
  pendingRequestLength,
  count,
  setCount,
  setLogoutLoading,
  showBackButton = false,
  hideRightNav = false,
  backHref = null,
  onBack = null,
  hideLogo = false,
  isBackLoading = false,
}) {
  // const socket = io(socketURL, {
  //   autoConnect: true,
  // });

  const [isActive, setActive] = useState(false);
  const width = useWindowSize();
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [navigatingToMessages, setNavigatingToMessages] = useState(false);

  useEffect(() => {
    const handleRouteComplete = () => setNavigatingToMessages(false);
    router.events.on("routeChangeComplete", handleRouteComplete);
    router.events.on("routeChangeError", handleRouteComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteComplete);
      router.events.off("routeChangeError", handleRouteComplete);
    };
  }, [router]);

  const [notifData, setNotifdata] = useState(null);
  const dispatch = useDispatch();
  // const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || width?.width > 480 || !isActive) {
      return undefined;
    }

    const sidebarElement = document.querySelector("#sidebar-header");
    if (!sidebarElement) {
      return undefined;
    }

    let touchStartY = 0;

    const getScrollableSidebar = () => sidebarElement;
    const canScrollSidebar = () => {
      const scrollableSidebar = getScrollableSidebar();
      return (
        scrollableSidebar &&
        scrollableSidebar.scrollHeight > scrollableSidebar.clientHeight
      );
    };

    const isAtTop = () => {
      const scrollableSidebar = getScrollableSidebar();
      return !scrollableSidebar || scrollableSidebar.scrollTop <= 0;
    };

    const isAtBottom = () => {
      const scrollableSidebar = getScrollableSidebar();
      if (!scrollableSidebar) return true;
      return (
        scrollableSidebar.scrollTop + scrollableSidebar.clientHeight >=
        scrollableSidebar.scrollHeight - 1
      );
    };

    const handleTouchStart = (event) => {
      touchStartY = event.touches?.[0]?.clientY || 0;
    };

    const containSidebarOverscroll = (event) => {
      if (!sidebarElement.contains(event.target)) {
        event.preventDefault();
        return;
      }

      if (!canScrollSidebar()) {
        event.preventDefault();
        return;
      }

      const currentY = event.touches?.[0]?.clientY || 0;
      const deltaY = currentY - touchStartY;

      if ((isAtTop() && deltaY > 0) || (isAtBottom() && deltaY < 0)) {
        event.preventDefault();
      }
    };

    const containSidebarWheelOverscroll = (event) => {
      if (!sidebarElement.contains(event.target)) {
        event.preventDefault();
        return;
      }

      if (!canScrollSidebar()) {
        event.preventDefault();
        return;
      }

      if ((isAtTop() && event.deltaY < 0) || (isAtBottom() && event.deltaY > 0)) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", containSidebarOverscroll, {
      passive: false,
    });
    document.addEventListener("wheel", containSidebarWheelOverscroll, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", containSidebarOverscroll);
      document.removeEventListener("wheel", containSidebarWheelOverscroll);
    };
  }, [isActive, width?.width]);

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

  useEffect(() => {
    const unreadCount = getUnreadActionableNotificationCount(notifData);
    setCount && setCount(unreadCount);
  }, [notifData]);

  function toggleModal() {
    setIsOpen(!isBlack && !modalIsOpen);
  }

  const handleBackClick = () => {
    if (isBackLoading) {
      return;
    }

    if (typeof onBack === "function") {
      onBack();
      return;
    }

    if (backHref) {
      router.replace(backHref);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/messages");
  };

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
      setNotifdata(data?.data?.notification);
    } catch (err) {
      console.error("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        if (setLogoutLoading) {
          setLogoutLoading(true);
          setTimeout(() => {
            logout(router, dispatch);
            setLogoutLoading(false);
          }, 2000);
        } else {
          setTimeout(() => {
            logout(router, dispatch);
          }, 100);
        }
      }
      return err;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (modalIsOpen || isActive) {
      fetchNotifications();
    }
  }, [modalIsOpen, isActive]);

  // Pending interest/super-interest requests are stored as chat rooms with
  // status=0 (pending). They do NOT generate notifications and don't get
  // counted by `unReadedConversationLength` (which only looks at active
  // rooms). Fetch the chatroom list here so the message-icon badge can
  // light up for any user with pending requests, on every page that uses
  // this header.
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const fetchPendingRequestCount = async () => {
    try {
      const { data } = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
      });
      const rooms = Array.isArray(data?.data?.chatRooms)
        ? data.data.chatRooms.filter((r) => r !== null)
        : [];
      const now = Date.now();
      const pending = rooms.filter((room) => {
        if (Number(room?.status) !== 0) return false;
        const expiresAt = room?.expires_at
          ? new Date(room.expires_at).getTime()
          : null;
        if (expiresAt && expiresAt <= now) return false;
        const senderId = room?.message?.sender_id;
        if (senderId) return senderId !== user?._id;
        if (room?.requester_id) return room.requester_id !== user?._id;
        return false;
      }).length;
      setPendingRequestCount(pending);
    } catch (err) {
      // Non-fatal: leave count at its previous value.
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchPendingRequestCount();
  }, [user?._id]);

  useEffect(() => {
    if (modalIsOpen || isActive) {
      fetchPendingRequestCount();
    }
  }, [modalIsOpen, isActive]);

  const unReadMessagesLength = unReadedConversationLength
    ? unReadedConversationLength
    : 0;

  // The message-icon red badge should light up whenever the inbox has
  // anything actionable: unread incoming messages, pending requests
  // waiting on the user, or unread actionable notifications. Previously
  // it only checked unread messages, so a female user with pending
  // requests (and no unread chat) saw no badge. See request to fix.
  const effectivePendingRequestCount =
    typeof pendingRequestLength === "number"
      ? pendingRequestLength
      : pendingRequestCount;
  const hasInboxActivity =
    unReadMessagesLength > 0 ||
    effectivePendingRequestCount > 0 ||
    (count || 0) > 0;

  // console.log("unReadMessagesLength", unReadMessagesLength);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.classList.toggle(
      "open-sidebar",
      Boolean(isActive && width?.width <= 480)
    );

    return () => {
      document.body.classList.remove("open-sidebar");
    };
  }, [isActive, width?.width]);

  useEffect(() => {
    return () => {
      setActive(false);
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query?.openSidebar !== "1") return;

    if (width?.width > 480) {
      setIsOpen(true);
      setActive(false);
    } else {
      setActive(true);
      setIsOpen(false);
    }

    // Clean URL immediately (shallow route change, doesn't trigger page reload)
    const { openSidebar, ...rest } = router.query;
    router.replace(
      { pathname: router.pathname, query: rest },
      undefined,
      { shallow: true }
    );
  }, [router.isReady, router.query?.openSidebar, width?.width]);

  const toggleClass = () => {
    if (width?.width > 480) {
      toggleModal();
    } else {
      setActive(!isBlack && !isActive);
    }
  };

  return (
    <header
      style={
        fixed && width?.width > 500
          ? {
              position: "fixed",
              width: "100%",
              zIndex: "99",
              background: "black",
            }
          : fixed
          ? {
              position: "fixed",
              width: "100%",
              zIndex: "99",
            }
          : {}
      }
      className={`py-3 py-md-3 loggedin_user ${isBlack && "is-black-head"}`}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 col-2" style={{ paddingLeft: "1.5rem" }}>
            <div className="logo">
              <>
                {showBackButton ? (
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="header-back-button d-md-none"
                    aria-label="Go back"
                    disabled={isBackLoading}
                  >
                    {isBackLoading ? (
                      <span className="spin-loader-button header-back-loader"></span>
                    ) : (
                      <IoIosArrowBack size={26} color="#fff" />
                    )}
                  </button>
                ) : (
                  <Link href="/auth/login">
                    {/* <h3 className="d-md-none mb-0 st-logo">ST</h3> */}
                    <img
                      src={Logo_Mob$}
                      width="25px"
                      height="25px"
                      alt="Logo"
                      className={`d-md-none cursor-pointer${hideLogo ? " invisible" : ""}`}
                    />
                  </Link>
                )}
                <Link href="/auth/login">
                  {/* <img
                    src="/images/logo.svg"
                    width="159"
                    alt="Logo"
                    className={`d-none d-md-block cursor-pointer${hideLogo ? " invisible" : ""}`} 
                  /> */}
                  <img
                    src={Logo_Web}
                    width="232"
                    alt="Logo"
                    className="d-none d-md-block cursor-pointer"
                  />
                </Link>
              </>
            </div>
          </div>
          <div className="col-md-8 col-10">
            <nav>
              <ul
                className={`d-flex justify-content-end mb-0 align-items-center${
                  hideRightNav ? " header-nav-empty" : ""
                }`}
              >
                {hideRightNav ? null : (
                  <>
                <li>
                  <Link href="/messages">
                    <button
                      id="message-icon"
                      className="message_link"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (navigatingToMessages) return;
                        setNavigatingToMessages(true);
                        try {
                          const res = await apiRequest({
                            method: "GET",
                            url: "chat/chatroom-list",
                            timeout: 10000,
                          });
                          const convos = res.data?.data?.chatRooms?.filter(c => c !== null) || [];
                          const cacheKey = `messages-conversations-cache:${user?._id}`;
                          if (typeof window !== "undefined" && user?._id) {
                            window.sessionStorage.setItem(cacheKey, JSON.stringify({ conversations: convos, cachedAt: Date.now() }));
                          }
                        } catch (err) {
                          // Navigate anyway even if prefetch fails
                        }
                        router.push("/messages");
                      }}
                      type="button"
                    >
                      {navigatingToMessages ? (
                        <span className="message-icon-spinner" />
                      ) : (
                        <CustomIcon.Envelope color={"#fff"} size={20} />
                      )}

                      {width?.width > 767 && (
                        <>
                          <Link href="/messages">
                            <a className="forgot-passwrd">Messages</a>
                          </Link>
                        </>
                      )}
                      {hasInboxActivity && (
                        <span className="top-bages" aria-label="unread inbox activity">
                        </span>
                      )}
                    </button>
                  </Link>
                </li>
                <li>
                  <div className="user-profile-details">
                    <figure
                      className={`user_img_header user_notification ${
                        modalIsOpen ? "invisible" : ""
                      } `}
                      onClick={toggleClass}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      role="button"
                    >
                      <img
                        src={!_.isEmpty(user) ? user?.images?.[0] : UserImg}
                        alt="user image"
                        width={32}
                        height={32}
                      />
                      {count > 0 && <span className="top-bages"></span>}
                    </figure>
                  </div>
                </li>
                  </>
                )}
              </ul>
              {width?.width > 480 ? (
                <SideBarPopup
                  isOpen={modalIsOpen}
                  toggle={toggleModal}
                  count={count}
                ></SideBarPopup>
              ) : (
                <>
                  {isActive && (
                    <button
                      type="button"
                      className="sidebar-backdrop"
                      aria-label="Close sidebar"
                      onClick={() => setActive(false)}
                    />
                  )}
                  <div
                    id="sidebar-header"
                    className={
                      isActive ? "sidebar-nav open_nav_menu" : "sidebar-nav"
                    }
                  >
                    <SideBar
                      isActive={isActive}
                      locationPopupModal={isBlack}
                      count={count}
                    />
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
