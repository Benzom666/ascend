const FIRST_LOGIN_SKIP_PREFIX = "skip_create_date_intro_once:";
const FIRST_LOGIN_COMPLETED_PREFIX = "first_login_completed:";

const buildSkipKey = (userKey = "global") =>
  `${FIRST_LOGIN_SKIP_PREFIX}${String(userKey || "global")}`;

const buildFirstLoginKey = (userKey = "global") =>
  `${FIRST_LOGIN_COMPLETED_PREFIX}${String(userKey || "global")}`;

const getUserIntroKey = (user = {}) =>
  user?.user_name || user?.email || "global";

export const markCreateDateIntroSkipOnce = (user = {}) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(buildSkipKey(getUserIntroKey(user)), "true");
  } catch (error) {
    console.error("Failed to store create-date intro skip flag", error);
  }
};

export const consumeCreateDateIntroSkipOnce = (user = {}) => {
  if (typeof window === "undefined") return false;

  const storageKey = buildSkipKey(getUserIntroKey(user));

  try {
    const shouldSkip = window.localStorage.getItem(storageKey) === "true";
    if (shouldSkip) {
      window.localStorage.removeItem(storageKey);
    }
    return shouldSkip;
  } catch (error) {
    console.error("Failed to read create-date intro skip flag", error);
    return false;
  }
};

export const markFirstLoginCompleted = (user = {}) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(buildFirstLoginKey(getUserIntroKey(user)), "true");
  } catch (error) {
    console.error("Failed to mark first login completed", error);
  }
};

export const hasCompletedFirstLogin = (user = {}) => {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(buildFirstLoginKey(getUserIntroKey(user))) === "true";
  } catch (error) {
    console.error("Failed to check first login status", error);
    return false;
  }
};

export const clearFirstLoginStatus = (user = {}) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(buildFirstLoginKey(getUserIntroKey(user)));
  } catch (error) {
    console.error("Failed to clear first login status", error);
  }
};
