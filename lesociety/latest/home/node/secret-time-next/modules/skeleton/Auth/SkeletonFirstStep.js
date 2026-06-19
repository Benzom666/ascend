import React from "react";
import SkeletonElement from "../SkeletonElement";
import { bodyType, Ethnicity } from "utils/Utilities";

import SkeletonRadio from "../SkeletonRadio";
import Shimmer from "../Shimmer";
import useWindowSize from "utils/useWindowSize";

const SkeletonFirstStep = ({ theme, ...props }) => {
  const themeClass = theme || "dark";
  const { width } = useWindowSize();

  return (
    <form className={`skeleton-wrapper pt-3 ${themeClass}`}>
      <div className="d-block d-md-none login-text ">
        <SkeletonElement type="icon" />
        <span className="">
          <SkeletonElement type="auth-header" />
          <SkeletonElement type="auth-line" />
        </span>
      </div>
      <SkeletonElement type="h2" />
      <SkeletonElement type="auth-register-p-text" />

      <div className="secret-input type-text">
        <SkeletonElement type="label" />
        <SkeletonElement type="input" />
      </div>

      <div className="secret-input type-text">
        <SkeletonElement type="label" />
        <SkeletonElement type="input" />
      </div>

      <div className="secret-input type-text">
        <SkeletonElement type="label" />
        <SkeletonElement type="input" />
      </div>

      <div className="secret-input type-text">
        <SkeletonElement type="label" />
        <SkeletonElement type="input" />
      </div>
      <div>
        <div className="secret-input type-text">
          <SkeletonElement type="label" />
          <SkeletonElement type="input-age" />
        </div>

        <div className="auth-radio">
          <SkeletonRadio options={bodyType} />
        </div>
        <div className="auth-radio">
          <SkeletonRadio options={Ethnicity} />
        </div>

        {width < 767 && (
          <>
            <div className="d-flex checkbox-label">
              <SkeletonElement type="text" />
              <SkeletonElement type="text" />
            </div>
            <div className="bottom-mobile register-bottom">
              <div className="secret-input type-submit">
                <SkeletonElement type="input" />
              </div>
            </div>
          </>
        )}
        {width > 767 && (
          <div className="bottom-mobile register-bottom">
            <div className="secret-input type-submit">
              <SkeletonElement type="input" />
            </div>
            <SkeletonElement type="text" />
            <SkeletonElement type="text" />
          </div>
        )}
      </div>
      <Shimmer />
    </form>
  );
};

export default SkeletonFirstStep;
