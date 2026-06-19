import React from "react";

/**
 * LoadingSpinner Component
 * A reusable spinner for button loading states and async actions
 * 
 * @param {string} size - 'small' | 'medium' | 'large' (default: 'medium')
 * @param {string} color - 'white' | 'primary' | 'dark' (default: 'white')
 * @param {boolean} centered - Whether to center the spinner in its container
 * @param {string} className - Additional CSS classes
 */
function LoadingSpinner({ 
  size = "medium", 
  color = "white", 
  centered = false,
  className = "" 
}) {
  const sizeMap = {
    small: { width: 16, height: 16, borderWidth: 2 },
    medium: { width: 20, height: 20, borderWidth: 2 },
    large: { width: 32, height: 32, borderWidth: 3 },
  };

  const colorMap = {
    white: { border: "rgba(255, 255, 255, 0.3)", top: "#ffffff" },
    primary: { border: "rgba(242, 68, 98, 0.3)", top: "#f24462" },
    dark: { border: "rgba(0, 0, 0, 0.3)", top: "#000000" },
  };

  const { width, height, borderWidth } = sizeMap[size] || sizeMap.medium;
  const { border, top } = colorMap[color] || colorMap.white;

  const spinnerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    border: `${borderWidth}px solid ${border}`,
    borderTop: `${borderWidth}px solid ${top}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  };

  const containerStyle = centered ? {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  } : {};

  return (
    <span className={`loading-spinner ${className}`} style={containerStyle}>
      <span style={spinnerStyle} />
    </span>
  );
}

export default LoadingSpinner;
