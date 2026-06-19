import React from "react";
import SkeletonElement from "../SkeletonElement";
import Shimmer from "../Shimmer";

/**
 * SkeletonDateCard Component
 * Skeleton screen for individual date cards with shimmer effect
 * 
 * @param {number} count - Number of skeleton cards to render (default: 1)
 */
const SkeletonDateCard = ({ count = 1 }) => {
  const renderCards = () => {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(
        <div key={i} className="skeleton-wrapper skeleton-date-card">
          {/* Card Image */}
          <div className="skeleton-card-image">
            <SkeletonElement type="card-image" />
          </div>

          {/* Card Content */}
          <div className="skeleton-card-content">
            {/* User Info */}
            <div className="skeleton-card-header">
              <div className="skeleton-user-info">
                <SkeletonElement type="h5" />
                <SkeletonElement type="text-short" />
              </div>
              <div className="skeleton-price">
                <SkeletonElement type="text-short" />
              </div>
            </div>

            {/* Location */}
            <div className="skeleton-location">
              <SkeletonElement type="icon-small" />
              <SkeletonElement type="text-short" />
            </div>

            {/* Category Tag */}
            <div className="skeleton-category">
              <SkeletonElement type="tag" />
            </div>

            {/* Aspiration */}
            <div className="skeleton-aspiration">
              <SkeletonElement type="text" />
              <SkeletonElement type="badge" />
            </div>
          </div>

          {/* Card Actions */}
          <div className="skeleton-card-actions">
            <SkeletonElement type="button-small" />
            <SkeletonElement type="button-small" />
          </div>

          <Shimmer />
        </div>
      );
    }
    return cards;
  };

  return (
    <div className="skeleton-date-card-list">
      {renderCards()}
    </div>
  );
};

export default SkeletonDateCard;
