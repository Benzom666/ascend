import React, { useState, useEffect, useRef } from "react";
import { Field, reduxForm, initialize } from "redux-form";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import { useRouter } from "next/router";
import { apiRequest } from "utils/Utilities";
import DateWarningModal from "./DateWarningModal";
import { findDOMNode } from "react-dom";
import CreateDateHeader from "@/core/CreateDateHeader";
import {
  redirectToCreateDateLimit,
  checkCreateDateLimit,
} from "utils/createDateAccessGuard";

const CreateStepFour = (props) => {
  const {
    handleSubmit,
    previousPage,
    invalid,
    onClose,
    confirmPopup,
  } = props;
  const state = useSelector((state) => state?.form?.CreateStepFour);
  const user = useSelector((state) => state?.authReducer.user);
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [val, setVal] = useState("");
  const [showWarningPopup, setShowWarningPopup] = useState(
    user?.date_warning_popup || false
  );
  const [showAnimation, setShowAnimation] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const shouldBlockCreateFlow =
    !router?.query?.edit && !router?.query?.new_edit;

  const ensureCreateDateCanContinue = async () => {
    if (!shouldBlockCreateFlow) {
      return true;
    }

    const accessState = await checkCreateDateLimit({
      token: user?.token,
      userName: user?.user_name,
    });

    if (accessState?.isBlocked) {
      redirectToCreateDateLimit(router);
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (user?.date_warning_popup && !hideModal) {
      setHideModal(true);
    }
  }, [user?.date_warning_popup]);

  useEffect(() => {
    if (!hideModal && val.length > 0) {
      if (inputRef.current) {
        const node = findDOMNode(inputRef.current);
        const inputEl = node.getElementsByTagName("textarea");
        if (inputEl.length > 0) inputEl[0].blur();
      }
      setShowWarningPopup(true);
      setTimeout(() => {
        setShowAnimation(true);
      }, 50);
    }
  }, [hideModal, val]);

  useEffect(() => {
    if (hideModal) {
      setShowAnimation(false);
      setTimeout(() => {
        setShowWarningPopup(false);
      }, 2000);
    }
  }, [hideModal]);

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

  const postDate = async () => {
    const canContinue = await ensureCreateDateCanContinue();
    if (!canContinue) {
      return;
    }

    setLoader(true);
    if (router?.query?.new_edit) {
      setLoader(false);
      return;
    }
    const data = {
      location: cityState?.enter_city?.name,
      country_code: cityState?.enter_country?.value,
      country: cityState?.enter_country?.label,
      province: cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        : cityState?.enter_city?.province[0]?.short_code,
      [dateSuggestion?.search_type?.category]:
        dateSuggestion?.search_type?.label,
      date_length: timeState?.education,
      price: priceState?.education,
      image_index: dateSuggestion?.image_index ?? 0,
      date_details: dateDescription?.date_description,
      user_name: user?.user_name,
      date_status: false,
      isUpdate: router?.query?.edit ? Boolean(router?.query.edit) : undefined,
    };

    try {
      const res = await apiRequest({
        method: "POST",
        url: "/date",
        data,
      });
      if (res?.data?.data?._id) {
        dispatch(
          initialize("CreateStepOne", {
            ...dateSuggestion,
            dateId: res?.data?.data?._id,
          })
        );
      }
      setLoader(false);
    } catch (e) {
      setLoader(false);
    }
  };

  const updateDate = async () => {
    setLoader(true);
    const data = {
      date_id: dateSuggestion?.dateId,
      location: cityState?.enter_city?.name,
      country_code: cityState?.enter_country?.value,
      country: cityState?.enter_country?.label,
      province: cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        : cityState?.enter_city?.province[0]?.short_code,
      [dateSuggestion?.search_type?.category]:
        dateSuggestion?.search_type?.label,
      date_length: timeState?.education,
      price: priceState?.education,
      image_index: dateSuggestion?.image_index ?? 0,
      date_details: dateDescription?.date_description,
      user_name: user?.user_name,
      date_status: false,
      isUpdate: router?.query?.edit ? Boolean(router?.query.edit) : undefined,
    };
    try {
      await apiRequest({
        method: "POST",
        url: "/date/update",
        data,
      });
      setLoader(false);
    } catch (e) {
      setLoader(false);
    }
  };

  const changeHandler = (e) => {
    if (!showWarningPopup) {
      setVal(e.target.value);
    } else {
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.body.style.overflow = showWarningPopup ? "hidden" : "unset";
  }, [showWarningPopup]);

  return (
    <>
      {showWarningPopup && (
        <DateWarningModal
          showAnimation={showAnimation}
          setHideModal={setHideModal}
          hideModal={hideModal}
          val={val}
        />
      )}

      <>
        {!confirmPopup ? (
          <div className="create-date-shell">
            <CreateDateHeader
              activeStep={4}
              onBack={previousPage}
              onClose={onClose}
              showBack={true}
              showClose={true}
            />
            <div className="create-date-content">
              <div className="inner_container">
                <div className="create-date-intro">
                  <h2>Make him want this date.</h2>
                  <div className="intro-subtitle">
                    Tell him why this night with you is unforgettable. Your
                    vibe, your energy, what he can expect.
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="date-class-section choose-gender"
                style={{ paddingRight: "10px", paddingLeft: "10px" }}
              >
                <div className="inner_container">
                  <div className="mb-4 date-description description-field">
                    <Field
                      ref={inputRef}
                      withRef
                      name="date_description"
                      type="text"
                      validationLength={500}
                      component={Inputs.textarea}
                      placeholder="I love deep conversations over great wine... I’m playful, classy, and always up for an adventure. Expect laughter, real connection, and a night that feels effortless."
                      onChange={changeHandler}
                      value={val}
                    />
                  </div>
                  <div className="bottom-mobile register-bottom">
                    <div className="secret-input type-submit next-prev">
                      {!confirmPopup && (
                        <button
                          type="submit"
                          className="next"
                          onClick={router?.query?.edit ? updateDate : postDate}
                          disabled={!state?.values?.date_description || invalid}
                        >
                          {loader ? (
                            <span className="spin-loader-button"></span>
                          ) : (
                            <>
                              Next <FiArrowRight />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </>
    </>
  );
};

export default reduxForm({
  form: "CreateStepFour",
  destroyOnUnmount: false,
  validate,
})(CreateStepFour);
