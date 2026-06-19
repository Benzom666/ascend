import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import SubHeading from "@/core/SubHeading";
import UserCardList from "@/core/UserCardList";
import SkeletonDate from "@/modules/skeleton/Dates/SkeletonDates";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoImage from "assets/img/no-image.png";
import Image from "next/image";
import { apiRequest } from "utils/Utilities";
import { fetchCities } from "../auth/forms/steps/validateRealTime";
import useWindowSize from "utils/useWindowSize";
import { useRef } from "react";
import { toast } from "react-toastify";
import { logout } from "../auth/authActions";
import { useRouter } from "next/router";

function DateAndLocation({
  currentLocationLoading,
  selectedLocation,
  show,
  openPopup,
  closePopup,
  receiverData,
  alreadyMessagedFromUser,
  setAlreadyMessagedFromUser,
  setLocation,
  growDiv,
  searchStatus,
}) {
  const [dateLength, setDateLength] = useState(0);
  const [loading, setLoader] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState("");
  const [dates, setDates] = React.useState([]);
  const [dateId, setDateId] = React.useState("");
  const { width } = useWindowSize();
  const scrollRef = useRef(null);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollType, setScrollType] = React.useState("down");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setDateLength(dates?.length);
  }, [dates]);

  document.addEventListener("scroll", function () {
    const reveals = document.querySelectorAll("#scrolldiv");

    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      //   const elementVisible = reveals[i]?.clientHeight;
      if (elementTop < windowHeight) {
        reveals[i].classList.add("scrollActive");
      } else {
        reveals[i].classList.remove("scrollActive");
      }
    }
  });

  const position = window.pageYOffset;

  const handleScroll = () => {
    const position = window.pageYOffset;
    if (scrollPosition > position) {
      setScrollType("up");
    } else {
      setScrollType("down");
    }
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollPosition]);

  // console.log("scrollPosition position", scrollPosition, position);

  const nextPage = () => {
    setTimeout(() => {
      const params = searchStatus
        ? {
            location: selectedLocation?.city,
            province: selectedLocation?.province?.toLowerCase(),
            current_page: page + 1,
            per_page: 10,
          }
        : {
            // sort: "location",
            // selectedLocation: selectedLocation?.city?.toLowerCase(),
            // location: selectedLocation?.city,
            province: selectedLocation?.province?.toLowerCase(),
            current_page: page + 1,
            per_page: 10,
          };

      setPage(page + 1);
      fetchDate(params);
    }, 500);
  };

  const lastClickedDate = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDate = async (params) => {
    try {
      setLoader(true);
      const res = await apiRequest({
        url: "date",
        params: params,
      });
      console.log("res dates of user", res);

      if (res?.data?.data?.pagination?.current_page !== 1) {
        res?.data?.data?.dates;
        // .sort(function (a, b) {
        //   return new Date(b.created_at) - new Date(a.created_at);
        // });
        // setTimeout(() => {
        setDates([...dates, ...res?.data?.data?.dates]);
        // }, 500);
      } else {
        res?.data?.data?.dates;
        // .sort(function (a, b) {
        //   return new Date(b.created_at) - new Date(a.created_at);
        // });
        setTimeout(() => {
          setDates(res?.data?.data?.dates);
        }, 2000);
      }
      setPagination(res?.data?.data?.pagination);
      setTimeout(() => {
        setLoader(false);
      }, 2000);
    } catch (err) {
      setDates([]);
      setLoader(false);

      console.log("error fetchDate", err?.response);
      if (err?.response?.status === 401) {
        toast.error("Your session has expired. Please login again");
        setTimeout(() => {
          logout(router, dispatch);
        }, 2000);
      }
      return err;
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setDates([]);
      setPage(1);
    }
    if (selectedLocation?.city && !show) {
      const params = searchStatus
        ? {
            location: selectedLocation?.city,
            province: selectedLocation?.province?.toLowerCase(),
            current_page: 1,
            per_page: 10,
          }
        : {
            // location: selectedLocation?.city,
            // sort: "location",
            // selectedLocation: selectedLocation?.city?.toLowerCase(),
            province: selectedLocation?.province?.toLowerCase(),
            current_page: 1,
            per_page: 10,
          };

      fetchDate(params);
    }
  }, [selectedLocation, show]);

  return (
    <InfiniteScroll
      // scrollableTarget="infiniteScroll"
      dataLength={dateLength}
      next={() => {
        nextPage();
      }}
      scrollThreshold={0.5}
      hasMore={!loading && pagination?.total_pages !== page}
      style={{ overflowX: "hidden", scrollBehavior: "smooth" }}
    >
      <div className="row">
        {currentLocationLoading || (loading && dates.length === 0)
          ? [1, 2, 3, 4, 5, 6].map((n) => (
              <div className={`col-xl-6 col-lg-12`}>
                <SkeletonDate key={n} theme="dark" />
              </div>
            ))
          : dates.length > 0 &&
            dates.filter((item) => item?.date_status === true)?.length > 0
          ? dates
              .filter((item) => item?.date_status === true)
              .map((item, index) => (
                <div
                  className={`col-xl-6 col-lg-12 ${
                    (width > 767 && (index === 2 || index === 3)) ||
                    index === 0 ||
                    index === 1 ||
                    scrollPosition <= position
                      ? "scrollActive"
                      : ""
                  }`}
                  id={`scrolldiv`}
                  key={index}
                  onClick={() => {
                    // if (index === dates?.length - 1) {
                    lastClickedDate();
                    // }
                  }}
                >
                  {width > 767 ? (
                    <UserCardList
                      setDateId={setDateId}
                      date={item}
                      cardId={`grow-${index}`}
                      openPopup={() => {
                        openPopup(item);
                      }}
                      closePopup={closePopup}
                      dateId={dateId}
                      isDesktopView={true}
                      key={index}
                      ref={scrollRef}
                      loading={loading}
                      setLoader={setLoader}
                      receiverData={receiverData}
                      alreadyMessagedFromUser={alreadyMessagedFromUser}
                      setAlreadyMessagedFromUser={setAlreadyMessagedFromUser}
                    />
                  ) : (
                    <UserCardList
                      setDateId={setDateId}
                      date={item}
                      cardId={`grow-${index}`}
                      openPopup={() => {
                        openPopup(item);
                      }}
                      setLoader={setLoader}
                      closePopup={closePopup}
                      growDiv={growDiv}
                      dateId={dateId}
                      key={index}
                      ref={scrollRef}
                      loading={loading}
                      receiverData={receiverData}
                      alreadyMessagedFromUser={alreadyMessagedFromUser}
                      setAlreadyMessagedFromUser={setAlreadyMessagedFromUser}
                    />
                  )}
                </div>
              ))
          : !loading && (
              <div className="no-message-card-date">
                <figure>
                  <Image src={NoImage} alt="NoImage" width={205} height={140} />
                </figure>
                <h6>Sorry, no dates found for the selected location</h6>
                <SubHeading title="Find a date by changing the location!" />
              </div>
            )}
        {loading &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <div className={`col-xl-6 col-lg-12`}>
              <SkeletonDate key={n} theme="dark" />
            </div>
          ))}
      </div>
    </InfiniteScroll>
  );
}

export default DateAndLocation;
