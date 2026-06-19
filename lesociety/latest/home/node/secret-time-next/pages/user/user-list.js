import React, { useState, useEffect } from "react";
import HeaderLoggedIn from "core/loggedInHeader";
import Image from "next/image";
import Footer from "core/footer";
import router from "next/router";
import LocationPopup from "@/core/locationPopup";
import withAuth from "../../core/withAuth";
import { apiRequest, socketURL } from "utils/Utilities";
import {
  fetchCities,
  fetchLiveLocation,
} from "../../modules/auth/forms/steps/validateRealTime";
import { useDispatch, useSelector } from "react-redux";
import DatePopup from "core/createDatePopup";
import useWindowSize from "utils/useWindowSize";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "Views/CustomInput";
import { IoIosSend } from "react-icons/io";
import { useRef } from "react";
import SkeletonArticle from "@/modules/skeleton/SkeletonArticle";
import io from "socket.io-client";
import { removeCookie } from "utils/cookie";
const MessageSend = "/assets/message_send.png";
const MessageSend2 = "/assets/message_send2.png";
const MessageSend3 = "/assets/Send.jpg";
const MessageSend4 = "/assets/Send.png";
const MessageSend5 = "/assets/Send.svg";
import LocationModalPopUp from "@/core/locationModalPopUp";
import classNames from "classnames";
import { change } from "redux-form";
import DateAndLocation from "@/modules/location/DateAndLocation";
import {
  changeSelectedLocationPopup,
  logout,
} from "@/modules/auth/authActions";
import ImageShow from "@/modules/ImageShow";
import Loader from "@/modules/Loader/Loader";
import ReactDOM from "react-dom";
const StarIcon = "/assets/star1.svg";
const StarBlankIcon = "/assets/Star_blank.png";
import DateLiveModal from "@/core/DateLiveModal";
import EditDateReviewModal from "@/core/EditDateReviewModal";
import { AUTHENTICATE_UPDATE } from "@/modules/auth/actionConstants";
import PaywallModal from "@/core/PaywallModal";
import { usePaywall } from "../../hooks/usePaywall";
import { getPayment } from "@/utils/payment";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/bodyScrollLock";
import { getUnreadConversationActivityCount, getPendingIncomingRequestCount } from "../../utils/chatState";
import { formatDisplayText } from "../../utils/formatDisplayText";
import {
  clearPaymentReturnState,
  readPaymentReturnState,
  savePaymentReturnState,
} from "../../utils/paymentReturnState";

export const socket = io(socketURL, {
  reconnection: true,
  autoConnect: true,
  transports: ["websocket", "polling", "flashsocket"],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

const areLocationsEqual = (left = {}, right = {}) =>
  (left?.city || "") === (right?.city || "") &&
  (left?.country || "") === (right?.country || "") &&
  (left?.province || "") === (right?.province || "") &&
  (left?.stateName || "") === (right?.stateName || "") &&
  (left?.countryName || "") === (right?.countryName || "");

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const isPaymentReturnUrl = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.location.search.includes("tokensUpdated=1") ||
    window.location.search.includes("payment_id=") ||
    window.location.search.includes("paymentReturn=1")
  );
};

const shouldSuppressPaymentReturnPaint = () => {
  const pendingState = readPaymentReturnState();

  return Boolean(
    isPaymentReturnUrl() &&
      pendingState?.date &&
      ["user-list-message-modal", "message-modal"].includes(
        pendingState?.source
      )
  );
};

function UserList(props) {
  const { width } = useWindowSize();
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollType, setScrollType] = React.useState("down");
  const [classPopup, setPopupClass] = React.useState("hide");
  const [textClass, setTextSlideClass] = React.useState("");
  const [locationPopup, setLocationPoup] = React.useState(false);
  const [selectedLocation, setLocation] = React.useState({});

  const user = useSelector((state) => state.authReducer.user);
  const state = useSelector((state) => state.authReducer);
  const [modalIsOpen, setIsOpen] = React.useState(user?.gender === "female");
  const [receiverData, setReceiverData] = React.useState("");
  const [messageError, setMessageError] = React.useState("");
  const [conversations, setConversations] = useState([]);
  const [alreadyMessagedFromUser, setAlreadyMessagedFromUser] = useState(false);
  const [countries, setCountry] = useState("");
  const dispatch = useDispatch();
  const [searchStatus, setSearchStaus] = useState(false);
  // for current location
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [showDateLiveModal, setShowDateLiveModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [dontShowLiveAgain, setDontShowLiveAgain] = useState(false);

  // for notification
  const [count, setCount] = useState(0);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const iconRef = useRef(null);
  const messageInputBlurTimeoutRef = useRef(null);
  const messagePopupScrollYRef = useRef(0);
  const paymentVisualRestoreStartedRef = useRef(false);
  const paymentRestorePreviousStylesRef = useRef(null);
  const paymentReturnSyncPromiseRef = useRef(null);
  const delayedMessageDoneTimerRef = useRef(null);
  const [isMessageInputFocused, setIsMessageInputFocused] = useState(false);
  const [messagePopupKeyboardOffset, setMessagePopupKeyboardOffset] = useState(0);
  const [messageDraft, setMessageDraft] = useState("");
  const messagePopupListPageRef = useRef(1);
  const [pendingPaymentRestore, setPendingPaymentRestore] = useState(null);
  const [suppressPaymentReturnPaint, setSuppressPaymentReturnPaint] = useState(
    shouldSuppressPaymentReturnPaint
  );

  const [isSuperInterested, setIsSuperInterested] = useState(false);
  // Store scroll position when opening modal so we can restore it on close
  const { paywallConfig, pricingConfig, showMenFirstDatePaywall, closePaywall } = usePaywall();
  const galleryTitle =
    (searchStatus || Boolean(router?.query?.city)) && selectedLocation?.city
      ? formatDisplayText(selectedLocation.city)
      : "Main Gallery";

  // useEffect(() => {
  //   if (user?.gender === "male" && state?.showSelectedLocationPopup) {
  //     setShow(true);
  //   }
  // }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.touchAction = "";
    }

    if (!user?._id) return undefined;

    socket.auth = { user: user };
    socket.connect();
    const handleConnect = () => {
      console.log("connected");
    };
    const handleDisconnect = (reason) => {
      console.log("socket disconnected reason", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.documentElement.style.overflow = "";
        document.documentElement.style.touchAction = "";
      }
    };
  }, [user?._id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.touchAction = "";
    }

    if (!user?._id) return undefined;

    const handleConnectError = () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect_error", handleConnectError);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!router?.isReady) return;

    if (router?.query?.city) {
      const nextLocation = {
        city: router?.query?.city,
        country: router?.query?.country,
        province: router?.query?.province,
      };
      setLocation((prev) =>
        areLocationsEqual(prev, nextLocation) ? prev : nextLocation
      );
      setSearchStaus(user?.location !== router?.query?.city);
      return;
    }

    setSearchStaus(false);

    setLocation((prev) => (areLocationsEqual(prev, {}) ? prev : {}));
  }, [
    router?.isReady,
    router?.query?.city,
    router?.query?.country,
    router?.query?.province,
  ]);

  useEffect(() => {
    if (!router?.isReady || user?.gender !== "female") {
      setShowDateLiveModal(false);
      setShowEditReviewModal(false);
      return;
    }

    const shouldShowPosted =
      Boolean(router?.query?.posted) && !user?.date_live_popup_dismissed;
    const shouldShowEdited = Boolean(router?.query?.edited) && !shouldShowPosted;

    setShowDateLiveModal(shouldShowPosted);
    setShowEditReviewModal(shouldShowEdited);
  }, [
    router?.isReady,
    router?.query?.edited,
    router?.query?.posted,
    user?.date_live_popup_dismissed,
    user?.gender,
  ]);

  // Old effects removed — consolidated above to prevent race conditions

  const restorePendingMessageModal = React.useCallback(() => {
    const pendingState = readPaymentReturnState();

    if (
      !pendingState ||
      !["user-list-message-modal", "message-modal"].includes(
        pendingState?.source
      ) ||
      !pendingState?.date
    ) {
      setSuppressPaymentReturnPaint(false);
      return false;
    }

    // Directly set state to avoid stale closure from openPopup
    if (typeof window !== "undefined") {
      messagePopupScrollYRef.current = Math.max(
        0,
        Number(
          pendingState?.scrollY ??
            pendingState?.scrollPosition ??
            window.scrollY ??
            window.pageYOffset ??
            0
        )
      );
    }
    messagePopupListPageRef.current = Math.max(
      1,
      Number(pendingState?.loadedPage || 1)
    );
    setMessageDraft(pendingState?.draftMessage || "");
    setIsSuperInterested(Boolean(pendingState?.isSuperInterested));
    setPopupClass("show");
    setReceiverData(pendingState.date);
    setPendingPaymentRestore(pendingState);
    setSuppressPaymentReturnPaint(true);
    // Re-apply scroll state so cards don't jump when modal reopens after payment
    initializeVisibleCards();
    return true;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || paymentVisualRestoreStartedRef.current) {
      return;
    }

    const isPaymentReturn =
      router?.asPath?.includes("tokensUpdated=1") ||
      router?.asPath?.includes("payment_id=") ||
      router?.asPath?.includes("paymentReturn=1");

    if (!isPaymentReturn) {
      return;
    }

    const pendingState = readPaymentReturnState();
    if (
      !pendingState ||
      !["user-list-message-modal", "message-modal"].includes(
        pendingState?.source
      ) ||
      !pendingState?.date
    ) {
      setSuppressPaymentReturnPaint(false);
      return;
    }

    paymentVisualRestoreStartedRef.current = true;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const savedScrollY = Math.max(
      0,
      Number(pendingState?.scrollY ?? pendingState?.scrollPosition ?? 0)
    );
    const { body, documentElement } = document;
    paymentRestorePreviousStylesRef.current = {
      bodyMinHeight: body.style.minHeight,
      htmlScrollBehavior: documentElement.style.scrollBehavior,
      bodyScrollBehavior: body.style.scrollBehavior,
    };
    const restoreHeight = savedScrollY + window.innerHeight + 1;
    body.style.minHeight = `${Math.max(body.scrollHeight, restoreHeight)}px`;
    documentElement.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    messagePopupScrollYRef.current = savedScrollY;
    messagePopupListPageRef.current = Math.max(
      1,
      Number(pendingState?.loadedPage || 1)
    );
    setMessageDraft(pendingState?.draftMessage || "");
    setIsSuperInterested(Boolean(pendingState?.isSuperInterested));
    setPopupClass("show");
    setReceiverData(pendingState.date);
    setPendingPaymentRestore(pendingState);
    window.scrollTo({ top: savedScrollY, left: 0, behavior: "auto" });
  }, [router?.asPath]);

  const refreshAuthUserFromServer = React.useCallback(async () => {
    const freshUserRes = await apiRequest({
      method: "GET",
      url: "user/me",
    });
    const freshUser = freshUserRes?.data?.data?.user;

    if (freshUser) {
      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: freshUser,
      });
    }

    return freshUser;
  }, [dispatch]);

  // Restore the visible state immediately; token/payment sync can finish after.
  useEffect(() => {
    if (!router.isReady) return;

    const isPaymentReturn =
      router?.query?.tokensUpdated === "1" ||
      router?.query?.payment_id ||
      router?.query?.paymentReturn === "1";
    if (!isPaymentReturn) return;

    if (!paymentVisualRestoreStartedRef.current) {
      paymentVisualRestoreStartedRef.current = restorePendingMessageModal();
    }

    const syncPromise = (async () => {
      let syncedUser = null;
      const pendingState = readPaymentReturnState();
      try {
        if (router?.query?.payment_id) {
          const paymentId = router?.query?.payment_id;
          const maxAttempts = 8;

          for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
              const paymentResponse = await getPayment(paymentId);
              const paymentStatus = String(
                paymentResponse?.data?.status || ""
              ).toLowerCase();
              syncedUser = await refreshAuthUserFromServer();
              if (
                ["completed", "complete", "paid"].includes(paymentStatus) ||
                attempt === maxAttempts - 1
              ) {
                break;
              }
            } catch (error) {
              if (attempt === maxAttempts - 1) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        } else if (
          router?.query?.tokensUpdated === "1" ||
          router?.query?.paymentReturn === "1"
        ) {
          syncedUser = await refreshAuthUserFromServer();
        }

        const hasQueryParams =
          router?.query?.payment_id ||
          router?.query?.tokensUpdated ||
          router?.query?.paymentReturn;
        if (hasQueryParams) {
          const nextQuery = { ...router.query };
          delete nextQuery.payment_id;
          delete nextQuery.tokensUpdated;
          delete nextQuery.paymentReturn;
          router.replace(
            { pathname: router.pathname, query: nextQuery },
            undefined,
            { shallow: true }
          );
        }

        if (
          pendingState &&
          !["user-list-message-modal", "message-modal"].includes(
            pendingState?.source
          )
        ) {
          clearPaymentReturnState();
        }
      } catch (err) {
        console.error("[PaymentReturn] Error during payment return sync:", err);
      }

      return syncedUser;
    })();

    paymentReturnSyncPromiseRef.current = syncPromise;
    syncPromise.finally(() => {
      paymentReturnSyncPromiseRef.current = null;
    });

    return undefined;
  }, [
    dispatch,
    refreshAuthUserFromServer,
    restorePendingMessageModal,
    router.isReady,
    router.query?.payment_id,
    router.query?.paymentReturn,
    router.query?.tokensUpdated,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      classPopup !== "show" ||
      !pendingPaymentRestore
    ) {
      return undefined;
    }

    let attempts = 0;
    let frameId = 0;
    let timerId = 0;
    const targetDateId =
      pendingPaymentRestore?.dateId || pendingPaymentRestore?.date?._id || "";
    const targetScrollY = Math.max(
      0,
      Number(
        pendingPaymentRestore?.scrollY ??
          pendingPaymentRestore?.scrollPosition ??
          0
      )
    );
    const targetViewportTop = Number.isFinite(
      Number(pendingPaymentRestore?.cardViewportTop)
    )
      ? Number(pendingPaymentRestore.cardViewportTop)
      : null;

    const finishRestore = () => {
      clearPaymentReturnState();
      setPendingPaymentRestore(null);
      setSuppressPaymentReturnPaint(false);
      if (paymentRestorePreviousStylesRef.current) {
        const { body, documentElement } = document;
        body.style.minHeight =
          paymentRestorePreviousStylesRef.current.bodyMinHeight || "";
        documentElement.style.scrollBehavior =
          paymentRestorePreviousStylesRef.current.htmlScrollBehavior || "";
        body.style.scrollBehavior =
          paymentRestorePreviousStylesRef.current.bodyScrollBehavior || "";
        paymentRestorePreviousStylesRef.current = null;
      }
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };

    const runRestore = () => {
      attempts += 1;

      const targetCard = targetDateId
        ? document.querySelector(`[data-date-id="${targetDateId}"]`)
        : null;

      if (targetCard) {
        const cardTop =
          targetCard.getBoundingClientRect().top +
          (window.scrollY || window.pageYOffset || 0);
        const nextScrollY =
          targetViewportTop !== null
            ? Math.max(cardTop - targetViewportTop, 0)
            : targetScrollY > 0
            ? targetScrollY
            : Math.max(cardTop - 24, 0);
        window.scrollTo({ top: nextScrollY, left: 0, behavior: "auto" });

        if (Math.abs((window.scrollY || window.pageYOffset || 0) - nextScrollY) <= 4) {
          finishRestore();
          return;
        }
      } else if (targetScrollY > 0) {
        window.scrollTo({ top: targetScrollY, left: 0, behavior: "auto" });
      }

      if (attempts >= 24) {
        finishRestore();
        return;
      }

      timerId = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(runRestore);
      }, 150);
    };

    frameId = window.requestAnimationFrame(runRestore);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [classPopup, pendingPaymentRestore]);

  const handleCloseDateLiveModal = async () => {
    if (dontShowLiveAgain) {
      try {
        const res = await apiRequest({
          method: "POST",
          url: "user/update-popup-preferences",
          data: { date_live_popup_dismissed: true },
        });
        if (res?.data?.data?.user) {
          dispatch({
            type: AUTHENTICATE_UPDATE,
            payload: res.data.data.user,
          });
        }
      } catch (err) {
        console.log("Failed to update popup preference", err);
      }
    }
    setShowDateLiveModal(false);
    if (router?.query?.posted) {
      const nextQuery = { ...router.query };
      delete nextQuery.posted;
      delete nextQuery.city;
      delete nextQuery.country;
      delete nextQuery.province;
      router.replace(
        {
          pathname: "/user/user-list",
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleCloseEditReviewModal = () => {
    setShowEditReviewModal(false);
    if (router?.query?.edited) {
      router.replace("/user/user-list", undefined, { shallow: true });
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    const eventName = `request-${user?._id}`;
    const handleRequest = (message) => {
      console.log("reqested message header", message);
      getConversations();
    };

    socket.on(eventName, handleRequest);

    return () => {
      socket.off(eventName, handleRequest);
    };
  }, [user?._id]);

  useEffect(() => {
    const eventName = `recieve-${user?._id}`;
    const handleReceive = (message) => {
      console.log("recieve message header", message);
      getConversations();
    };

    socket.on(eventName, handleReceive);

    return () => {
      socket.off(eventName, handleReceive);
    };
  }, [user?._id]);

  useEffect(() => {
    const handleConnect = () => {
      console.log(socket.id);
    };
    const notificationEvent = `push-notification-${user.email}`;
    const handleNotification = (message) => {
      console.log("notif received", message);
      const unc = message?.notifications?.filter(
        (item) => item.status === 0 && item.type !== "notification"
      ).length;
      localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
      setCount(unc);
    };

    socket.on("connect", handleConnect);
    socket.on(notificationEvent, handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(notificationEvent, handleNotification);
    };
  }, [user?.email, setCount]);

  useEffect(() => {
    if (classPopup === "show") {
      initializeMoveIconPosition();
    }
  }, [classPopup]);

  useEffect(() => {
    if (classPopup === "show" && typeof window !== "undefined") {
      messagePopupScrollYRef.current =
        window.scrollY || window.pageYOffset || messagePopupScrollYRef.current || 0;
      document.body.dataset.messagePopupOpen = "true";
    }

    if (classPopup === "show" && width >= 768) {
      lockBodyScroll("home-message-popup");
      return () => {
        unlockBodyScroll("home-message-popup");
        if (typeof document !== "undefined") {
          delete document.body.dataset.messagePopupOpen;
        }
      };
    }

    if (classPopup === "show") {
      unlockBodyScroll("home-message-popup");
      return () => {
        if (typeof document !== "undefined") {
          delete document.body.dataset.messagePopupOpen;
        }
      };
    }

    unlockBodyScroll("home-message-popup");
    if (typeof document !== "undefined") {
      delete document.body.dataset.messagePopupOpen;
    }
    return undefined;
  }, [classPopup, width]);

  useEffect(() => {
    return () => {
      if (messageInputBlurTimeoutRef.current) {
        clearTimeout(messageInputBlurTimeoutRef.current);
      }
      if (delayedMessageDoneTimerRef.current) {
        clearTimeout(delayedMessageDoneTimerRef.current);
      }
      unlockBodyScroll("home-message-popup");
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      classPopup !== "show" ||
      width >= 768
    ) {
      return undefined;
    }

    const stopBackgroundScroll = (event) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", stopBackgroundScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener("wheel", stopBackgroundScroll, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("touchmove", stopBackgroundScroll, {
        capture: true,
      });
      document.removeEventListener("wheel", stopBackgroundScroll, {
        capture: true,
      });
    };
  }, [classPopup, width]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      classPopup !== "show" ||
      width >= 768 ||
      !isMessageInputFocused
    ) {
      setMessagePopupKeyboardOffset(0);
      return undefined;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return undefined;
    }

    const syncKeyboardOffset = () => {
      const offset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop
      );
      setMessagePopupKeyboardOffset(offset);
    };

    syncKeyboardOffset();
    viewport.addEventListener("resize", syncKeyboardOffset);
    viewport.addEventListener("scroll", syncKeyboardOffset);

    return () => {
      viewport.removeEventListener("resize", syncKeyboardOffset);
      viewport.removeEventListener("scroll", syncKeyboardOffset);
      setMessagePopupKeyboardOffset(0);
    };
  }, [classPopup, isMessageInputFocused, width]);

  const unReadedConversationLength = getUnreadConversationActivityCount(
    conversations,
    user?._id
  );

  const pendingRequestLength = getPendingIncomingRequestCount(
    conversations,
    user?._id
  );

  const getConversations = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter((chat) => chat !== null)
          : [];

      setConversations((prev) => {
        if (
          prev.length === conversations.length &&
          prev.every((chat, index) => chat?._id === conversations[index]?._id)
        ) {
          return prev;
        }
        return conversations;
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

  const initializeVisibleCards = () => {
    if (typeof window === "undefined") return;
    const cards = document.querySelectorAll("#scrolldiv");
    cards.forEach((el) => el.classList.add("scrollActive"));
  };

  const getPaymentReturnCardPosition = React.useCallback((dateId = "") => {
    if (typeof window === "undefined" || !dateId) {
      return {};
    }

    const targetCard = document.querySelector(`[data-date-id="${dateId}"]`);
    if (!targetCard) {
      return {};
    }

    const rect = targetCard.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset || 0;

    return {
      cardViewportTop: rect.top,
      cardPageY: rect.top + scrollY,
    };
  }, []);

  const buildPaymentReturnState = React.useCallback(
    (draftMessage = "", overrideIsSuperInterested = isSuperInterested) => {
      const dateId = receiverData?._id || "";

      return {
        source: "user-list-message-modal",
        returnPath: "/user/user-list",
        draftMessage,
        isSuperInterested: Boolean(overrideIsSuperInterested),
        date: receiverData,
        dateId,
        loadedPage: Math.max(1, Number(messagePopupListPageRef.current || 1)),
        scrollY:
          typeof window !== "undefined"
            ? window.scrollY || window.pageYOffset || messagePopupScrollYRef.current || 0
            : messagePopupScrollYRef.current || 0,
        ...getPaymentReturnCardPosition(dateId),
      };
    },
    [getPaymentReturnCardPosition, isSuperInterested, receiverData]
  );

  const openPopup = (item, options = {}) => {
    if (typeof window !== "undefined") {
      messagePopupScrollYRef.current = window.scrollY || window.pageYOffset || 0;
    }
    messagePopupListPageRef.current = Math.max(
      1,
      Number(options?.loadedPage || 1)
    );
    setMessageDraft(options?.draftMessage || "");
    setIsSuperInterested(Boolean(options?.isSuperInterested));
    setPopupClass("show");
    setReceiverData(item);
    // Lock in the scroll state of all currently-visible cards so their
    // position is preserved when user returns from payment
    initializeVisibleCards();
  };

  const closePopup = (formProps) => {
    setPopupClass("hide");
    setMessageDraft("");
    setIsMessageInputFocused(false);
    setMessagePopupKeyboardOffset(0);
    setIsSuperInterested(false);

    // Reset icon position and opacity
    const iconElement = document.querySelector(".icon-move");
    if (iconElement) {
      iconElement.style.transition = "none";
      iconElement.style.opacity = 0;
      iconElement.style.left = "0px";
      iconElement.style.top = "0px";
    }

    if (formProps) {
      formProps?.setFieldValue("message", "");
    }
  };

  const initializeMoveIconPosition = () => {
    const icon = document.querySelector(".icon-move");
    if (icon && iconRef.current) {
      const dummyIcon = iconRef.current;
      const dimension = dummyIcon.getBoundingClientRect();
      icon.style.transition = "none";
      icon.style.left = `${dimension.left}px`;
      icon.style.top = `${dimension.top}px`;
    }
  };

  const handleSubmit = async (values) => {
    const isMale = user?.gender === "male";
    setMessageError("");
    
    // CRITICAL FIX: Check tokens synchronously from Redux first for instant paywall
    // This eliminates the lag before showing paywall
    let currentInterestedTokens = user?.interested_tokens || 0;
    let currentSuperInterestedTokens = user?.super_interested_tokens || 0;

    console.log("[TOKEN DEBUG] isMale:", isMale);
    console.log("[TOKEN DEBUG] interestedTokens:", currentInterestedTokens);
    console.log("[TOKEN DEBUG] superInterestedTokens:", currentSuperInterestedTokens);
    console.log("[TOKEN DEBUG] isSuperInterested:", isSuperInterested);

    if (
      isMale &&
      ((isSuperInterested && currentSuperInterestedTokens === 0) ||
        (!isSuperInterested && currentInterestedTokens === 0))
    ) {
      try {
        const freshUser = paymentReturnSyncPromiseRef.current
          ? await paymentReturnSyncPromiseRef.current
          : paymentVisualRestoreStartedRef.current
          ? await refreshAuthUserFromServer()
          : null;

        if (freshUser) {
          currentInterestedTokens = freshUser?.interested_tokens || 0;
          currentSuperInterestedTokens =
            freshUser?.super_interested_tokens || 0;
        }
      } catch (refreshErr) {
        console.log(
          "[TOKEN DEBUG] Payment return token sync failed before send:",
          refreshErr?.message
        );
      }
    }

    // CRITICAL FIX: Check tokens IMMEDIATELY before any API calls for instant paywall
    if (isMale) {
      console.log("[TOKEN DEBUG] IMMEDIATE token check:", { currentInterestedTokens, currentSuperInterestedTokens });
      
      if (isSuperInterested) {
        // Trying to send Super Interested - must have super interested tokens
        if (currentSuperInterestedTokens === 0) {
          console.log("[TOKEN DEBUG] BLOCKED - No super interested tokens (INSTANT)");
          savePaymentReturnState(
            buildPaymentReturnState(values?.message ?? "", true)
          );
          showMenFirstDatePaywall(
            receiverData?.user_name ||
              receiverData?.user_data?.[0]?.full_name ||
              receiverData?.user_data?.[0]?.name ||
              receiverData?.user_data?.[0]?.username ||
              "Someone",
            48,
            true // Force show paywall - we know tokens are 0
          );
          return false;
        }
      } else {
        // Trying to send regular Interested - must have interested tokens (NOT super interested tokens!)
        if (currentInterestedTokens === 0) {
          console.log("[TOKEN DEBUG] BLOCKED - No interested tokens (INSTANT)");
          savePaymentReturnState(
            buildPaymentReturnState(values?.message ?? "", false)
          );
          showMenFirstDatePaywall(
            receiverData?.user_name ||
              receiverData?.user_data?.[0]?.full_name ||
              receiverData?.user_data?.[0]?.name ||
              receiverData?.user_data?.[0]?.username ||
              "Someone",
            48,
            true // Force show paywall - we know tokens are 0
          );
          return false;
        }
      }
    }
    
    // OPTIMIZATION: Fetch fresh token data in background for accuracy
    // But don't wait for it - we already checked synchronously above
    if (isMale) {
      apiRequest({
        method: "GET",
        url: "user/me",
      }).then((freshUserRes) => {
        if (freshUserRes?.data?.data?.user) {
          const freshUser = freshUserRes.data.data.user;
          dispatch({ type: AUTHENTICATE_UPDATE, payload: freshUser });
          console.log("[TOKEN DEBUG] Background refresh complete:", { 
            interested_tokens: freshUser.interested_tokens,
            super_interested_tokens: freshUser.super_interested_tokens
          });
        }
      }).catch((err) => {
        console.error("[TOKEN DEBUG] Background refresh failed:", err);
      });
    }

    console.log("[TOKEN DEBUG] Proceeding with message send...");
    
    try {
      const data = {
        senderId: user?._id ?? "",
        recieverId:
          receiverData?.user_data?.length > 0
            ? receiverData?.user_data[0]?._id
            : "",
        message: values.message ?? "",
        dateId: receiverData?._id ?? "",
        isSuperInterested: isSuperInterested,
      };
      
      console.log("[TOKEN DEBUG] Sending request with data:", data);
      
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/request`,
      });
      
      console.log("[TOKEN DEBUG] Response:", res?.data);
      
      // Decrement tokens after successful send
      if (isMale && res?.data?.status === 200) {
        const balances = res?.data?.data?.userBalances;
        const optimisticBalances = isSuperInterested
          ? {
              super_interested_tokens: Math.max(
                0,
                (currentSuperInterestedTokens || 0) - 1
              ),
            }
          : {
              interested_tokens: Math.max(
                0,
                (currentInterestedTokens || 0) - 1
              ),
            };
        dispatch({ type: AUTHENTICATE_UPDATE, payload: optimisticBalances });
        if (balances) {
          const reconciledBalances = isSuperInterested
            ? {
                super_interested_tokens: Math.min(
                  optimisticBalances.super_interested_tokens ?? 0,
                  balances.super_interested_tokens ?? 0
                ),
              }
            : {
                interested_tokens: Math.min(
                  optimisticBalances.interested_tokens ?? 0,
                  balances.interested_tokens ?? 0
                ),
              };
          dispatch({ type: AUTHENTICATE_UPDATE, payload: reconciledBalances });
        }
        console.log("[TOKEN DEBUG] Message sent successfully, fetching fresh user data");
        // Backend already decremented tokens, just fetch fresh data
        try {
          const freshUserRes = await apiRequest({
            method: "GET",
            url: "user/me",
          });
          if (freshUserRes?.data?.data?.user) {
            dispatch({ type: AUTHENTICATE_UPDATE, payload: freshUserRes.data.data.user });
            console.log("[TOKEN DEBUG] User state updated with fresh data");
          }
        } catch (refreshErr) {
          console.error("[TOKEN DEBUG] Failed to refresh user data:", refreshErr);
        }
      }
      
      // Start animation, close popup after 3 second animation completes
      moveIcon(() => {
        delayedMessageDoneTimerRef.current = setTimeout(() => {
          setAlreadyMessagedFromUser(true);
          delayedMessageDoneTimerRef.current = null;
        }, 450);
      });
      return true;
    } catch (err) {
      console.error("[TOKEN DEBUG] Send message error:", err);
      const errorMessage = err.response?.data?.message ?? "";
      const statusCode = err?.response?.status;
      setMessageError(errorMessage);
      
      // Show paywall if server returns 403 (no tokens)
      if (statusCode === 403 && isMale) {
        console.log("[TOKEN DEBUG] Server returned 403 - showing paywall");
        savePaymentReturnState({
          source: "user-list-message-modal",
          returnPath: "/user/user-list",
          draftMessage: values?.message ?? "",
          isSuperInterested,
          date: receiverData,
        });
        showMenFirstDatePaywall(
          receiverData?.user_name ||
            receiverData?.user_data?.[0]?.full_name ||
            receiverData?.user_data?.[0]?.name ||
            receiverData?.user_data?.[0]?.username ||
            "Someone",
          48,
          true // Force show paywall - server confirmed no tokens
        );
        return false;
      }
      
      if (
        statusCode === 401 &&
        errorMessage === "Failed to authenticate token!"
      ) {
        setLogoutLoading(true);
        setTimeout(() => {
          logout(router, dispatch);
          setLogoutLoading(false);
        }, 2000);
      }
      return false;
    }
  };

  function growDiv(id) {
    // setDateId(id)
    let growDiv = document.getElementById("message-popup");
    if (growDiv.style?.top) {
      growDiv.style.top = "100%";
    } else {
      growDiv.style.top = "unset";
    }
  }

  const moveIcon = (onComplete) => {
    setTextSlideClass("show");
    const element = document.querySelector(".icon-move");
    const target = document.getElementById("message-icon");
    if (target && element) {
      const startRect = iconRef.current?.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (!startRect) {
        setTextSlideClass("");
        setIsSuperInterested(false);
        return;
      }

      const startLeft = startRect.left + startRect.width / 2 - 15;
      const startTop = startRect.top + startRect.height / 2 - 15;
      const rawTargetLeft = targetRect.left + targetRect.width / 2 - 15;
      const rawTargetTop = targetRect.top + targetRect.height / 2 - 15;
      const targetLeft = Math.min(
        Math.max(rawTargetLeft, 12),
        window.innerWidth - 42
      );
      const targetTop = Math.min(
        Math.max(rawTargetTop, 12),
        window.innerHeight - 42
      );

      element.style.transition = "none";
      element.style.opacity = 1;
      element.style.left = `${startLeft}px`;
      element.style.top = `${startTop}px`;

      void element.offsetWidth;

      window.requestAnimationFrame(() => {
        element.style.transition = "left 3s ease-in-out, top 3s ease-in-out, opacity 0.2s ease";
        element.style.left = `${targetLeft}px`;
        element.style.top = `${targetTop}px`;
      });
    }
    // After animation completes (3 seconds), hide icon and reset state
    setTimeout(() => {
      if (element) {
        // Keep the opacity transition so it fades out smoothly instead of instant disappear
        element.style.transition = "opacity 0.3s ease-out";
        element.style.opacity = 0;
      }
      setTextSlideClass("");
      setIsSuperInterested(false);
      // Also close the popup since animation is done
      setPopupClass("hide");
      setIsMessageInputFocused(false);
      setMessagePopupKeyboardOffset(0);
      onComplete?.();
    }, 3000);
  };

  // Scroll reveal animation for date cards
  // IMPORTANT: this effect is intentionally a no-op now. The previous
  // implementation called getBoundingClientRect() on every #scrolldiv on
  // every scroll event (~60-120 forced layout reflows per second on a
  // mobile fast-scroll), which on iOS Safari starves the JS thread and
  // crashes the page with "A problem has occurred". DateAndLocation.js
  // already activates every card with .scrollActive on mount so the
  // animation runs once instead of being toggled on every scroll.
  // Left as an effect placeholder so future opt-in (e.g. via
  // IntersectionObserver) can replace it without restructuring callers.
  useEffect(() => {
    return undefined;
  }, [classPopup]);

  // Track scroll direction (used by some sticky-header logic) without
  // ever putting it in component state. Putting it in state caused:
  //   1. A setState on every scroll event (~60+/sec on mobile)
  //   2. The effect below to re-attach the listener on every change
  //      because it depended on `scrollPosition`, creating add/remove
  //      churn that compounded the re-render storm and crashed iOS.
  // We now keep the value in refs and only commit to component state
  // via requestAnimationFrame, capped at one update per frame.
  const lastScrollPositionRef = useRef(0);
  const scrollRafRef = useRef(0);

  // Scroll handler removed entirely. Previously tracked direction/position
  // for sticky-header logic that's been commented out for a while. Removing
  // the listener avoids any per-scroll work on iOS during fast scrolling.

  useEffect(() => {
    if (user?.gender === "male") {
      setCountry(user?.country_code);
    }
  }, []);

  const handleFectchCurrentLocation = () => {
    setCurrentLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (
          position.coords.latitude !== undefined &&
          position.coords.longitude !== undefined
        ) {
          const locations = await fetchLiveLocation(
            position.coords.latitude,
            position.coords.longitude,
            countries
          );
          const location = locations[0];
          setLocation({
            city: location.name,
            country: location?.country[0]?.short_code,
            province: location?.province[0]?.short_code?.split("-")[1],
            stateName: location?.province[0]?.text,
            countryName: location?.country[0]?.text,
          });
          // setShow(false);
          dispatch(changeSelectedLocationPopup(false));
          dispatch(change("LocationPopup", "enter_city", location?.name));
          setCurrentLocationLoading(false);
        }
      },
      (err) => {
        setCurrentLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // useEffect(() => {
  //   socket.auth = { user: user };
  //   socket.connect();
  //   console.log("socket", socket.auth);
  //   socket.on("connect", () => {
  //     console.log("connected", socket.connected);
  //   });
  //   socket.on("disconnect", (reason) => {
  //     console.log("socket disconnected reason", reason);
  //   });
  // }, []);

  // useEffect(() => {
  //   socket.on("connect_error", () => {
  //     console.log("connect_error");
  //     socket.auth = { user: user };
  //     socket.connect();
  //   });
  // }, [!socket.connected]);

  // useEffect(() => {
  //   // if (socket.connected) {
  //   console.log("Notif socket connected", socket.connected);
  //   //`push-notification-${user?.email}`
  //   socket.on(`push-notification-${user?.email}`, (message) => {
  //     console.log("notif received", message);
  //   });
  //   // }
  // }, [socket.connected]);

  // if (show) {
  //   return (
  //     <LocationModalPopUp
  //       onClose={() => {
  //         setShow(false);
  //         dispatch(changeSelectedLocationPopup(false));
  //       }}
  //       show={show}
  //       handleFectchCurrentLocation={handleFectchCurrentLocation}
  //       currentLocationLoading={currentLocationLoading}
  //     />
  //   );
  // }

  if (logoutLoading) {
    return <Loader />;
  }

  const messagePopupContent = (
    <>
      {classPopup === "show" && (
        <div
          className="message-popup-backdrop"
          onWheel={(event) => event.preventDefault()}
          onTouchMove={(event) => event.preventDefault()}
          // Backdrop no longer closes modal on click - only close button should close it
        />
      )}
      <div
        id="message-popup"
        className={`message-popup ${classPopup}`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchMove={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        style={{
          "--message-popup-keyboard-offset": `${messagePopupKeyboardOffset}px`,
        }}
      >
        <Formik
          enableReinitialize
          initialValues={{
            message: messageDraft,
          }}
          validationSchema={Yup.object({
            message: Yup.string().required("Please enter your message"),
          })}
          onSubmit={async (values, { resetForm }) => {
            if (values.message?.trim() !== "") {
              const didSend = await handleSubmit(values);
              if (didSend) {
                resetForm();
              }
            }
          }}
        >
          {(formProps) => {
            return (
              <Form>
                <span
                  onClick={() => {
                    closePopup(formProps);
                    formProps.setFieldValue("message", "");
                  }}
                  className="close-button"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.9924 12.9926L1.00244 1.00006"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12.9887 1.00534L1.00873 12.9853"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <p className="msg">
                  "
                  {receiverData?.user_data?.length > 0 &&
                    receiverData?.user_data[0]?.tagline}
                  "
                </p>
                <div
                  className={`super__interested__star ${
                    isSuperInterested ? "active" : ""
                  }`}
                  onClick={() => setIsSuperInterested(!isSuperInterested)}
                >
                  <Image
                    src={isSuperInterested ? StarIcon : StarBlankIcon}
                    height={15}
                    width={15}
                  />

                  <span className="super__interested">
                    I’m Super Interested!
                  </span>
                </div>
                <div>
                  <div
                    className=""
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Field
                      className={`${textClass} ${
                        isSuperInterested
                          ? "is__super__interested__message__input"
                          : "message__modal__input"
                      }`}
                      placeholder="Type your message here…"
                      name="message"
                      id="message"
                      component={CustomInput}
                      style={{
                        width: "90%",
                      }}
                      onFocus={() => {
                        if (messageInputBlurTimeoutRef.current) {
                          clearTimeout(messageInputBlurTimeoutRef.current);
                        }
                        if (typeof window !== "undefined" && width < 768) {
                          messagePopupScrollYRef.current =
                            window.scrollY || window.pageYOffset || 0;
                        }
                        setIsMessageInputFocused(true);
                      }}
                      onBlur={() => {
                        if (messageInputBlurTimeoutRef.current) {
                          clearTimeout(messageInputBlurTimeoutRef.current);
                        }
                        messageInputBlurTimeoutRef.current = setTimeout(() => {
                          setIsMessageInputFocused(false);
                        }, 180);
                      }}
                      onTouchStart={(event) => {
                        if (width >= 768) return;
                        event.preventDefault();
                        event.stopPropagation();
                        messagePopupScrollYRef.current =
                          window.scrollY || window.pageYOffset || 0;
                        event.currentTarget.focus({ preventScroll: true });
                      }}
                    />
                    {isSuperInterested && (
                      <div
                        style={{
                          position: "absolute",
                          left: "14%",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          src={StarIcon}
                          alt="star"
                          width={15}
                          height={15}
                          style={{
                            paddingTop: "10px !important",
                          }}
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      style={{
                        position: "absolute",
                        right: "13%",
                        background: "transparent",
                        border: "none",
                        width: "48px",
                        height: "48px",
                        paddingBottom: "5px",
                        paddingTop: "11px",
                        cursor: "pointer",
                        zIndex: 5,
                        pointerEvents: "auto",
                        touchAction: "manipulation",
                      }}
                      aria-label="Send message request"
                      onPointerDown={(event) => event.stopPropagation()}
                      onTouchStart={(event) => event.stopPropagation()}
                    >
                      <div
                        ref={iconRef}
                        style={{
                          background: "transparent",
                          border: "none",
                          pointerEvents: "none",
                        }}
                      >
                        <Image
                          src={
                            formProps.values.message === ""
                              ? MessageSend5
                              : MessageSend2
                          }
                          alt="send-btn"
                          width={30}
                          height={30}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
        <p className="tip">Tip: Maybe mention why you’re here.</p>
      </div>
    </>
  );

  return (
    <div
      className="inner-page"
      id="infiniteScroll"
      style={suppressPaymentReturnPaint ? { visibility: "hidden" } : undefined}
    >
      <HeaderLoggedIn
        fixed={width < 767 || width > 767}
        isBlack={locationPopup}
        unReadedConversationLength={unReadedConversationLength}
        pendingRequestLength={pendingRequestLength}
        count={count}
        setCount={setCount}
        setLogoutLoading={setLogoutLoading}
      />
      <DateLiveModal
        isOpen={showDateLiveModal}
        onClose={handleCloseDateLiveModal}
        checked={dontShowLiveAgain}
        onToggleChecked={(next) =>
          setDontShowLiveAgain(
            typeof next === "boolean" ? next : !dontShowLiveAgain
          )
        }
      />
      <EditDateReviewModal
        isOpen={showEditReviewModal}
        onClose={handleCloseEditReviewModal}
      />
      {/* <div
        className={classNames(
          `modal fade ${show ? "show d-block modal-open" : "d-none"}`,
          width > 1399 && "modal-fade-1"
        )}
      ></div> */}
      <div className="inner-part-page">
        <div className="pt-5 pb-4">
          <div className="container user_list_wrap">
            <div className="row topSpace_Desk">
              <div className="col-md-2"></div>
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex align-items-center justify-content-center justify-content-md-between pb-3 top-space">
                      <span className="hidden-sm">Nearby</span>
                      {width < 430 ? (
                        <div
                          className="d-flex align-items-center justify-content-end"
                          // style={
                          //   (scrollType === "up" || "down") &&
                          //   scrollPosition > 5 &&
                          //   !locationPopup
                          //     ? width > 767
                          //       ? {
                          //           position: "fixed",
                          //           width: "59%",
                          //           zIndex: "10",
                          //         }
                          //       : { position: "fixed", left: "34%", zIndex: "10" }
                          //     : { position: "relative" }
                          // }
                        >
                          {/* <span className="hidden-sm">Nearby</span> */}
                          <div
                            onClick={() => setLocationPoup(true)}
                            className="selct-wrap-sort"
                          >
                            <label>
                              <span className="city-txt city-txt-gallary">
                                {galleryTitle}
                              </span>
                            </label>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <DateAndLocation
                  currentLocationLoading={currentLocationLoading}
                  selectedLocation={selectedLocation}
                  show={show}
                  openPopup={openPopup}
                  closePopup={closePopup}
                  receiverData={receiverData}
                  alreadyMessagedFromUser={alreadyMessagedFromUser}
                  setAlreadyMessagedFromUser={setAlreadyMessagedFromUser}
                  setLocation={setLocation}
                  growDiv={growDiv}
                  searchStatus={searchStatus}
                  setLogoutLoading={setLogoutLoading}
                  restoreTargetDateId={
                    pendingPaymentRestore?.dateId ||
                    pendingPaymentRestore?.date?._id ||
                    ""
                  }
                  restorePageCount={pendingPaymentRestore?.loadedPage || 1}
                  restoreOpenDateId={
                    pendingPaymentRestore?.dateId ||
                    pendingPaymentRestore?.date?._id ||
                    ""
                  }
                />
              </div>
              {width > 767 && (
                <div className="col-md-2">
                  <div
                    className="d-flex align-items-center justify-content-end"
                    style={{ marginTop: "26px" }}
                    // style={
                    //   (scrollType === "up" || "down") &&
                    //   scrollPosition > 5 &&
                    //   !locationPopup
                    //     ? width > 767
                    //       ? { position: "fixed", width: "59%", zIndex: "99" }
                    //       : { position: "fixed", left: "34%", zIndex: "99" }
                    //     : { position: "relative" }
                    // }
                  >
                    {/* <span className="hidden-sm">Nearby</span> */}
                    <div
                      onClick={() => setLocationPoup(true)}
                      className="selct-wrap-sort position-fixed"
                    >
                      <label>
                        <span className="city-txt city-txt-gallary">
                          {galleryTitle}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {typeof document !== "undefined"
        ? ReactDOM.createPortal(messagePopupContent, document.body)
        : null}
      <div
        className="icon-move"
        style={{
          background: "transparent",
          border: "none",
          pointerEvents: "none",
        }}
      >
        <Image src={MessageSend2} alt="icon-move" width={30} height={30} />
      </div>
      {/* <DatePopup
                modalIsOpen={modalIsOpen}
                closeModal={closeModal}
            /> */}
      <LocationPopup
        modalIsOpen={locationPopup}
        closeModal={() => setLocationPoup(false)}
        selectedLocation={selectedLocation}
        setLocation={setLocation}
        setSearchStaus={setSearchStaus}
      />
      <PaywallModal
        isOpen={paywallConfig.isOpen}
        onClose={closePaywall}
        type={paywallConfig.type}
        expiresIn={paywallConfig.expiresIn}
        userName={paywallConfig.userName}
        pricingConfig={pricingConfig}
      />
    </div>
  );
}

export default withAuth(UserList);
