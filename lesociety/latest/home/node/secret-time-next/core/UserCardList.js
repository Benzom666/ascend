import React, { useRef, useState, useEffect, useMemo } from "react";
const UserImg = "/assets/img/profile.png";
const UserImg3 = "/assets/img/user-3.png";
const UserImg4 = "/assets/img/user-4.png";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { formatDisplayLocation, formatDisplayName, formatDisplayText } from "utils/formatDisplayText";
import { formatDateDuration } from "utils/dateDuration";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
import H5 from "./H5";
import { apiRequest, getDateCategory } from "utils/Utilities";
import { IoIosClose } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { HiLockOpen } from "react-icons/hi";
import { useRouter } from "next/router";
const userImageMain = "/assets/img/user2.jpg";
import ImageShow from "@/modules/ImageShow";
import MessageModal from "./MessageModal";
import { logout } from "@/modules/auth/authActions";
const verifiedIcon = "/assets/Group 6.png";
import { HiBadgeCheck } from "react-icons/hi";
const StarIcon = "/assets/star1.svg";
const ShowLessIcon = "/assets/show-less-icon.png";

const UserCardList = ({
  date,
  cardId,
  growDiv,
  dateId,
  setDateId,
  openPopup,
  closePopup,
  isDesktopView,
  ref,
  loading,
  setLoader,
  alreadyMessagedFromUser,
  receiverData,
  setAlreadyMessagedFromUser,
  width,
  cardIndex = 0, // NEW: Track card position for priority loading
  restoreOpenDateId = "",
}) => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [dateDetailsIsOpen, setDateDetailsIsOpen] = React.useState(false);
  const [dateMobileDetailsIsOpen, setMobileDateDetailsIsOpen] =
    React.useState(false);
  const [loader, setLoading] = useState(true);
  const [msgModal, setMsgModal] = React.useState(false);
  const [alreadyMessaged, setAlreadyMessaged] = useState(false);
  const [hasAcceptedChat, setHasAcceptedChat] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [isCardImageLoaded, setIsCardImageLoaded] = useState(false);
  const [isClosingAfterMessage, setIsClosingAfterMessage] = useState(false);
  const loadTimeoutRef = useRef(null);
  const closeAfterMessageTimerRef = useRef(null);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const growRef = useRef(null);

  const isIPad =
    typeof navigator !== "undefined" && /iPad/.test(navigator.userAgent);

  const dispatch = useDispatch();

  const [mobileLoader, setMobileLoading] = useState(false);
  const shouldRestoreOpenCard =
    Boolean(restoreOpenDateId) && restoreOpenDateId === date?._id;

  const handleMessageModal = () => {
    setMessageModal(!messageModal);
    // setDateDetailsIsOpen(false);
  };

  function openModal() {
    setIsOpen(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "auto" })
      );
    }
  }
  function closeModal() {
    setIsOpen(false);
  }

  // CRITICAL FIX: Safe user data extraction with fallbacks
  const userData = useMemo(() => {
    return Array.isArray(date?.user_data) && date.user_data.length > 0
      ? date.user_data[0]
      : null;
  }, [date?.user_data]);

  const category = getDateCategory(date);
  const displayAspiration = formatDisplayText(
    userData?.aspirationName ||
      userData?.occupation ||
      date?.aspirationName ||
      date?.user?.aspirationName ||
      ""
  );

  useEffect(() => {
    if (
      (dateDetailsIsOpen || dateMobileDetailsIsOpen) &&
      user?.gender === "male"
    ) {
      setLoading(true);

      setMobileLoading(true);
      checkMessage();
    }
  }, [dateDetailsIsOpen, dateMobileDetailsIsOpen]);

  useEffect(() => {
    if (!shouldRestoreOpenCard) {
      return;
    }

    if (isDesktopView) {
      setDateDetailsIsOpen(true);
      return;
    }

    setMobileDateDetailsIsOpen(true);
    setDateId?.(cardId);
  }, [cardId, isDesktopView, setDateId, shouldRestoreOpenCard]);

  const checkMessage = async () => {
    try {
      // CRITICAL FIX: Use memoized userData
      if (!userData?._id) {
        setLoading(false);
        setMobileLoading(false);
        return;
      }
      
      const data = {
        recieverId: userData._id,
        dateId: date?._id ?? "",
      };
      const res = await apiRequest({
        params: data,
        method: "GET",
        url: `chat/exist`,
      });
      const room = res?.data?.data?.chatRoom;
      const roomStatus = room?.status;
      const isExpiredPending =
        roomStatus === 0 &&
        room?.expires_at &&
        new Date(room.expires_at).getTime() <= Date.now();
      const isRejectedStatus = roomStatus === 3;
      const isExpiredStatus = roomStatus === 4;
      const isAccepted = roomStatus === 1 || roomStatus === 2;
      setAlreadyMessaged(
        Boolean(
          res?.data?.message &&
            room &&
            !isExpiredPending &&
            !isRejectedStatus &&
            !isExpiredStatus
        )
      );
      setHasAcceptedChat(Boolean(res?.data?.message && room && isAccepted));
      setLoading(false);
      setMobileLoading(false);
    } catch (err) {
      setMobileLoading(false);
      setLoading(false);
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

  async function growDiv(id) {
    // Only close popup if msgModal is open - avoids unnecessary scroll operations on iOS
    if (msgModal) {
      setMsgModal(false);
    }

    let growDiv = document.getElementById(id);
    if (growDiv?.clientHeight) {
      growDiv.style.height = 0;
    } else {
      growDiv.style.height = growRef.current.clientHeight + "px";
    }
  }

  // destroy above growDiv
  const destroyGrowDiv = (id) => {
    let growDiv = document.getElementById(id);
    growDiv.style.height = 0;
  };

  const toggle = () => {
    // Only call closePopup if modal is actually open to avoid unnecessary scroll restoration on iOS
    if (msgModal) {
      setMsgModal(false);
    }
    setDateDetailsIsOpen(!dateDetailsIsOpen);
  };
  const toggleMsgModal = () => setMsgModal(!msgModal);

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
  };
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.92)",
      zIndex: 1000,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "16px",
      paddingBottom: "16px",
    },
    content: {
      top: "0",
      left: "auto",
      right: "auto",
      bottom: "auto",
      marginRight: "0",
      transform: "none",
      width: "310px",
      background: "transparent",
      height: "auto",
      maxHeight: "calc(100vh - 32px)",
      inset: "auto",
      overflow: "auto",
    },
  };

  const messagedFromUserDone =
    alreadyMessagedFromUser && receiverData?._id === date?._id ? true : false;
  const shouldHideMessageAction =
    user?.gender === "male" &&
    (alreadyMessaged ||
      (messagedFromUserDone && !isClosingAfterMessage) ||
      hasAcceptedChat);

  useEffect(() => {
    if (messagedFromUserDone) {
      setIsClosingAfterMessage(true);
      if (closeAfterMessageTimerRef.current) {
        clearTimeout(closeAfterMessageTimerRef.current);
      }
      closeAfterMessageTimerRef.current = setTimeout(() => {
        setIsClosingAfterMessage(false);
        closeAfterMessageTimerRef.current = null;
      }, 1100);

      if (isDesktopView) {
        setDateDetailsIsOpen(false);
        setMsgModal(false);
        return;
      }

      if (dateMobileDetailsIsOpen) {
        growDiv(cardId);
      }
      setDateDetailsIsOpen(false);
      setMobileDateDetailsIsOpen(false);
      setMsgModal(false);
    }
  }, [cardId, dateMobileDetailsIsOpen, isDesktopView, messagedFromUserDone]);

  useEffect(() => {
    return () => {
      if (closeAfterMessageTimerRef.current) {
        clearTimeout(closeAfterMessageTimerRef.current);
      }
    };
  }, []);

  const myLoader = ({ src, width, quality }) => {
    // Supabase doesn't support query params for resizing
    // Return the original URL directly for external CDN images
    if (src?.includes?.('supabase.co')) {
      return src;
    }
    return `${src}?w=${width}&q=${quality || 70}`;
  };

  const resolveImageValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.url || value.location || "";
    }
    return "";
  };

  const resolvedDateImage = useMemo(() => {
    // CRITICAL FIX: Safe image resolution with userData memoization
    if (!userData) return UserImg;
    
    const imageIndex = Number.isFinite(Number(date?.image_index))
      ? Number(date.image_index)
      : 0;
    const rawImages = Array.isArray(userData?.images)
      ? userData.images
      : [];
    const normalizedImages = rawImages
      .map((entry) => resolveImageValue(entry))
      .filter(Boolean);
    return normalizedImages[imageIndex] || normalizedImages[0] || UserImg;
  }, [date?.image_index, userData, date?._id]);

  const desktopCardImage = (
    <div
      className={`date-card-image-shell ${
        isCardImageLoaded ? "is-loaded" : ""
      }`}
    >
      <Image
        src={resolvedDateImage}
        alt="user image"
        width={500}
        height={500}
        unoptimized={false}
        loading={cardIndex < 2 ? "eager" : "lazy"}
        priority={cardIndex < 2}
        quality={cardIndex < 3 ? 60 : 50}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`date-card-image ${
          isCardImageLoaded ? "is-visible" : "is-hidden"
        }`}
        onLoad={() => {
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          setIsCardImageLoaded(true);
        }}
        onError={() => {
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          setIsCardImageLoaded(true);
        }}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzIyMiIvPjwvc3ZnPg=="
      />
    </div>
  );

  useEffect(() => {
    setIsCardImageLoaded(false);
    
    // SPEED OPTIMIZATION: Faster timeout for first 3 cards (priority loading)
    // Mobile optimization: Force image visible even if onLoad doesn't fire
    // iOS Safari sometimes doesn't trigger onLoad for cached images
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    const timeoutDuration = cardIndex < 3 ? 1000 : 2000; // First 3 cards: 1s, rest: 2s
    
    loadTimeoutRef.current = setTimeout(() => {
      setIsCardImageLoaded(true);
    }, timeoutDuration);
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [resolvedDateImage, cardIndex]);

  // const onLoad = useCallback(() => {
  //   setSrc(src);
  // }, [src]);

  // CRITICAL FIX: Don't render cards with missing user data
  if (!userData) {
    console.warn('[UserCardList] Date card skipped - missing user_data:', date?._id, 'user_name:', date?.user_name);
    return null;
  }
  
  // DEBUG: Log successful renders
  if (typeof window !== 'undefined' && Math.random() < 0.1) {
    console.log('[UserCardList] Rendering card:', date?._id, date?.location, userData?._id ? 'has user' : 'NO USER');
  }

  return (
    <div
      style={{
        position: "relative",
      }}
    >
        {userData?.documents_verified && !dateDetailsIsOpen && (
            <div
              class="gallery_verified_icon"
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                zIndex: "1",
              }}
            >
              <HiBadgeCheck color={"white"} size={25} />
            </div>
          )}

        {isDesktopView ? (
          <div className="date_card_wrap desktop_date_card_wrap" ref={ref}>
            <div className="desktop_date_card_shell">
              <figure
                className={`user_img_date desktop_user_img_date ${
                  dateDetailsIsOpen ? "is-expanded" : ""
                }`}
                onClick={toggle}
              >
                {desktopCardImage}
                <div className="user-details desktop_user_details">
                  <div className="user-info-left">
                    <div className="user-top-sec">
                      <h5 className="">
                        <span>
                          {formatDisplayName(date?.user_name)}{" "}
                          <span className="user_age">{userData?.age || "-"}</span>
                        </span>
                      </h5>
                    </div>
                    <div className="user_location">
                      <span className="address-wrap">
                        <span className="address px-1">
                          {formatDisplayLocation(date?.location, date?.province)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="tag_wrap">
                    <ul>
                      <li style={{ display: "flex", alignItems: "center" }}>
                        <span>{category?.icon}</span>
                        <span className="labelofCard-2">
                          {category?.label}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </figure>

              <div
                className={`desktop_date_card_footer ${
                  dateDetailsIsOpen ? "is-expanded" : ""
                }`}
                onClick={toggle}
              >
                <span className="user__aspiration1">{displayAspiration}</span>
                <span className="user__aspiration2">ASPIRING</span>
              </div>

              <div
                className={`date_details_desktop desktop_dropdown_panel ${
                  dateDetailsIsOpen ? "is-open" : ""
                }`}
              >
                <div className="date_details_desktop_inner">
                  {loader && user?.gender === "male" && dateDetailsIsOpen ? (
                    <div className="date_details_desktop_loading_inline">
                      <Image
                        src={"/assets/squareLogoNoBack.gif"}
                        alt="loading..."
                        width={72}
                        height={72}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="date_details_desktop_content">
                        <h4>DATE DETAILS</h4>
                        <div className="date__detail__time__frame">
                          <span className="time__frame">Time Frame:</span>
                          <span className="time__value">
                            {" "}
                            {formatDateDuration(date?.date_length) || "N/A"}
                          </span>
                        </div>
                        <div className="interested__only">
                          <span className="interested__span1">Interested?</span>
                          <span className="interested__span2">
                            Take her out on her choice of date experience.
                          </span>
                        </div>
                        <div className="super__interested__div">
                          <Image src={StarIcon} height={15} width={15} alt="" />
                          <span className="super__interested">
                            Super Interested?
                          </span>
                        </div>
                        <div className="support__aspirations__div">
                          <span className="support__aspirations">
                            Support Her Aspirations:
                          </span>
                          <span className="support__price">
                            {" "}
                            US${date?.price || "0"}
                          </span>
                        </div>
                        <div className="suggested__gift">(Suggested Gift)</div>
                        <div className="date__description__desktop">
                          <div
                            style={{
                              fontWeight: "300",
                              letterSpacing: "0.06px",
                              fontSize:
                                (date?.date_details?.length || 0) <= 350
                                  ? "14px"
                                  : "12px",
                            }}
                          >
                            {date?.date_details || "No description available"}
                          </div>
                        </div>
                        <div className="button-wrapper date_details_actions">
                          {user?.gender === "male" && !shouldHideMessageAction && (
                            <MessageModal
                              date={date}
                              user={user}
                              alreadyMessaged={alreadyMessaged}
                              receiverData={receiverData}
                              closePopup={closePopup}
                              toggle={toggle}
                            />
                          )}
                          <button
                            type="button"
                            className="edit view__profile__btn"
                            onClick={() =>
                              router.push(`/user/user-profile/${date?.user_name}`)
                            }
                          >
                            {isIPad ? "Profile" : "View Profile"}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={toggle}
                          className="desktop_show_less"
                        >
                          <Image src={ShowLessIcon} height={10} width={10} alt="" />
                          <span>Show Less</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="date_card_wrap mobile_date_card_wrap" ref={ref}>
          <figure
            className="user_img_date mobile_user_img_date"
            onClick={() => {
              growDiv(cardId);
              setMobileDateDetailsIsOpen(!dateMobileDetailsIsOpen);
              setAlreadyMessagedFromUser(false);
            }}
          >
            {desktopCardImage}
            <div className="user-details mobile_user_details">
              <div className="user-info-left">
                <div className="user-top-sec">
                  <h5 className="">
                    <span>
                      {formatDisplayName(date?.user_name)}{" "}
                      <span className="user_age">{userData?.age || "-"}</span>
                    </span>
                  </h5>
                </div>
                <div className="user_location">
                  <span className="address-wrap">
                    <span className="address px-1">
                      {formatDisplayLocation(date?.location, date?.province)}
                    </span>
                  </span>
                </div>
              </div>
              <div className="tag_wrap">
                <ul>
                  <li style={{ display: "flex", alignItems: "center" }}>
                    <span>{category?.icon}</span>
                    <span className="labelofCard-2">{category?.label}</span>
                  </li>
                </ul>
              </div>
            </div>
          </figure>

          <div
            className={`mobile_date_card_footer ${
              dateMobileDetailsIsOpen ? "is-expanded" : ""
            }`}
            onClick={() => {
              growDiv(cardId);
              setMobileDateDetailsIsOpen(!dateMobileDetailsIsOpen);
              setAlreadyMessagedFromUser(false);
            }}
          >
            <span className="user__aspiration1">{displayAspiration}</span>
            <span className="user__aspiration2">ASPIRING</span>
          </div>

          {msgModal ? (
              <div>
                <div id="message-popup" className={`message-popup`}>
                  <span onClick={toggle} className="close-button">
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
                    “If you’re not amazed by the stars then we can’t hang”
                  </p>
                  <div>
                    <input className="" placeholder="Type your message here…" />
                    <svg
                      onClick={toggleMsgModal}
                      className="icon-move-1"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.6048 0.407386C13.2546 0.0480202 12.7364 -0.0858618 12.2532 0.0550622L0.9856 3.33166C0.47579 3.4733 0.114443 3.87988 0.0171013 4.39639C-0.0823407 4.92205 0.265006 5.58935 0.718788 5.86838L4.24193 8.03376C4.60328 8.25573 5.06967 8.20008 5.36869 7.89845L9.40303 3.83901C9.6061 3.62762 9.94224 3.62762 10.1454 3.83901C10.3484 4.04336 10.3484 4.37455 10.1454 4.58594L6.104 8.64612C5.80426 8.94698 5.74826 9.41556 5.96883 9.77914L8.12154 13.3377C8.37361 13.7604 8.80782 14 9.28396 14C9.34003 14 9.40303 14 9.4591 13.9929C10.0053 13.9225 10.4395 13.5491 10.6005 13.0206L13.9409 1.76735C14.088 1.2882 13.9549 0.766759 13.6048 0.407386Z"
                        fill="#686868"
                      />
                    </svg>
                  </div>
                  <p className="tip">Tip: Maybe mention why you’re here.</p>
                </div>
              </div>
            ) : null}
          {!isDesktopView && (
            <div style={dateId !== cardId ? { height: 0 } : {}} id={cardId}>
              <div ref={growRef} className="date_details">
                {/* {
                mobileLoader ? (
                  <div className="">
                    <div className="d-flex justify-content-center">
                      <Image
                        src={"/assets/squareLogoNoBack.gif"}
                        alt="loading..."
                        className=""
                        width={50}
                        height={50}
                      />
                    </div>
                  </div>
                ) : ( */}
                <>
                  <div className="date_details_mobile_content">
                  <h4>DATE DETAILS</h4>
                  <div className="date__detail__time__frame">
                    <span className="time__frame">Time Frame:</span>
                    <span className="time__value"> {formatDateDuration(date?.date_length) || "N/A"}</span>
                  </div>
                  <div className="interested__only">
                    <span className="interested__span1">Interested?</span>
                    <span className="interested__span2">
                      Take her out on her choice of date experience.
                    </span>
                  </div>
                  <div className="super__interested__div">
                    <Image src={StarIcon} height={15} width={15} />

                    <span className="super__interested">Super Interested?</span>
                  </div>
                  <div className="support__aspirations__div">
                    <span className="support__aspirations">
                      Support Her Aspirations:
                    </span>
                    <span className="support__price"> US${date?.price || "0"}</span>
                  </div>
                  <div className="suggested__gift">(Suggested Gift)</div>
                  <p>{date?.date_details || "No description available"}</p>
                  <div className="button-wrapper mt-3 date_details_actions">
                    {mobileLoader && (
                      <div className="d-flex justify-content-center w-50 align-items-center">
                        <span className="spin-loader-button"></span>
                      </div>
                    )}
                    {!mobileLoader &&
                      user?.gender === "male" &&
                      !shouldHideMessageAction && (
                        <button onClick={() => openPopup(date)} className="next">
                          Message
                        </button>
                      )}
                    <button
                      type="button"
                      className="edit"
                      onClick={() =>
                        router.push(`/user/user-profile/${date?.user_name}`)
                      }
                    >
                      <a>View profile</a>
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      growDiv(cardId);
                      setMobileDateDetailsIsOpen(!dateMobileDetailsIsOpen);
                      setAlreadyMessagedFromUser(false);
                    }}
                    className="mobile__less__txt"
                  >
                    <Image src={ShowLessIcon} height={10} width={10} />
                    <span>Show Less</span>
                  </div>
                  </div>
                </>
                {/* )} */}
              </div>
            </div>
          )}
        </div>
        )}
        {!isDesktopView && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            className="intrested_model"
            bodyOpenClassName="open-modal-body"
            closeTimeoutMS={120}
          >
            <div className="model_content">
              <IoIosClose
                size={25}
                className="close_btn"
                onClick={closeModal}
                color={"#A8A8A8"}
              />
              <H5>Clark Kent is</H5>
              <CustomIcon.IntrestedText color={"white"} size={140} />
              <Slider {...settings}>
                <div>
                  <figure>
                    <Image
                      src={UserImg}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg3}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg4}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
              </Slider>
              <div className="d-flex align-items-center my-4 header_btn_wrap">
                <Link href="/messages">
                  <a className="create-date">REPLY BACK</a>
                </Link>
              </div>
              <div className="my-4 bottom_content">
                <Link href="/user/user-profile">
                  <a className="view_profile">
                    <HiLockOpen /> View Profile
                  </a>
                </Link>
                <p>Clark Kent has granted you the access to his profile</p>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default React.memo(UserCardList);
