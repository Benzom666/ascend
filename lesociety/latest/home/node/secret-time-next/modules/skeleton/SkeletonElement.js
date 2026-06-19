import React from "react";

function SkeletonElement({ type }) {
  const classes = `skeleton ${type} skeleton-loader`;

  return <div className={`${classes}`}></div>;
}

export default SkeletonElement;
