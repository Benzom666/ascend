import React from "react";
import Shimmer from "../Shimmer";
import SkeletonElement from "../SkeletonElement";

const SkeletonDate = ({ theme }) => {
  const themeClass = theme || "light";

  return (
    <div className={`date-skeleton-wrapper ${themeClass}`}>
      <div className="date-skeleton">
        <span className="">
          <SkeletonElement type="title" />
          <SkeletonElement type="text" />
        </span>

        <span>
          <SkeletonElement type="text" />
          <SkeletonElement type="title" />
        </span>
      </div>

      <Shimmer />
    </div>
  );
};

export default SkeletonDate;
