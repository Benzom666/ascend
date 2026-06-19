const STORAGE_KEY = "create_date_limit_state";

const readRawState = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    console.error("Failed to read create-date limit state", error);
    return null;
  }
};

export const readCreateDateLimitState = () => readRawState();

export const rememberCreateDateLimit = (message = "") => {
  if (typeof window === "undefined") return null;

  const nextValue = {
    message: String(message || ""),
    updatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  } catch (error) {
    console.error("Failed to store create-date limit state", error);
  }

  return nextValue;
};

export const clearCreateDateLimitState = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear create-date limit state", error);
  }
};

export const shouldHonorRememberedCreateDateLimit = (activeCount = 0) => {
  const storedState = readRawState();
  if (!storedState?.updatedAt) return false;

  const stateAge = Date.now() - Number(storedState.updatedAt || 0);
  const isFresh = Number.isFinite(stateAge) && stateAge < 1000 * 60 * 30;

  return isFresh && activeCount >= 3;
};
