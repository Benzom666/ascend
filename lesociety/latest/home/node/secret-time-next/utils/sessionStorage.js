export function saveToLocalStorage(state) {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem("auth", serializedState);
  } catch (e) {
    console.log(e);
  }
}

export function loadFromLocalStorage() {
  try {
    const serializedState = sessionStorage.getItem("auth");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.log(e);
  }
};

export const setSessionStorage = (key, value) => {
  if (process.browser) {
    sessionStorage.setItem(key, value);
  }
};

export const getSessionStorage = (key) => {
  if (process.browser) {
    return sessionStorage.getItem(key);
  }
};
