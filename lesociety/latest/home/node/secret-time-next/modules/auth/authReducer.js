import {
  RESTORE_AUTH_STATE,
  AUTHENTICATE,
  DEAUTHENTICATE,
  AUTHENTICATE_UPDATE,
  DELETE_FORM_DATA,
  CHANGE_SELECTED_LOCATION_POPUP,
  SET_GENDER,
  CHANGE_IMAGE_WARNING_POPUP,
  UPDATE_USER_TOKENS,
  UPDATE_USER_CHATS,
} from "./actionConstants";
import { getCookie, setCookie, removeCookie } from "../../utils/cookie";
import {
  loadFromLocalStorage,
  removeSessionStorage,
  saveToLocalStorage,
} from "utils/sessionStorage";

import { reducer as formReducer } from "redux-form";

let initialState;
if (typeof localStorage !== "undefined") {
  // const authCookie = getCookie("auth");

  // const authCookie = getSessionStorage("auth");
  const authCookie = loadFromLocalStorage();

  if (authCookie) {
    initialState = authCookie;
    // initialState = JSON.parse(decodeURIComponent(authCookie));
  } else {
    initialState = {
      isLoggedIn: false,
      showSelectedLocationPopup: true,
      showImageWarningPopup: true,
      gender: "",
      user: {},
    };
  }
} else {
  initialState = {
    isLoggedIn: false,
    showSelectedLocationPopup: true,
    showImageWarningPopup: true,
    gender: "",
    user: {},
  };
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case DEAUTHENTICATE:
      removeCookie("auth");
      removeCookie("token");
      removeSessionStorage("auth");
      removeSessionStorage("form");

      return {
        isLoggedIn: false,
        user: {},
      };

    case AUTHENTICATE:
      const authObj = {
        showSelectedLocationPopup: true,
        showImageWarningPopup: true,
        isLoggedIn: true,
        user: action.payload,
      };

      setCookie("auth", JSON.stringify(authObj));
      setCookie("token", action.payload?.token || "");
      // setSessionStorage("auth", JSON.stringify(authObj));
      saveToLocalStorage(authObj);
      return authObj;

    case AUTHENTICATE_UPDATE:
      const updateAuth = {
        ...state,
        isLoggedIn: true,
        user: { ...state.user, ...action.payload },
        showSelectedLocationPopup: true,
        showImageWarningPopup: true,
      };
      setCookie("auth", JSON.stringify(updateAuth));
      setCookie("token", updateAuth.user?.token || "");
      // setSessionStorage("auth", JSON.stringify(updateAuth));
      saveToLocalStorage(updateAuth);
      return {
        ...state,
        ...updateAuth,
      };

    case RESTORE_AUTH_STATE:
      return {
        isLoggedIn: true,
        user: action.payload.user,
      };
    case CHANGE_SELECTED_LOCATION_POPUP:
      const selectedLocationObj = {
        ...state,
        showSelectedLocationPopup: action.payload,
        isLoggedIn: true,
        showImageWarningPopup: true,
        user: { ...state.user },
      };
      saveToLocalStorage(selectedLocationObj);
      return selectedLocationObj;

    case CHANGE_IMAGE_WARNING_POPUP:
      const WaringPopupnObj = {
        ...state,
        showSelectedLocationPopup: true,
        isLoggedIn: true,
        showImageWarningPopup: action.payload,
      };
      saveToLocalStorage(WaringPopupnObj);
      return WaringPopupnObj;

    case SET_GENDER:
      const setGender = {
        ...state,
        showSelectedLocationPopup: true,
        showImageWarningPopup: true,
        isLoggedIn: false,
        user: { ...state.user },
        gender: action.payload,
      };
      saveToLocalStorage(setGender);
      return setGender;

    case UPDATE_USER_TOKENS:
      const updatedTokenState = {
        ...state,
        user: { 
          ...state.user, 
          interested_tokens: (state.user.interested_tokens || 0) + action.payload.interested_tokens,
          super_interested_tokens: (state.user.super_interested_tokens || 0) + action.payload.super_interested_tokens,
        },
      };
      saveToLocalStorage(updatedTokenState);
      return updatedTokenState;

    case UPDATE_USER_CHATS:
      const updatedChatState = {
        ...state,
        user: { 
          ...state.user, 
          chat_tokens: (state.user.chat_tokens || 0) + action.payload.chat_tokens,
        },
      };
      saveToLocalStorage(updatedChatState);
      return updatedChatState;

    default:
      return { ...state };
  }
};

export default authReducer;
