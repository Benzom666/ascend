import { useRouter } from "next/router";
import React from "react";
import { reduxForm } from "redux-form";
import validate from "../../auth/forms/validate/validate";

import SkeletonElement from "./../SkeletonElement";

const FemaleSkeletonSecondStep = (props) => {
  const router = useRouter();

  return (
    <form className="upload-pics">
      <div className="d-block d-md-none login-text mb-0">
        <a>
          <SkeletonElement type="icon" />
        </a>
      </div>
      {!router?.query?.edit && (
        <span className="completion-sign">
          <SkeletonElement type="verified-icon" />
        </span>
      )}
      {!router?.query?.edit && <SkeletonElement type="second-step-p" />}

      <SkeletonElement type="second-step-p" />

      <div className="text-center"></div>

      <SkeletonElement type="second-step-text-label" />

      <div className="images-uploads">
        <div className="big-image">
          <SkeletonElement type="input-image-upload-425h" />
        </div>
        <div className="small-images big-image">
          <div>
            <SkeletonElement type="input-image-upload-120h-120w" />
          </div>
          <div>
            <SkeletonElement type="input-image-upload-120h-120w" />
          </div>
          <div>
            <SkeletonElement type="input-image-upload-120h-120w" />
          </div>
        </div>

        <SkeletonElement type="second-step-label" />
        <SkeletonElement type="second-step-input" />

        <SkeletonElement type="second-step-label" />
        <SkeletonElement type="second-step-input-textarea" />
      </div>
      <div className="bottom-mobile register-bottom">
        <div className="secret-input type-submit next-prev">
          <SkeletonElement type="second-step-input-button" />
        </div>
      </div>
    </form>
  );
};

export default FemaleSkeletonSecondStep;
