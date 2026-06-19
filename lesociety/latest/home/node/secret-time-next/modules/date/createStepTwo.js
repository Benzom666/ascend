import React, { useEffect, useState } from "react";
import { Field, reduxForm, initialize } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import { FiArrowRight } from "react-icons/fi";
import { Select } from "antd";
import CreateDateHeader from "@/core/CreateDateHeader";
import { apiRequest } from "utils/Utilities";
import { logout } from "../auth/authActions";
import { useRouter } from "next/router";
import { AUTHENTICATE_UPDATE } from "../auth/actionConstants";

const priceOptions = [80, 100, 150, 200, 300, 400, 500, 750, 1000];
const { Option } = Select;

const CreateStepTwo = (props) => {
  const { handleSubmit, previousPage, invalid, onClose, confirmPopup } = props;
  const state = useSelector((state) => state.form.CreateStepTwo);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const [category, setCategory] = useState([]);
  const [aspiration, setAspiration] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [aspirationId, setAspirationId] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    getcategoryData();
  }, []);

  const getcategoryData = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: "categories",
      });

      const categoryList =
        res.data?.data?.length > 0
          ? res.data?.data?.map((da) => ({
              label: da?.name,
              value: da?._id,
            }))
          : [];
      setCategory(categoryList);
    } catch (err) {
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

  const getAspirationData = async (selectedCategoryId) => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `aspirations?category_id=${selectedCategoryId?.value}`,
      });
      const aspirationList =
        res.data?.data?.length > 0
          ? res.data?.data?.map((da) => ({
              label: da?.name,
              value: da?._id,
            }))
          : [];
      setAspiration(aspirationList);
    } catch (err) {
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

  const dropDownHandleSubmit = async () => {
    try {
      await apiRequest({
        data: {
          categatoryName: categoryId?.label,
          aspirationName: aspirationId?.label,
          aspirationId: aspirationId?.value,
          categatoryId: categoryId?.value,
        },
        method: "POST",
        url: "user/save-aspiration",
      });
      getUpdatedUserDetails();
    } catch (err) {
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

  const getUpdatedUserDetails = async () => {
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

  useEffect(() => {
    if (categoryId) {
      getAspirationData(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    setCategoryId(
      user?.categatoryId
        ? {
            value: user?.categatoryId,
            label: user?.categatoryName,
          }
        : ""
    );

    setAspirationId(
      user?.aspirationId
        ? {
            value: user?.aspirationId,
            label: user?.aspirationName,
          }
        : ""
    );
    dispatch(
      initialize("CreateStepTwo", {
        enter__category: user?.categatoryId,
        enter__aspiration: user?.aspirationId,
      })
    );
  }, []);

  return (
    <>
      {!confirmPopup ? (
        <div className="create-date-shell">
          <CreateDateHeader
            activeStep={2}
            onBack={previousPage}
            onClose={onClose}
            showBack={true}
            showClose={true}
          />
          <div className="create-date-content">
            <div className="inner_container">
              <div className="create-date-intro">
                <h2>Your aspiration. Your price.</h2>
                <div className="intro-subtitle">
                  When a man chooses Super Interested, he&apos;s saying:
                  I&apos;ll cover the outing and financially support your aspiration
                  to skip straight to our first date - Fast.
                </div>
              </div>
            </div>
            <div className="date-class-section choose-gender">
              <form
                onSubmit={handleSubmit}
                className="inner_container"
                style={{
                  paddingRight: "20px",
                  paddingLeft: "20px",
                  paddingTop: "0px",
                }}
              >
                <div className="mb-4">
                  <div className="aspiration__main__dropdown">
                    <label htmlFor="category" className="aspiration__label1">
                      1. Who do you aspire to be?
                    </label>
                    <label htmlFor="category" className="aspiration__label2">
                      Choose the aspiration you want this date to support
                    </label>
                    <Field
                      name="enter__category"
                      component={({ input, meta }) => (
                        <>
                          <Select
                            placeholder="Select A Category"
                            className="aspiration__antd__dropdown"
                            showSearch={false}
                            value={categoryId}
                            onChange={(value, event) => {
                              dispatch(initialize("CreateStepTwo", {}));
                              setAspiration([]);
                              setAspirationId("");
                              input.onChange(value);
                              setCategoryId({
                                value,
                                label: event.children,
                              });
                            }}
                            validate={validate}
                            onBlur={(e) => {
                              e.preventDefault();
                            }}
                            popupClassName="aspiration__antd__dropdown__popup"
                            onDropdownVisibleChange={(open) => {
                              document.body.style.overflow = open
                                ? "hidden"
                                : "unset";
                            }}
                          >
                            <Option value="">Select A Category</Option>
                            {category.map((item) => (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                          {meta.error && meta.touched && <span>{meta.error}</span>}
                        </>
                      )}
                    />
                    <div className="aspiration__antd__dropdown2">
                      <Field
                        name="enter__aspiration"
                        component={({ input, meta }) => (
                          <>
                            <Select
                              placeholder="Select Your Aspiration"
                              className="aspiration__antd__dropdown"
                              showSearch={false}
                              value={aspirationId}
                              onChange={(value, event) => {
                                input.onChange(value);
                                setAspirationId({
                                  value,
                                  label: event.children,
                                });
                              }}
                              validate={validate}
                              onBlur={(e) => {
                                e.preventDefault();
                              }}
                              disabled={
                                !categoryId ||
                                !(aspiration.length > 0)
                              }
                              popupClassName="aspiration__antd__dropdown__popup"
                              onDropdownVisibleChange={(open) => {
                                document.body.style.overflow = open
                                  ? "hidden"
                                  : "unset";
                              }}
                            >
                              <Option value="">Select Your Aspiration</Option>
                              {aspiration.map((item) => (
                                <Option key={item.value} value={item.value}>
                                  {item.label}
                                </Option>
                              ))}
                            </Select>
                            {meta.error && meta.touched && <span>{meta.error}</span>}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="category" className="price__radio__label">
                    2. Set your suggested financial gift
                  </label>
                  <p className="price__radio__gentlemen">
                    He hands you the gift in person on the date to help support
                    your goals. Showing his commitment.
                  </p>
                  <Field
                    name="education"
                    component={({ input }) => (
                      <div className="price-grid">
                        {priceOptions.map((price) => {
                          const isSelected = Number(input.value) === price;
                          return (
                            <button
                              type="button"
                              key={price}
                              className={`price-card ${
                                isSelected ? "is-selected" : ""
                              }`}
                              onClick={() => input.onChange(price)}
                            >
                              ${price}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  <p className="price__radio__gentlemen mt-3">
                    Pro tip: Women who post multiple dates at different price
                    points get 3-5x more Super Interested offers.
                  </p>
                </div>

                <div className="bottom-mobile register-bottom">
                  <div className="secret-input type-submit next-prev">
                    {!confirmPopup && (
                      <button
                        type="submit"
                        className="next"
                        disabled={!state.values?.education || invalid}
                        onClick={() => {
                          dropDownHandleSubmit();
                        }}
                      >
                        Next <FiArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default reduxForm({
  form: "CreateStepTwo",
  destroyOnUnmount: false,
  validate,
})(CreateStepTwo);
