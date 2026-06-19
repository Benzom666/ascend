import React from "react";

/**
 * In-app notice — glass / tech aesthetic (used via react-toastify toast.custom).
 */
export default function LeToast({ message, variant, onDismiss }) {
  const isError = variant === "error";
  const isSuccess = variant === "success";

  return (
    <button
      type="button"
      className={`le-toast le-toast--${variant}`}
      onClick={onDismiss}
      aria-label="Dismiss notification"
    >
      <span className="le-toast__sheen" aria-hidden />
      <span
        className="le-toast__icon"
        aria-hidden
        data-state={isError ? "error" : isSuccess ? "ok" : "info"}
      />
      <span className="le-toast__text">{message}</span>
    </button>
  );
}
