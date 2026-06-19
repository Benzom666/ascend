import React, { useState, useEffect } from "react";
import { reduxForm, reset, change } from "redux-form";
import { useSelector, useDispatch } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import Link from "next/link";
import { useRouter } from "next/router";
import UserCardDetail from "@/core/UserCardDetail";
import ConfirmDate from "./../../modules/date/confirmDate";
import { apiRequest } from "utils/Utilities";
import SkeletonDatesPreview from "../skeleton/Dates/SkeletonDatesPreview";
import MaxDatesReachedPopup from "@/components/popups/MaxDatesReachedPopup";
import CreateDateHeader from "@/core/CreateDateHeader";
import {
  getEligibleDateImages,
  getNormalizedImages,
  normalizeImageIndex,
} from "utils/dateState";
import {
  redirectToCreateDateLimit,
  checkCreateDateLimit,
  useCreateDateAccessGuard,
} from "utils/createDateAccessGuard";

const DatePreview = (props) => {
  const { handleSubmit, onClose } = props;
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer.user);
  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const dateSuggestion = useSelector(
    (state) => state?.form?.CreateStepOne?.values
  );
  const priceState = useSelector((state) => state?.form?.CreateStepTwo?.values);
  const timeState = useSelector(
    (state) => state?.form?.CreateStepThree?.values
  );
  const dateDescription = useSelector(
    (state) => state?.form?.CreateStepFour?.values
  );
  const selectedDateData = useSelector(
    (state) => state?.form?.CreateStepOne?.values
  );
  const { isCheckingLimit, isLimitBlocked } = useCreateDateAccessGuard({
    router,
    token: user?.token,
    userName: user?.user_name,
    enabled: !router?.query?.new_edit && !router?.query?.edit,
  });
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [loader, setLoader] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [eligibleImages, setEligibleImages] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.images?.length > 0 && user?.images[0]) {
        setPageLoading(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [user?.images]);

  const toggle = () => setConfirmPopup(!confirmPopup);

  useEffect(() => {
    const fetchUsedImages = async () => {
      try {
        if (!user?.user_name) {
          return;
        }
        const res = await apiRequest({
          url: "date",
          params: {
            user_name: user?.user_name,
            current_page: 1,
            per_page: 10000,
          },
        });
        const dates = res?.data?.data?.dates || [];
        const available = getEligibleDateImages(user?.images || [], dates);
        setEligibleImages(available);
        const currentIndex =
          typeof dateSuggestion?.image_index === "number"
            ? dateSuggestion.image_index
            : available[0]?.index;
        const initial =
          available.find((img) => img.index === currentIndex) || available[0];
        if (initial) {
          dispatch(change("CreateStepOne", "image_index", initial.index));
        }
      } catch (e) {
        console.log("Failed to load images", e);
        const normalizedImages = getNormalizedImages(user?.images || []);
        const fallbackIndex = normalizeImageIndex(dateSuggestion?.image_index, 0);
        const selectedFallback =
          normalizedImages.find((img) => img.index === fallbackIndex) ||
          normalizedImages[0];
        setEligibleImages(selectedFallback ? [selectedFallback] : []);
      }
    };
    fetchUsedImages();
  }, [dispatch, user?.user_name, user?.images, dateSuggestion?.image_index]);

  const handleSwapImage = () => {
    if (eligibleImages.length < 2) {
      return;
    }
    const currentIndex =
      typeof dateSuggestion?.image_index === "number"
        ? dateSuggestion.image_index
        : eligibleImages[0]?.index;
    const currentPos = eligibleImages.findIndex(
      (img) => img.index === currentIndex
    );
    const nextPos = currentPos === -1 ? 0 : (currentPos + 1) % eligibleImages.length;
    const next = eligibleImages[nextPos];
    if (next) {
      dispatch(change("CreateStepOne", "image_index", next.index));
      if (dateSuggestion?.dateId) {
        apiRequest({
          method: "POST",
          url: "/date/update",
          data: {
            date_id: dateSuggestion?.dateId,
            image_index: next.index,
          },
        }).catch((err) => {
          console.log("Failed to update image index", err);
        });
      }
    }
  };

  const previousPage = () => {
    router.asPath.includes("drafted")
      ? router.push("/user/user-list")
      : router.query?.new_edit
      ? props.setPage(3)
      : router.back();
  };

  const postDate = async () => {
    if (!router?.query?.new_edit && !router?.query?.edit) {
      const accessState = await checkCreateDateLimit({
        token: user?.token,
        userName: user?.user_name,
      });

      if (accessState?.isBlocked) {
        redirectToCreateDateLimit(router);
        return;
      }
    }

    setLoader(true);
    try {
      await apiRequest({
        method: "POST",
        url: "/date/update-draft-status",
        data: {
          date_status: true,
        },
      });
      setLoader(false);
      router.push("/user/user-list");
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));
    } catch (e) {
      setLoader(false);
    }
  };

  const updateDate = async () => {
    setLoader(true);
    try {
      await apiRequest({
        method: "POST",
        url: "/date/update",
        data: {
          user_name: user?.user_name,
          date_id: selectedDateData?.dateId,
          date_details: dateDescription?.date_description,
        },
      });
      setLoader(false);
      router.push("/user/user-list");
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));
    } catch (e) {
      setLoader(false);
    }
  };

  if (isCheckingLimit) {
    return <SkeletonDatesPreview />;
  }

  if (isLimitBlocked) {
    return (
      <MaxDatesReachedPopup
        isOpen={true}
        onClose={() => router.push("/user/user-list")}
      />
    );
  }

  if (pageLoading) {
    return <SkeletonDatesPreview />;
  }

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell">
          <CreateDateHeader
            activeStep={5}
            onBack={previousPage}
            onClose={toggle}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>You&apos;re almost done!</h2>
                <div className="intro-subtitle">
                  Take a moment to review your date.
                </div>
                <div className="intro-note">
                  Your description can only be edited. Everything else is
                  locked.
                </div>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="date-class-section choose-gender date-preview-card"
            >
              <div className="inner_container inner_container_Date_Preview_width">
                <UserCardDetail
                  user={user}
                  cityState={cityState}
                  dateSuggestion={dateSuggestion}
                  timeState={timeState}
                  priceState={priceState}
                  dateDescription={dateDescription}
                  imageSrc={
                    eligibleImages.find(
                      (img) => img.index === dateSuggestion?.image_index
                    )?.url
                  }
                  showSwap={!router?.query?.new_edit && eligibleImages.length >= 2}
                  onSwap={handleSwapImage}
                />
                {!confirmPopup && (
                  <div className="bottom-mobile register-bottom">
                    <div className="secret-input type-submit next-prev">
                      {!router?.query?.new_edit && (
                        <button type="button" className="edit next">
                          <Link href="/create-date/choose-city?edit=true">
                            <a>Edit</a>
                          </Link>
                        </button>
                      )}
                      <button
                        type="button"
                        className="next"
                        onClick={router?.query?.new_edit ? updateDate : postDate}
                      >
                        {loader ? (
                          <span className="spin-loader-button"></span>
                        ) : (
                          <a className="forgot-passwrd">
                            {router?.query?.new_edit ? "Update Date" : "Post Date"}
                          </a>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </>
  );
};

export default reduxForm({
  form: "DatePreview",
  validate,
})(DatePreview);
