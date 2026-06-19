import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import SubHeading from "@/core/SubHeading";
import UserCardList from "@/core/UserCardList";
import SkeletonDate from "@/modules/skeleton/Dates/SkeletonDates";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
const NoImage = "/assets/img/no-image.png";
import Image from "next/image";
import { apiRequest } from "utils/Utilities";
import { fetchCities } from "../auth/forms/steps/validateRealTime";
import useWindowSize from "utils/useWindowSize";
import { useRef } from "react";
import { toast } from "react-toastify";
import { logout } from "../auth/authActions";
import { useRouter } from "next/router";
import Loader from "../Loader/Loader";

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
  setLogoutLoading,
  restoreTargetDateId = "",
  restorePageCount = 1,
  restoreOpenDateId = "",
}) {
  const [loading, setLoader] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState("");
  const [dates, setDates] = React.useState([]);
  const [hasResolvedGalleryFetch, setHasResolvedGalleryFetch] = React.useState(false);
  const [dateId, setDateId] = React.useState("");
  const { width } = useWindowSize();
  const scrollRef = useRef(null);
  const latestRequestRef = useRef(0);
  const fetchStartedForLocationRef = useRef(false);
  const restorePrefetchInFlightRef = useRef(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Use useMemo instead of state to avoid unnecessary re-renders
  const dateLength = useMemo(() => dates?.length || 0, [dates.length]);

  // iOS Safari fix: Limit DOM nodes to prevent memory crashes
  // iOS Safari crashes with >150-200 complex DOM nodes
  // Keep only last 40 dates in DOM (80 nodes with 2-column layout)
  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);

  // iOS optimization: Don't trim dates (causes jarring jumps)
  // Instead, rely on disabled scroll reveal animation for performance
  // With 94 dates max, iOS can handle it without scroll animation overhead
  const visibleDates = useMemo(() => {
    return dates; // Show all dates on all platforms
  }, [dates]);

  const locationKey = useMemo(
    () =>
      [
        selectedLocation?.city || "",
        selectedLocation?.province || "",
        searchStatus ? "search" : "all",
        show ? "open" : "closed",
      ].join("|"),
    [selectedLocation?.city, selectedLocation?.province, searchStatus, show]
  );

  // Scroll reveal: cards glide in as they enter the viewport. Uses
  // IntersectionObserver (stable, no per-frame layout work). Each card
  // is observed once; when it enters the viewport, .scrollActive is
  // added and the card is unobserved. Cards above the fold animate in
  // on mount because they're already intersecting.
  const cardRefs = useRef(new Map());
  const observerRef = useRef(null);
  const revealedRef = useRef(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) {
      // Fallback: reveal all immediately
      cardRefs.current.forEach((el) => {
        if (el) el.classList.add("scrollActive");
      });
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("scrollActive");
              observerRef.current.unobserve(entry.target);
              const id = entry.target.getAttribute("data-date-id");
              if (id) revealedRef.current.add(id);
            }
          });
        },
        { rootMargin: "0px 0px 80px 0px", threshold: 0.05 }
      );
    }

    // Observe any cards not yet revealed
    cardRefs.current.forEach((el, id) => {
      if (el && !revealedRef.current.has(id)) {
        observerRef.current.observe(el);
      }
    });

    return undefined;
  }, [dates.length]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const setCardRef = (id) => (el) => {
    if (!id) return;
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  // Removed unused scroll tracking that caused excessive re-renders and crashes

  const buildDateParams = (currentPage = 1) => {
    const perPage =
      restoreTargetDateId && currentPage === 1
        ? Math.max(20, Math.min(100, 20 * Math.max(1, Number(restorePageCount || 1))))
        : 20;

    if (searchStatus && selectedLocation?.city) {
      return {
        location: selectedLocation?.city,
        province: selectedLocation?.province,
        current_page: currentPage,
        per_page: perPage,
      };
    }

    if (searchStatus && selectedLocation?.province) {
      return {
        province: selectedLocation?.province,
        current_page: currentPage,
        per_page: perPage,
      };
    }

    return {
      current_page: currentPage,
      per_page: perPage,
    };
  };
  const nextPage = () => {
    const nextPageNum = page + 1;
    fetchDate(buildDateParams(nextPageNum), { replace: false });
  };

  // Removed problematic scrollIntoView that caused crashes

  const fetchDate = async (params, options = {}) => {
    const { replace = true } = options;
    const requestId = ++latestRequestRef.current;
    fetchStartedForLocationRef.current = true;

    try {
      setLoader(true);
      const res = await apiRequest({
        url: "date",
        params: params,
        timeout: 12000,
      }, 1);

      const rawDates = Array.isArray(res?.data?.data?.dates)
        ? res.data.data.dates
        : [];
      const currentPage = res?.data?.data?.pagination?.current_page || 1;

      if (requestId !== latestRequestRef.current) {
        return null;
      }
      
      const nextDates = rawDates.filter((date) => {
        const hasValidUserData = 
          Array.isArray(date?.user_data) && 
          date.user_data.length > 0 &&
          date.user_data[0]?._id;
        
        if (!hasValidUserData) {
          console.warn('Filtered out date with invalid user_data:', {
            dateId: date?._id,
            userName: date?.user_name,
            userData: date?.user_data
          });
        }
        
        return hasValidUserData;
      });

      // Update dates based on page
      setDates((prevDates) => {
        if (replace || currentPage === 1) {
          return nextDates;
        }

        const seen = new Set(prevDates.map((item) => item?._id).filter(Boolean));
        const merged = [...prevDates];
        nextDates.forEach((item) => {
          if (!seen.has(item?._id)) {
            merged.push(item);
          }
        });
        return merged;
      });
      setPagination(res?.data?.data?.pagination);
      setPage(currentPage);
      setHasResolvedGalleryFetch(true);
      setLoader(false);
      return res;
    } catch (err) {
      if (requestId !== latestRequestRef.current) {
        return err;
      }

      setHasResolvedGalleryFetch(false);
      setLoader(false);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setLogoutLoading(true);
        setTimeout(() => {
          logout(router, dispatch);
          setLogoutLoading(false);
        }, 2000);
      }
      return err;
    }
  };

  useEffect(() => {
    fetchStartedForLocationRef.current = false;
    restorePrefetchInFlightRef.current = false;
    setHasResolvedGalleryFetch(false);
    setPagination("");
    setPage(1);
    revealedRef.current = new Set();
    cardRefs.current = new Map();
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!show) {
      setLoader(true);
      fetchDate(buildDateParams(1));
    }
  }, [locationKey]);

  useEffect(() => {
    if (show || hasResolvedGalleryFetch || loading) {
      return;
    }

    const recoveryTimer = setTimeout(() => {
      if (!fetchStartedForLocationRef.current || dates.length === 0) {
        fetchDate(buildDateParams(1));
      }
    }, 1800);

    return () => clearTimeout(recoveryTimer);
  }, [show, hasResolvedGalleryFetch, loading, dates.length, locationKey]);

  useEffect(() => {
    if (
      show ||
      loading ||
      !hasResolvedGalleryFetch ||
      restorePrefetchInFlightRef.current
    ) {
      return;
    }

    const targetPage = Math.max(1, Number(restorePageCount || 1));
    const totalPages = Number(pagination?.total_pages || 0);
    const needsTargetCard =
      Boolean(restoreTargetDateId) &&
      !dates.some((date) => date?._id === restoreTargetDateId);
    const needsMorePages = targetPage > page;

    if (!needsTargetCard && !needsMorePages) {
      return;
    }

    if (totalPages && page >= totalPages) {
      return;
    }

    restorePrefetchInFlightRef.current = true;
    fetchDate(buildDateParams(page + 1), { replace: false }).finally(() => {
      restorePrefetchInFlightRef.current = false;
    });
  }, [
    dates,
    hasResolvedGalleryFetch,
    loading,
    page,
    pagination?.total_pages,
    restorePageCount,
    restoreTargetDateId,
    show,
  ]);

  const shouldShowInitialSkeleton =
    currentLocationLoading ||
    (!show && visibleDates.length === 0 && (!hasResolvedGalleryFetch || loading));

  const activeDates = useMemo(
    () => visibleDates.filter((item) => item?.date_status === true),
    [visibleDates]
  );

  const desktopColumns = useMemo(() => {
    return activeDates.reduce(
      (columns, item, index) => {
        columns[index % 2].push({ item, index });
        return columns;
      },
      [[], []]
    );
  }, [activeDates]);

  const renderDateCard = (item, index) => {
    const itemDateId = item?._id || `date-${index}`;
    return (
    <div
      ref={setCardRef(itemDateId)}
      className=""
      id="scrolldiv"
      data-date-id={itemDateId}
      key={itemDateId}
    >
      {width > 767 ? (
        <UserCardList
          setDateId={setDateId}
          date={item}
          cardId={`grow-${index}`}
          cardIndex={index}
          openPopup={() => {
            openPopup(item, {
              loadedPage: page,
            });
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
          restoreOpenDateId={restoreOpenDateId}
        />
      ) : (
        <UserCardList
          setDateId={setDateId}
          date={item}
          cardId={`grow-${index}`}
          cardIndex={index}
          openPopup={() => {
            openPopup(item, {
              loadedPage: page,
            });
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
          restoreOpenDateId={restoreOpenDateId}
        />
      )}
    </div>
    );
  };

  return (
    <InfiniteScroll
      // scrollableTarget="infiniteScroll"
      dataLength={dateLength}
      next={() => {
        nextPage();
      }}
      scrollThreshold={0.8}
      hasMore={!loading && page < (pagination?.total_pages || 0)}
      loader={
        <div className="d-flex justify-content-center my-4">
          <Image
            src={"/assets/squareLogoNoBack.gif"}
            alt="loading..."
            width={50}
            height={50}
          />
        </div>
      }
      style={{ overflowX: "hidden", scrollBehavior: "auto" }}
    >
      <div className="row">
        {shouldShowInitialSkeleton
          ? [1, 2, 3, 4, 5, 6].map((n) => (
              <div className={`col-lg-6`}>
                <SkeletonDate key={n} theme="dark" />
              </div>
            ))
          : activeDates.length > 0
          ? width > 767
            ? desktopColumns.map((column, columnIndex) => (
                <div className="col-lg-6" key={`desktop-column-${columnIndex}`}>
                  <div className="desktop-date-column">
                    {column.map(({ item, index }) => renderDateCard(item, index))}
                  </div>
                </div>
              ))
            : activeDates.map((item, index) => renderDateCard(item, index))
          : hasResolvedGalleryFetch && !loading && (
              <div className="no-message-card-date">
                <figure>
                  <Image src={NoImage} alt="NoImage" width={205} height={140} />
                </figure>
                <h6>
                  {searchStatus && selectedLocation?.city
                    ? "Sorry, no dates found for the selected location"
                    : "Sorry, no dates found in the gallery"}
                </h6>
                <SubHeading
                  title={
                    searchStatus && selectedLocation?.city
                      ? "Find a date by changing the location!"
                      : "Try refreshing or choosing a different location."
                  }
                />
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
