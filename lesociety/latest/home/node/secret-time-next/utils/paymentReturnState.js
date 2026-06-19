const PAYMENT_RETURN_STATE_KEY = "payment-return-state";

const getSafeReturnPath = (returnPath) => {
  if (typeof returnPath !== "string" || !returnPath.startsWith("/")) {
    return "/user/user-list";
  }

  if (returnPath.startsWith("//")) {
    return "/user/user-list";
  }

  return returnPath;
};

export const savePaymentReturnState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PAYMENT_RETURN_STATE_KEY,
      JSON.stringify({
        ...state,
        savedAt: Date.now(),
      })
    );
  } catch (error) {
    console.log("Failed to save payment return state", error);
  }
};

export const readPaymentReturnState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(PAYMENT_RETURN_STATE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.log("Failed to read payment return state", error);
    return null;
  }
};

export const clearPaymentReturnState = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(PAYMENT_RETURN_STATE_KEY);
  } catch (error) {
    console.log("Failed to clear payment return state", error);
  }
};

export const buildPaymentReturnDestination = ({
  status = "success",
  paymentId = "",
  returnContext = "",
} = {}) => {
  const pendingState = readPaymentReturnState();
  const source = pendingState?.source || "";
  const normalizedReturnContext = returnContext || pendingState?.returnContext || "";
  const shouldOpenSidebar =
    normalizedReturnContext === "sidebar" || source === "sidebar";
  const returnPath = shouldOpenSidebar
    ? "/user/user-list"
    : getSafeReturnPath(pendingState?.returnPath);
  const [pathname, existingSearch = ""] = returnPath.split("?");
  const params = new URLSearchParams(existingSearch);

  params.set("paymentReturn", "1");

  if (status === "success") {
    params.set("tokensUpdated", "1");
  }

  if (paymentId) {
    params.set("payment_id", paymentId);
  }

  if (shouldOpenSidebar) {
    params.set("openSidebar", "1");
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};
