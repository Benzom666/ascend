import React from "react";
import SkeletonElement from "./SkeletonElement";

function SkeletonRadio({ options }) {
  return (
    <div className={`secret-input type-checkbox secret-input type-text`}>
      <SkeletonElement type="label" />
      <div className="multi-radio">
        {options?.map((option, index) => {
          return (
            <React.Fragment>
              <div className="label-box">
                {/* <SkeletonElement type="label" /> */}
                <SkeletonElement type="input-radio" />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default SkeletonRadio;
