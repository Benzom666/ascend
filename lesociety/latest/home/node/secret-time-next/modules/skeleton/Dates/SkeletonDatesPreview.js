import React, { useState } from "react";
import { reduxForm } from "redux-form";
import validate from "modules/auth/forms/validate/validate";
import useWindowSize from "utils/useWindowSize";

import SkeletonElement from "../SkeletonElement";
import Shimmer from "./../Shimmer";

const SkeletonDatesPreview = ({ theme, ...props }) => {
  const themeClass = theme || "dark";
  const { handleSubmit } = props;
  const { width } = useWindowSize();

  const [confirmPopup, setConfirmPopup] = useState(false);

  return (
    <>
      <div className="inner_container">
        <div className="d-flex d-md-none justify-content-between align-items-center login-text mb-0">
          <SkeletonElement type="h6" />
          <SkeletonElement type="icon" />
        </div>
        {width < 768 && (
          <>
            <SkeletonElement type="h6" />
          </>
        )}
      </div>
      <div
        className={`${
          width > 767 ? "date-Preview-text" : "date-suggetion-text mt-4"
        } `}
      >
        <div className="inner_container ">
          <div className="d-flex w-60 ">
            {width > 767 && (
              <>
                <SkeletonElement type="h6" />
              </>
            )}

            {width > 767 && (
              <div className="desk-close-icon-new">
                <SkeletonElement type="icon" />
              </div>
            )}
          </div>
          <SkeletonElement type="text" />
          {width > 767 && (
            <>
              <div className="mt-50px mb-4">
                <SkeletonElement type="h6" />
                <SkeletonElement type="text" />
                <SkeletonElement type="text" />
              </div>
            </>
          )}

          {/* <SkeletonElement type="text" /> */}
        </div>
      </div>
      <form className="date-class-section choose-gender date-preview-card">
        <div className="inner_container inner_container_Date_Preview_width">
          <div className="date_card_wrap">
            <div className={`skeleton-wrapper ${themeClass}`}>
              <figure className="user_img_date">
                <div
                  style={{
                    height: "500px",
                    width: "500px",
                  }}
                ></div>

                <div className="user-details">
                  <div className="user-top-sec">
                    <h5>
                      <span>
                        <SkeletonElement type="user-name" />
                      </span>
                      <span className="price_per_hour">
                        <SkeletonElement type="user-name" />
                      </span>
                    </h5>
                  </div>
                  <div className="user_location">
                    <span className="d-flex align-items-start">
                      <span className="address-wrap">
                        <span className="address">
                          <SkeletonElement type="user-name" />
                        </span>
                      </span>
                      <div className="tag_wrap">
                        <ul>
                          <SkeletonElement type="user-name" />
                        </ul>
                      </div>
                    </span>
                  </div>
                </div>
              </figure>
              <div className="date_details">
                <SkeletonElement type="h4" />

                <SkeletonElement type="text" />
                <SkeletonElement type="text" />
              </div>
              <Shimmer />
            </div>
          </div>

          {!confirmPopup && (
            <div className="bottom-mobile register-bottom">
              <div className="secret-input type-submit next-prev">
                <SkeletonElement type="edit-button" />

                <SkeletonElement type="post-button" />
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
};
export default SkeletonDatesPreview;
