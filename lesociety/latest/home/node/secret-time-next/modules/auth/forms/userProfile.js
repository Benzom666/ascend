import React, { useState } from "react";
import HeaderLoggedIn from "core/loggedInHeader";
import { useSelector, useDispatch } from "react-redux";
import { BiChevronLeft, BiTrashAlt, BiEditAlt } from "react-icons/bi";
import Image from "next/image";
import { formatDisplayLocation, formatDisplayName, formatDisplayText } from "utils/formatDisplayText";
import { formatDateDuration } from "utils/dateDuration";
import { HiBadgeCheck } from "react-icons/hi";
import { Field, reduxForm, initialize } from "redux-form";
import { Inputs } from "core";
import validate from "modules/auth/forms/validate/validate";
import H5 from "core/H5";
import SubHeading from "core/SubHeading";
import useWindowSize from "utils/useWindowSize";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
const TopBadgeCard = "/assets/img/TopCardBadge.png";
import moment from "moment";
import { logout, signupStep4 } from "../authActions";
import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  apiRequest,
  dateCategory,
  countriesCode,
  socketURL,
} from "utils/Utilities";
import { isActiveDate, getActiveDateCount } from "utils/dateState";
import SkeletonUserProfile from "@/modules/skeleton/user/SkeletonUserProfile";
import CreateDatePrimaryButton from "@/components/common/CreateDatePrimaryButton";
import { startOrResumeCreateDate } from "utils/createDateFlow";
import { redirectToCreateDateLimit } from "utils/createDateAccessGuard";
import { clearCreateDateLimitState } from "utils/createDateLimitState";

const close1 = "/assets/close1.png";
import ProfileImageSlider from "./ProfileImageSlider";
import ImageSlider from "./ImageSlider";
import MessageModal from "@/core/MessageModal";
import io from "socket.io-client";
import { AUTHENTICATE_UPDATE } from "../actionConstants";
import PaywallModal from "@/core/PaywallModal";
import Loader from "@/modules/Loader/Loader";
import { usePaywall } from "../../../hooks/usePaywall";
import {
  activateCreateDateFlow,
  clearCreateDateFlow,
  getCreateDateResumePath,
  readCreateDateFlow,
  writeCreateDateFlow,
} from "utils/createDateFlow";
import { getUnreadConversationActivityCount } from "utils/chatState";

export const socket = io(socketURL, {
  autoConnect: true,
});

const REQUESTS_RETURN_STATE_KEY = "messages-requests-return-state";

function UserProfile({ preview, editHandle }) {
  const { width } = useWindowSize();
  const [loading, setLoading] = React.useState(false);
  const [dateModalOpen, dateSetIsOpen] = React.useState(false);
  const [userDetail, setUserDetail] = React.useState("");
  const [userDates, setUserDates] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState("");
  const user = useSelector((state) => state.authReducer.user);
  // Initialize pageLoading to false if in preview mode (signup flow)
  const [pageLoading, setPageLoading] = useState(!preview);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileBackLoading, setProfileBackLoading] = useState(false);
  const [datesLoadingState, setDatesLoadingState] = useState(!preview);
  const [dateloading, setDateloading] = useState(true);
  const [page, setPage] = useState(1);
  const [alreadyMessaged, setAlreadyMessaged] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  
  // Paywall integration
  const { paywallConfig, pricingConfig, showMenFirstDatePaywall, closePaywall } = usePaywall();

  const [viewFullPage, setViewFullPage] = useState(false);
  const [slideShowIndex, setSlideShowIndex] = useState(0);
  const [ladiesShow, setLadiesShow] = useState(false);

  // for notification
  const [count, setCount] = useState(0);

  const checkIpad =
    width > 768 && width < 1366 && width !== 1024 && width !== 768;

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected reason", reason);
    });
  }, [!socket.connected]);

  socket.on(
    "connect_error",
    () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    },
    [!socket.connected]
  );

  useEffect(() => {
    if (user?.token) {
      getConversations();
    }
  }, [user?.token]);

  useEffect(() => {
    socket.on(`request-${user?._id}`, (message) => {
      console.log("reqested message header", message);
      getConversations();
    });
  }, [socket.connected]);

  useEffect(() => {
    socket.on(`recieve-${user?._id}`, (message) => {
      console.log("recieve message header", message);
      getConversations();
    });
  }, [socket.connected]);

  const unReadedConversationLength = getUnreadConversationActivityCount(
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
      setConversations(conversations);
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

  useEffect(() => {
    console.log("Notif socket connected", socket.connected);
    // socket.on("connect", () => {
    //   console.log(socket.id);
    // });
    socket.on(`push-notification-${user.email}`, (message) => {
      console.log("notif received", message);
      const unc = message?.notifications?.filter(
        (item) => item.status === 0 && item.type !== "notification"
      ).length;
      localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
      setCount(unc);
    });
  }, [socket.connected]);

  useEffect(() => {
    if (viewFullPage) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [viewFullPage]);

  const dispatch = useDispatch();
  const router = useRouter();
  const isRequestEmbed = router?.query?.embedRequest === "1";
  const showRequestBackButton =
    router?.query?.source === "message-request" &&
    Boolean(router?.query?.userName);
  const requestReturnId =
    router?.query?.requestId || router?.query?.roomId || null;
  const normalizeExperienceLabel = (label = "") => {
    const map = {
      Brunch: "Brunch Date",
      "Entertainment & Sport": "Entertainment & Sports",
    };
    return map[label] || label;
  };

  const getDateExperienceLabel = (date = {}) =>
    normalizeExperienceLabel(
      date?.standard_class_date ||
        date?.middle_class_dates ||
        date?.middle_class_date ||
        date?.executive_class_dates ||
        date?.executive_class_date ||
        ""
    );

  const getDateCategory = (date = {}) => {
    const label = getDateExperienceLabel(date);
    return dateCategory.find((item) => item?.label === label);
  };

  const formatDuration = (value = "") => {
    if (!value) return "N/A";
    return formatDateDuration(value);
  };

  const selectedDateCategory = getDateCategory(selectedDate);
  const isMaleViewingFemaleProfile =
    user?.gender === "male" &&
    userDetail?.gender === "female" &&
    Boolean(router?.query?.userName) &&
    router?.query?.userName !== user?.user_name;
  // console.log(userDates);
  // console.log(loading);
  const convertToFeet = (cmValue) => (cmValue * 0.0328084).toPrecision(2);

  const toFeet = (n) => {
    var realFeet = (n * 0.3937) / 12;
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "'" + inches;
  };

  useEffect(() => {
    if (dateModalOpen && user?.gender === "male") {
      setMessageLoading(true);
      checkMessage();
    }
  }, [dateModalOpen]);

  const checkMessage = async () => {
    try {
      const data = {
        recieverId:
          selectedDate?.user_data?.length > 0
            ? selectedDate?.user_data[0]?._id
            : "",
        dateId: selectedDate?._id ?? "",
      };
      const res = await apiRequest({
        params: data,
        method: "GET",
        url: `chat/exist`,
      });
      setTimeout(() => {
        setMessageLoading(false);
      }, 10);
      const room = res?.data?.data?.chatRoom;
      const roomStatus = room?.status;
      const isExpiredPending =
        roomStatus === 0 &&
        room?.expires_at &&
        new Date(room.expires_at).getTime() <= Date.now();
      const isRejectedStatus = roomStatus === 3;
      const isExpiredStatus = roomStatus === 4;
      setAlreadyMessaged(
        Boolean(
          res?.data?.message &&
            room &&
            !isExpiredPending &&
            !isRejectedStatus &&
            !isExpiredStatus
        )
      );
    } catch (err) {
      setMessageLoading(false);
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

  function dateModalIsOpen() {
    dateSetIsOpen(true);
  }

  function dateCloseModal(event) {
    if (event?.preventDefault) event.preventDefault();
    if (event?.stopPropagation) event.stopPropagation();
    dateSetIsOpen(false);
    setSelectedDate("");
    setAlreadyMessaged(false);
  }

  const fetchDates = async (params) => {
    setLoading(true);
    setDatesLoadingState(true);
    try {
      const res = await apiRequest({
        url: "date",
        params: params,
      });
      const nextDates = Array.isArray(res?.data?.data?.dates)
        ? res.data.data.dates
        : [];
      setUserDates(nextDates);
      setDatesLoadingState(false);
      setPagination(res?.data?.data?.pagination);
      setDateloading(false);
      setLoading(false);
      setPageLoading(false);
      return nextDates;
    } catch (err) {
      console.log("err", err);
      setDatesLoadingState(false);
      setUserDates([]);
      setDateloading(false);
      setLoading(false);
      setPageLoading(false);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!" &&
        user?.token
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const fetchUserDetails = async (userName) => {
    try {
      setProfileLoading(true);
      const res = await apiRequest({
        url: `user/user-by-name?user_name=${userName}`,
      });
      if (res?.data?.data?.user) {
        setUserDetail(res?.data?.data?.user);
      }
      setProfileLoading(false);
      setPageLoading(false);
    } catch (e) {
      setProfileLoading(false);
      setPageLoading(false);
      if (
        e?.response?.status === 401 &&
        e?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return e;
    }
  };

  const viewedUserName = router?.query?.userName;
  const ownProfileUserName =
    user?.gender === "female" && !viewedUserName ? user?.user_name : "";
  const isFemaleViewingOwnProfile =
    user?.gender === "female" &&
    (!viewedUserName || viewedUserName === user?.user_name);

  // For males without a viewed username, ownProfileUserName should be their own username
  const isMaleViewingOwnProfile = user?.gender === "male" && !viewedUserName && user?.user_name;
  const isViewingExternalProfile = Boolean(viewedUserName && viewedUserName !== user?.user_name);
  const shouldShowProfileSkeleton = pageLoading || datesLoadingState || (isViewingExternalProfile && (profileLoading || !userDetail));

  const buildDateParams = (userName, currentPage = page) => ({
    current_page: currentPage,
    per_page: 1000,
    user_name: userName,
  });

  useEffect(() => {
    if (viewedUserName) {
      setProfileLoading(true);
    }

    if (viewedUserName && user?.token) {
      fetchUserDetails(viewedUserName);
      const params = buildDateParams(viewedUserName);
      fetchDates(params);
    }
    return () => {
      setUserDetail("");
      setUserDates([]);
    };
  }, [viewedUserName, user?.token, page]);

  useEffect(() => {
    if (ownProfileUserName && user?.token) {
      setDatesLoadingState(true);
      const params = buildDateParams(ownProfileUserName);
      fetchDates(params);
    }
    return () => {
      setUserDetail("");
      setUserDates([]);
    };
  }, [
    ownProfileUserName,
    user?.token,
    page,
    router?.pathname,
    router?.query?.posted,
    router?.query?.edited,
  ]);

  useEffect(() => {
    if (isMaleViewingOwnProfile && user?.token) {
      setDatesLoadingState(true);
      const params = buildDateParams(isMaleViewingOwnProfile);
      fetchDates(params);
    }
    return () => {
      setUserDetail("");
      setUserDates([]);
    };
  }, [isMaleViewingOwnProfile, user?.token, page]);

  const onSubmit = () => {
    dispatch(
      signupStep4(
        { email: user?.email, step_completed: 4 },
        setLoading,
        handleUpdateRoutePage
      )
    );
  };

  const editDate = () => {
    const selectedDateImageIndex = Number(selectedDate?.image_index);
    const selectedDateOwnerImages = Array.isArray(selectedDate?.user_data?.[0]?.images)
      ? selectedDate?.user_data?.[0]?.images
          .map((item) => {
            if (!item) return "";
            if (typeof item === "string") return item;
            if (typeof item === "object") {
              return item.url || item.location || "";
            }
            return "";
          })
          .filter((url) => typeof url === "string" && url.length > 0)
      : [];
    const selectedDateImageUrl =
      (Number.isFinite(selectedDateImageIndex) &&
        selectedDateOwnerImages[selectedDateImageIndex]) ||
      (typeof selectedDate?.image === "string" ? selectedDate.image : "") ||
      (typeof selectedDate?.date_image === "string"
        ? selectedDate.date_image
        : "");

    const country = Object.keys(countriesCode).find(
      (key) =>
        countriesCode[key]?.toLowerCase() ===
        selectedDate.country_code?.toLowerCase()
    );
    // dispatch(
    //   initialize("ChooseCity", {
    //     enter_country: { label: country, value: selectedDate.country_code },
    //     enter_city: {
    //       name: selectedDate?.location,
    //       country: [
    //         {
    //           short_code: selectedDate.country_code,
    //           text: country,
    //         },
    //       ],
    //       label: selectedDate?.location,
    //     },
    //   })
    // );
    const normalizedDurationLabel = formatDateDuration(selectedDate?.date_length);

    dispatch(
      initialize("ChooseCity", {
        enter_country: {
          label: country,
          value: selectedDate.country_code,
        },
        enter_city: {
          name: selectedDate?.location,
          country: [
            {
              short_code: selectedDate.country_code,
              text: country,
            },
          ],
          label: selectedDate?.location + ", " + selectedDate?.province,
          province: [{ short_code: selectedDate?.province?.toUpperCase() }],
        },
      })
    );
    dispatch(
      initialize("CreateStepOne", {
        search_type: selectedDateCategory,
        dateId: selectedDate?._id,
      })
    );
    dispatch(initialize("CreateStepTwo", { education: selectedDate?.price }));
    dispatch(
      initialize("CreateStepThree", { education: normalizedDurationLabel })
    );
    dispatch(
      initialize("CreateStepFour", {
        date_description: selectedDate?.date_details,
      })
    );
    const existingFlow = readCreateDateFlow();
    const isSameEditDraft =
      existingFlow?.editMode &&
      String(existingFlow?.dateId || "") === String(selectedDate?._id || "");
    const preservedResumePath = isSameEditDraft
      ? getCreateDateResumePath(existingFlow)
      : "/create-date/description?new_edit=true";
    try {
      activateCreateDateFlow({
        flowMode: "edit-existing",
        dateId: selectedDate?._id,
      });
      writeCreateDateFlow({
        flowMode: "edit-existing",
        editMode: true,
        resumePath: preservedResumePath,
        dateId: selectedDate?._id,
        editImageIndex: selectedDateImageIndex,
        editImageUrl: selectedDateImageUrl,
        city: selectedDate?.province
          ? `${formatDisplayText(selectedDate?.location)}, ${selectedDate?.province?.toUpperCase()}`
          : formatDisplayText(selectedDate?.location),
        cityData: {
          label: selectedDate?.province
            ? formatDisplayLocation(selectedDate?.location, selectedDate?.province)
            : formatDisplayText(selectedDate?.location),
          name: selectedDate?.location,
          country: selectedDate?.country_code
            ? [{ short_code: selectedDate?.country_code, text: country || "" }]
            : [],
          province: selectedDate?.province
            ? [
                {
                  short_code: selectedDate?.province?.toUpperCase(),
                  text: selectedDate?.province,
                },
              ]
            : [],
        },
        selectedDateType: selectedDateCategory?.id || null,
        selectedPrice: selectedDate?.price,
        selectedDuration: normalizedDurationLabel,
        selectedDurationValue: normalizedDurationLabel,
        description: selectedDate?.date_details || "",
        originalDateLabel: getDateExperienceLabel(selectedDate),
        originalDateField: selectedDate?.standard_class_date
          ? "standard_class_date"
          : selectedDate?.middle_class_dates || selectedDate?.middle_class_date
          ? "middle_class_dates"
          : "executive_class_dates",
      });
    } catch (err) {
      console.error("Error saving edit date flow:", err);
    }

    router.push(preservedResumePath);
  };

  const deleteDate = async () => {
    try {
      const deletedDateId = selectedDate?._id;
      const res = await apiRequest({
        data: {
          ids: deletedDateId ? [deletedDateId] : [],
        },
        method: "DELETE",
        url: "date/delete-by-ids",
      });
      if (res?.data?.data) {
        const params = {
          current_page: page,
          per_page: 1000,
          user_name: user?.user_name,
        };
        const refreshedDates = await fetchDates(params);
        const activeDatesCount = Array.isArray(refreshedDates)
          ? getActiveDateCount(refreshedDates)
          : 0;
        clearCreateDateLimitState();
        dispatch({
          type: AUTHENTICATE_UPDATE,
          payload: {
            active_dates_count: activeDatesCount,
          },
        });
      }
    } catch (e) {
      console.log(e);
      if (
        e?.response?.status === 401 &&
        e?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return e;
    } finally {
      dateCloseModal();
    }
  };

  const handleUpdateRoutePage = () => {
    console.log("handleUpdateRoutePage called");
    if (router?.query?.edit)
      return router.push({
        pathname: "/auth/update-profile",
      });
    else {
      return null;
    }
  };

  const getUpdatedUserDetails = async () => {
    // setLoading(true);
    try {
      const res = await apiRequest({
        method: "GET",
        url: `user/user-by-name?user_name=${user?.user_name}`,
      });
      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: { ...res.data?.data?.user },
      });
    } catch (err) {
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

  const handleCreateDateClick = async () => {
    const activeDatesCount = userDates.filter((date) => isActiveDate(date)).length;

    if (activeDatesCount >= 4) {
      return redirectToCreateDateLimit(router);
    }

    // OPTIMIZED: Pass skipLimitCheck since we already checked above
    // This avoids duplicate API call, making button feel more responsive
    return startOrResumeCreateDate(router, {
      token: user?.token,
      userName: user?.user_name,
      skipLimitCheck: true, // Already checked on line 642
    });
  };

  const activeDatesCount = getActiveDateCount(userDates);
  const canCreateNewDate = activeDatesCount < 4;

  // useEffect(() => {
  //   if (router?.query?.edit && user?.step_completed === 4) {
  //     router.push({
  //       pathname: "/auth/update-profile",
  //     });
  //   }
  // }, [user, router?.query?.edit]);

  const nextPage = () => {
    const params = {
      current_page: page + 1,
      per_page: 2,
      user_name: user?.user_name,
    };
    setPage(page + 1);
    fetchDates(params);
  };

  const prevPage = () => {
    const params = {
      current_page: page - 1,
      per_page: 2,
      user_name: user?.user_name,
    };
    setPage(page - 1);
    fetchDates(params);
  };

  const faltuImage =
    "https://img.freepik.com/premium-photo/black-stone-texture-dark-slate-background-top-view_88281-1206.jpg?w=2000";

  const normalizeImageList = (list = []) => {
    if (!list) return [];
    if (Array.isArray(list)) {
      return list
        .map((item) => {
          if (!item) return "";
          if (typeof item === "string") return item;
          if (typeof item === "object") {
            const url = item.url || item.location || "";
            return typeof url === "string" ? url : "";
          }
          return "";
        })
        .filter((url) => typeof url === "string" && url.length > 0);
    }
    if (typeof list === "string") {
      return list ? [list] : [];
    }
    if (typeof list === "object") {
      const url = list.url || list.location || "";
      return url ? [url] : [];
    }
    return [];
  };

  const resolvedImages = (() => {
    const detailImages = normalizeImageList(userDetail?.images);
    const unverifiedImages = normalizeImageList(user?.un_verified_images);
    const userImages = normalizeImageList(user?.images);

    if (router.query?.edit) {
      const mergedImages = [0, 1, 2, 3]
        .map((index) => unverifiedImages[index] || userImages[index] || "")
        .filter((url) => url);

      if (mergedImages.length > 0) return mergedImages;
    }

    if (detailImages.length > 0) return detailImages;
    if (userImages.length > 0) return userImages;
    if (unverifiedImages.length > 0) return unverifiedImages;

    return [];
  })();

  const userImageProfile = resolvedImages[0] || faltuImage;
  const userImage1 = resolvedImages[1] || faltuImage;
  const userImage2 = resolvedImages[2] || faltuImage;
  const userImage3 = resolvedImages[3] || faltuImage;

  const userTagline =
    userDetail?.tagline ||
    (router.query?.edit && user?.un_verified_tagline
      ? user?.un_verified_tagline
      : user?.tagline);

  const userDescription =
    userDetail?.description ||
    (router.query?.edit && user?.un_verified_description
      ? user?.un_verified_description
      : user?.description);

  const pendingProfileDetails = user?.un_verified_profile_details || {};
  const displayEducation =
    router.query?.edit && pendingProfileDetails.max_education
      ? pendingProfileDetails.max_education
      : userDetail?.max_education || user?.max_education;
  const displayHeight =
    router.query?.edit && pendingProfileDetails.height != null
      ? pendingProfileDetails.height
      : userDetail?.height || user?.height;
  const displaySmoker =
    router.query?.edit && pendingProfileDetails.is_smoker
      ? pendingProfileDetails.is_smoker
      : userDetail?.is_smoker || user?.is_smoker;
  const displayOccupation =
    router.query?.edit && pendingProfileDetails.occupation
      ? pendingProfileDetails.occupation
      : userDetail?.occupation || user?.occupation;

  const documentVerified = userDetail
    ? userDetail?.documents_verified
    : user?.documents_verified;

  const slides =
    slideShowIndex === 0
      ? [
          { url: userImageProfile },
          { url: userImage1 },
          { url: userImage2 },
          { url: userImage3 },
        ]
      : slideShowIndex === 1
      ? [
          { url: userImage1 },
          { url: userImage2 },
          { url: userImage3 },
          { url: userImageProfile },
        ]
      : slideShowIndex === 2
      ? [
          { url: userImage2 },
          { url: userImage3 },
          { url: userImageProfile },
          { url: userImage1 },
        ]
      : [
          { url: userImage3 },
          { url: userImageProfile },
          { url: userImage1 },
          { url: userImage2 },
        ];

  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 50}`;
  };

  const containerStyles = {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, 0%)",
    maxWidth: "40%",
    height: "100vh",
  };

  console.log("userDetail", userDetail);

  const [isTouchHover, setIsTouchHover] = useState({});

  const handleTouchStart = (touchIndex) => {
    setIsTouchHover({
      ...isTouchHover,
      [touchIndex]: true,
    });
  };

  const handleTouchEnd = (touchIndex) => {
    setIsTouchHover({
      ...isTouchHover,
      [touchIndex]: false,
    });
  };

  const requestProfileBackHref =
    showRequestBackButton && !viewFullPage
      ? {
          pathname: "/messages",
          query: {
            openRequests: "1",
            source: "message-request",
            userName: router?.query?.userName,
            ...(requestReturnId ? { requestId: requestReturnId } : {}),
          },
        }
      : null;

  const persistRequestProfileReturnState = () => {
    if (typeof window === "undefined" || !showRequestBackButton) {
      return;
    }

    window.sessionStorage.setItem(
      REQUESTS_RETURN_STATE_KEY,
      JSON.stringify({
        source: "messages-requests",
        requestId: router?.query?.requestId || requestReturnId || null,
        roomId: router?.query?.roomId || requestReturnId || null,
        reopenModal: true,
      })
    );
  };

  const handleProfileBack = async () => {
    if (viewFullPage) {
      setViewFullPage(false);
      return;
    }

    if (!showRequestBackButton || profileBackLoading) {
      return;
    }

    setProfileBackLoading(true);
    persistRequestProfileReturnState();

    try {
      await router.prefetch("/messages");
      await new Promise((resolve) => setTimeout(resolve, 450));
    } catch (error) {
      console.log("Failed to prefetch messages before profile back", error);
    }

    router.replace(requestProfileBackHref || "/messages").catch(() => {
      setProfileBackLoading(false);
    });
  };

  const photoViewerOverlay = viewFullPage ? (
    <div className="overlay" onClick={() => setViewFullPage(false)}>
      <div
        className="photo-viewer-header"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="photo-viewer-back-btn"
          onClick={() => setViewFullPage(false)}
          aria-label="Back to profile"
        >
          <BiChevronLeft size={28} color="#ffffff" />
        </button>
      </div>
      <div
        className="overlay-content"
        onClick={(event) => event.stopPropagation()}
      >
        <ImageSlider slides={slides} viewFullPage={viewFullPage} />
      </div>
    </div>
  ) : null;

  useEffect(() => {
    if (
      isRequestEmbed &&
      !shouldShowProfileSkeleton &&
      typeof window !== "undefined" &&
      window.parent &&
      window.parent !== window
    ) {
      window.parent.postMessage(
        {
          type: "request-profile-ready",
          userName: viewedUserName,
        },
        window.location.origin
      );
    }
  }, [isRequestEmbed, shouldShowProfileSkeleton, viewedUserName]);

  if (shouldShowProfileSkeleton) {
    if (
      isViewingExternalProfile &&
      !preview &&
      !showRequestBackButton &&
      !isRequestEmbed
    ) {
      return <Loader />;
    }

    return (
      <SkeletonUserProfile
        preview={preview}
        showBackButton={showRequestBackButton || viewFullPage}
        hideRightNav={showRequestBackButton || viewFullPage}
        hideLogo={viewFullPage}
        onBack={viewFullPage || showRequestBackButton ? handleProfileBack : null}
        backHref={requestProfileBackHref}
        isBackLoading={profileBackLoading}
      />
    );
  } else {
    return (
      <>
        <PaywallModal
          isOpen={paywallConfig.isOpen}
          onClose={closePaywall}
          type={paywallConfig.type}
          expiresIn={paywallConfig.expiresIn}
          userName={paywallConfig.userName}
          pricingConfig={pricingConfig}
        />
        <div className="inner-page">
          {!preview && !isRequestEmbed && (
            <HeaderLoggedIn
              fixed={width < 767}
              count={count}
              setCount={setCount}
              unReadedConversationLength={unReadedConversationLength}
              showBackButton={showRequestBackButton || viewFullPage}
              hideRightNav={showRequestBackButton || viewFullPage}
              hideLogo={viewFullPage}
              onBack={viewFullPage || showRequestBackButton ? handleProfileBack : null}
              backHref={requestProfileBackHref}
              isBackLoading={profileBackLoading}
            />
          )}
        {photoViewerOverlay}
        <div className="inner-part-page">
          <div
            className={`top-spase pb-0 pt-5-lg-4 pb-5-lg-4 ${
              preview ? "space-top" : ""
            }`}
          >
            <div className="container user_profile_page">
              <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                  <div className="row pt-2 pt-md-5">
                    <div className="col-xl-4 col-lg-5 col-md-12 col-12">
                      {width > 991 && (
                        <figure className="user_img_profile">
                          <div className="big-image">
                            <label>
                              <div className="pos-relative">
                                <Image
                                  src={userImageProfile}
                                  loader={myLoader}
                                  priority={true}
                                  alt="user image"
                                  width={270}
                                  height={checkIpad ? 300 : 270}
                                  onClick={() => {
                                    setViewFullPage(true);
                                    setSlideShowIndex(0);
                                  }}
                                />

                                {documentVerified && (
                                  <span className="verified_check_tag">
                                    <HiBadgeCheck color={"white"} size={20} />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </label>
                          </div>
                        </figure>
                      )}
                    </div>
                    <div className="col-xl-8 col-lg-7 col-md-12 col-12 padd0-responsive">
                      <div className="userdetails resposnive-data-profile">
                        <h4>
                          {formatDisplayName(userDetail?.user_name || user?.user_name)},{" "}
                          <span>{userDetail?.age || user?.age}</span>
                        </h4>

                        {width < 991 && (
                          <div className="text-center">
                            <svg
                              className="left-space"
                              width="60"
                              height="2"
                              viewBox="0 0 95 2"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.110596 1.36728H94.3167"
                                stroke="url(#paint0_linear)"
                              ></path>
                              <defs>
                                <linearGradient
                                  id="paint0_linear"
                                  x1="105.948"
                                  y1="-1.61543"
                                  x2="8.2769"
                                  y2="-1.61543"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop
                                    stop-color="#FA789B"
                                    stop-opacity="0.01"
                                  ></stop>
                                  <stop
                                    offset="0.489981"
                                    stop-color="#F02D4E"
                                  ></stop>
                                  <stop
                                    offset="1"
                                    stop-color="#F24362"
                                    stop-opacity="0.01"
                                  ></stop>
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        )}
                        <div className="selct-wrap-sort mx-3">
                          <span className="city-txt">
                            {formatDisplayLocation(
                              userDetail?.location || user?.location,
                              userDetail?.province || user?.province
                            )}
                          </span>
                        </div>
                        <div className="user-images-wrap mt-3 mt-lg-4 user_img_profile">
                          <figure className="user_img_profile show-responsive_div pt-2 pt-lg-3">
                            <div className="big-image">
                              <label>
                                <>
                                  <div className="pos-relative">
                                    {/* <img
                                      src={
                                        // userDetail?.images
                                        //   ? userDetail?.images[0]
                                        //   : user?.images && user?.images[0]
                                        userImageProfile
                                      }
                                      alt="user image"
                                      width="350"
                                      height="350"
                                    /> */}
                                    <Image
                                      src={userImageProfile}
                                      loader={myLoader}
                                      priority={true}
                                      alt="user image"
                                      width={350}
                                      height={350}
                                      onClick={() => {
                                        setViewFullPage(true);
                                        setSlideShowIndex(0);
                                      }}
                                    />
                                    {/* <ImageShow
                                      alt="user image"
                                      width={350}
                                      height={350}
                                      src={userImageProfile}
                                    /> */}
                                    {user?.documents_verified && (
                                      <span className="verified_check_tag">
                                        <HiBadgeCheck
                                          color={"white"}
                                          size={20}
                                        />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </>
                              </label>
                            </div>
                          </figure>
                          {width > 991 && <SubHeading title="Photos" />}
                          <div className="image_wrap_slider pt-3 pb-4">
                            <figure>
                              <Image
                                src={userImage1}
                                loader={myLoader}
                                loading="lazy"
                                alt="user image"
                                width={160}
                                height={150}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(1);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage1}
                              /> */}
                            </figure>
                            <figure>
                              <Image
                                src={userImage2}
                                loader={myLoader}
                                loading="lazy"
                                alt="user image"
                                width={160}
                                height={150}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(2);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage2}
                              /> */}
                            </figure>
                            <figure>
                              <Image
                                src={userImage3}
                                loader={myLoader}
                                loading="lazy"
                                alt="user image"
                                width={160}
                                height={150}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(3);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage3}
                              /> */}
                            </figure>
                          </div>
                          <>
                            <h4 className="mb-5 mt-4 text-center tagline-font  word-break: break-word">
                              “{userTagline}”
                              {/* { userDetail?.tagline || user?.tagline } */}
                            </h4>

                            {!preview &&
                              // user?.gender === "female" &&
                              ((router?.query?.userName &&
                                userDetail?.gender === "female") ||
                                (router?.pathname === "/user/user-profile" &&
                                  user?.gender === "female")) && (
                                <>
                                  <SubHeading title="Available Experiences" />
                                  <div className="verification_card_header text-center mb-5 mt-4">
                                    <div
                                      className={
                                        userDates?.length > 0 &&
                                        userDates.filter((item) => isActiveDate(item))
                                          ?.length === 1
                                          ? "available-dates-box1"
                                          : "available-dates-box"
                                      }
                                    >
                                      {/* {userDates.length > 0 && page > 1 && (
                                      <div
                                        className="pagination-wrapper"
                                        onClick={prevPage}
                                      >
                                        <AiOutlineLeft className="pagination-icon" />
                                      </div>
                                    )} */}
                                      {loading ? (
                                        <div className="w-100 d-flex justify-content-center align-items-center">
                                          <span className="date-spin-loader-button"></span>
                                        </div>
                                      ) : userDates?.length > 0 &&
                                        userDates.filter((item) => isActiveDate(item))
                                          ?.length > 0 ? (
                                        [...userDates]
                                          .filter((item) => isActiveDate(item))
                                          .sort(
                                            (left, right) =>
                                              new Date(
                                                right?.created_at ||
                                                  right?.updated_at ||
                                                  0
                                              ).getTime() -
                                              new Date(
                                                left?.created_at ||
                                                  left?.updated_at ||
                                                  0
                                              ).getTime()
                                          )
                                          .map((date, touchIndex) => {
                                            const category = getDateCategory(date);
                                            return (
                                              <div
                                                key={date?._id || touchIndex}
                                                className={`availabe_card_inner ${
                                                  isTouchHover[touchIndex]
                                                    ? "hover"
                                                    : ""
                                                }`}
                                                onClick={() => {
                                                  if (
                                                    !router?.query?.userName ||
                                                    router?.query?.userName ===
                                                      user?.user_name ||
                                                    user?.gender === "male"
                                                  ) {
                                                    setSelectedDate(date);
                                                    dateModalIsOpen();
                                                  } else {
                                                    if (
                                                      user?.gender === "female"
                                                    ) {
                                                      setLadiesShow(true);
                                                    }
                                                  }
                                                }}
                                                onTouchStart={() =>
                                                  handleTouchStart(touchIndex)
                                                }
                                                onTouchEnd={() =>
                                                  handleTouchEnd(touchIndex)
                                                }
                                              >
                                                <ul className="date_list">
                                                  <li>
                                                    <span
                                                      className="icon_wrap"
                                                      style={{
                                                        height: "40px",
                                                        width: "40px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: category ? "transparent" : "rgba(255,255,255,0.1)",
                                                        borderRadius: "8px"
                                                      }}
                                                    >
                                                      {category?.icon || (
                                                        <span style={{ fontSize: "20px" }}>📅</span>
                                                      )}
                                                    </span>
                                                    <p
                                                      style={{
                                                        fontFamily: "Helvetica",
                                                        fontSize: "14px",
                                                        fontWeight: "300",
                                                        letterSpacing: "0.06px",
                                                        whiteSpace: "pre-wrap",
                                                        width: "6rem",
                                                        color: category ? "#fff" : "#888"
                                                      }}
                                                    >
                                                      {category?.label ||
                                                        getDateExperienceLabel(date) ||
                                                        "Experience"}
                                                    </p>
                                                  </li>
                                                  <span className="top-card_tag">
                                                    <span className="top-badge"></span>
                                                    <div className="price-card-name">
                                                      <span className="date-price-card">
                                                        ${date?.price}
                                                      </span>
                                                    </div>
                                                  </span>
                                                </ul>
                                              </div>
                                            );
                                          })
                                      ) : null}
                                      {/* {userDates.length > 0 &&
                                      pagination?.total_pages > page && (
                                        <div
                                          className="pagination-wrapper p-0"
                                          onClick={nextPage}
                                        >
                                          <AiOutlineRight
                                            className="pagination-icon"
                                            onClick={nextPage}
                                          />
                                        </div>
                                      )} */}
                                    </div>
                                    {(router?.query?.userName ===
                                      user?.user_name ||
                                      router?.pathname ===
                                        "/user/user-profile") &&
                                      canCreateNewDate &&
                                      (!userDates?.length ? (
                                        <div className="d-flex flex-column justify-content-center align-items-center header_btn_wrap w-100 date-block-section">
                                          <CreateDatePrimaryButton
                                            onClick={handleCreateDateClick}
                                            className={
                                              width > 1024
                                                ? "create-date w-50"
                                                : "create-date w-75"
                                            }
                                            style={{
                                              height: "50px",
                                              fontSize: "16px",
                                              fontWeight: "400",
                                              letterSpacing: "0.06px",
                                              //paddingTop: "5px",
                                              margin: "0px auto",
                                              marginTop: "10px",
                                            }}
                                          >
                                            Create New Date
                                          </CreateDatePrimaryButton>
                                          <p className="date-text-1">
                                            Your dates are stored here
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="d-flex align-items-center mb-0 mt-4 header_btn_wrap w-100 justify-content-center">
                                          <CreateDatePrimaryButton
                                            onClick={handleCreateDateClick}
                                            className={
                                              width > 1024
                                                ? "create-date w-50"
                                                : "create-date w-75"
                                            }
                                            style={{
                                              height: "50px",
                                              fontSize: "14px",
                                              fontWeight: "400",
                                            }}
                                          >
                                            Create New Date
                                          </CreateDatePrimaryButton>
                                        </div>
                                      ))}

                                    <Modal
                                      isOpen={dateModalOpen}
                                      onRequestClose={dateCloseModal}
                                      // style= {customStyles}
                                      className="date-selected-modal"
                                      overlayClassName="date-selected-overlay"
                                      bodyOpenClassName=""
                                      shouldCloseOnOverlayClick={
                                        isMaleViewingFemaleProfile
                                      }
                                      shouldCloseOnEsc={false}
                                      shouldFocusAfterRender={false}
                                      shouldReturnFocusAfterClose={false}
                                    >
                                      {messageLoading ? (
                                        <div className="user-message-loader">
                                          <Image
                                            src={"/assets/squareLogoNoBack.gif"}
                                            alt="loading..."
                                            className=""
                                            width={100}
                                            height={100}
                                          />
                                        </div>
                                      ) : (
                                        <>
                                          <div className="model_content verification_card_header mb-3">
                                            <SubHeading title="Available Experiences" />
                                            <div className="availabe_card_inner date_border_red">
                                              <ul className="date_list">
                                                {selectedDate ? (
                                                  <>
                                                    <li>
                                                      <span className="icon_wrap">
                                                        {
                                                          selectedDateCategory?.icon
                                                        }
                                                      </span>
                                                      <p>
                                                        {
                                                          selectedDateCategory?.label
                                                        }
                                                      </p>
                                                    </li>
                                                    {/* <span className="top-card_tag">
                                                <span className="top-badge"></span>{" "}
                                                ${selectedDate?.price}
                                              </span>
                                              <span className="bottom_price_tag">
                                                <h2>
                                                  <sup>H</sup>{" "}
                                                  {selectedDate?.date_length.replace(
                                                    "H",
                                                    ""
                                                  )}
                                                </h2>
                                              </span> */}
                                                    <span className="top-card_tag">
                                                      <span className="top-badge"></span>
                                                      <div className="price-card-name">
                                                        <span>
                                                          ${selectedDate?.price}
                                                        </span>
                                                        <span className="hour">
                                                          <span>
                                                            {formatDuration(
                                                              selectedDate?.date_length
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </span>
                                                  </>
                                                ) : null}
                                              </ul>
                                            </div>
                                          </div>
                                          {user?.gender === "male" ? (
                                            <div className="date_details_desktop mt-4 pt-4">
                                              {alreadyMessaged ? (
                                                <div className="user-message-loader already-messaged">
                                                  Already Requested
                                                </div>
                                              ) : (
                                                <div className="verification_card_header">
                                                  <div className="">
                                                    <h4
                                                      style={{
                                                        fontWeight: "700",
                                                        letterSpacing:
                                                          "0.066px",
                                                      }}
                                                    >
                                                      Date Details
                                                    </h4>
                                                    <p
                                                      style={{
                                                        fontWeight: "300",
                                                        letterSpacing: "0.06px",
                                                        paddingTop: "1.1rem",
                                                      }}
                                                    >
                                                      {
                                                        selectedDate?.date_details
                                                      }
                                                    </p>
                                                  </div>
                                                  {/* <div className=""> */}
                                                  <MessageModal
                                                    date={selectedDate}
                                                    user={user}
                                                    userMessageNoModal={true}
                                                    showSuperInterested={
                                                      isMaleViewingFemaleProfile
                                                    }
                                                    close={() =>
                                                      dateSetIsOpen(false)
                                                    }
                                                  />
                                                  {/* </div> */}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="model_content verification_card_header">
                                              <div className="availabe_card_inner px-4">
                                                <ul className="date_action_model">
                                                  <li
                                                    onMouseDown={(event) =>
                                                      event.preventDefault()
                                                    }
                                                    onClick={dateCloseModal}
                                                  >
                                                    <BiChevronLeft
                                                      size={25}
                                                      color={"white"}
                                                    />
                                                    <span>Go back</span>
                                                  </li>
                                                  <li onClick={editDate}>
                                                    <BiEditAlt
                                                      size={20}
                                                      color={"white"}
                                                    />
                                                    <span>Edit</span>
                                                  </li>
                                                  <li onClick={deleteDate}>
                                                    <BiTrashAlt
                                                      size={20}
                                                      color={"white"}
                                                    />
                                                    <span>Delete</span>
                                                  </li>
                                                </ul>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </Modal>
                                    {ladiesShow && (
                                      <div className="already-messaged">
                                        Ladies are not able to request dates
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                          </>
                          <SubHeading title="About me" />
                          <div className="image_wrap_slider about_me_card">
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {userDetail?.body_type || user?.body_type}
                                </H5>
                                <p>Body Type</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                {displayEducation?.length > 15 ? (
                                  <h5
                                    className="education-font-1"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {displayEducation}
                                  </h5>
                                ) : (
                                  <h5
                                    className="education-font"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {displayEducation}
                                  </h5>
                                )}
                                <p>Education </p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {convertToFeet(displayHeight)}
                                </H5>
                                <p>Height</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {displaySmoker}
                                </H5>
                                <p>Smoker</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {userDetail?.ethnicity || user?.ethnicity}
                                </H5>
                                <p>Ethnicity</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                {displayOccupation?.length > 15 ? (
                                  <h5
                                    className="administrat-font-1"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {displayOccupation}
                                  </h5>
                                ) : (
                                  <h5
                                    className="administrat-font"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {displayOccupation}
                                  </h5>
                                )}
                                <p>Occupation </p>
                              </div>
                            </div>
                          </div>
                          <div className="more_content pt-3">
                            <div className="text-left-more">
                              <h6 className=" text-left-more more-about">
                                More about{" "}
                                <span>
                                  {formatDisplayName(userDetail?.user_name || user?.user_name)}
                                </span>
                              </h6>
                              <svg
                                className="d-none"
                                width="60"
                                height="2"
                                viewBox="0 0 95 2"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.110596 1.36728H94.3167"
                                  stroke="url(#paint0_linear)"
                                ></path>
                                <defs>
                                  <linearGradient
                                    id="paint0_linear"
                                    x1="105.948"
                                    y1="-1.61543"
                                    x2="8.2769"
                                    y2="-1.61543"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop
                                      stop-color="#FA789B"
                                      stop-opacity="0.01"
                                    ></stop>
                                    <stop
                                      offset="0.489981"
                                      stop-color="#F02D4E"
                                    ></stop>
                                    <stop
                                      offset="1"
                                      stop-color="#F24362"
                                      stop-opacity="0.01"
                                    ></stop>
                                  </linearGradient>
                                </defs>
                              </svg>
                              <p className="">
                                {userDescription}
                                {/* {user?.description} */}
                              </p>
                              {preview && (
                                <div className="button-wrapper profile-btn">
                                  <button
                                    type="button"
                                    className="edit"
                                    onClick={editHandle}
                                  >
                                    <a>Edit</a>
                                  </button>
                                  <button className="next" onClick={onSubmit}>
                                    {loading ? (
                                      <span className="spin-loader-button"></span>
                                    ) : (
                                      "Finish"
                                    )}
                                  </button>
                                </div>
                              )}
                              <div className="member-since">
                                <p>
                                  Member since{" "}
                                  {moment(
                                    userDetail?.created_at || user?.created_at
                                  ).format("MMM YYYY")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }
}

export default reduxForm({
  form: "UserProfile", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(UserProfile);
