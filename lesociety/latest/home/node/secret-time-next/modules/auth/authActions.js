import {
  RESTORE_AUTH_STATE,
  AUTHENTICATE,
  DEAUTHENTICATE,
  SIGNUP1,
  SIGNUP2,
  SIGNUP3,
  SIGNUP4,
  LOGIN,
  CHANGE_SELECTED_LOCATION_POPUP,
  SET_GENDER,
  CHANGE_IMAGE_WARNING_POPUP,
  UPDATE_USER_TOKENS,
  UPDATE_USER_CHATS,
} from "./actionConstants";

import { reset, initialize } from "redux-form";

// import { removeCookie } from "../utils/cookie";

export const authenticateAction = (user) => {
  return {
    type: AUTHENTICATE,
    payload: user,
  };
};

export const deAuthenticateAction = () => {
  return {
    type: DEAUTHENTICATE,
  };
};

export const changeSelectedLocationPopup = (payload) => {
  return {
    type: CHANGE_SELECTED_LOCATION_POPUP,
    payload,
  };
};

export const changeImageWaringPopup = (payload) => {
  return {
    type: CHANGE_IMAGE_WARNING_POPUP,
    payload,
  };
};

export const storeUserGender = (payload) => {
  return {
    type: SET_GENDER,
    payload,
  };
};

export const restoreState = (authState) => {
  return {
    type: RESTORE_AUTH_STATE,
    payload: authState,
  };
};

export const signUp = (signUpDetails) => {
  return async (dispatch) => {
    try {
      dispatch(deAuthenticateAction());
      // Signup code. And storing data in result variable
      dispatch(authenticateAction(result));
    } catch (e) {
      dispatch(deAuthenticateAction());
    }
  };
};

export const logout = (router, dispatch) => {
  dispatch(deAuthenticateAction());
  // redirect to login and refresh
  router.push("/auth/login");
  window?.location?.replace("/auth/login");
  dispatch(initialize("signupStep2", ""));
  dispatch(initialize("DatePreview", ""));
  dispatch(initialize("RegisterFormMale", ""));
  dispatch(initialize("signupStep3", ""));
  dispatch(initialize("RegisterForm", ""));
  dispatch(initialize("forgotpassword", ""));
  dispatch(initialize("LoginForm", ""));
  dispatch(initialize("SecondStep", ""));
  dispatch(initialize("ThirdStep", ""));
  dispatch(initialize("CreateStepFour", ""));
  dispatch(initialize("CreateStepOne", ""));
  dispatch(initialize("CreateStepThree", ""));
  dispatch(initialize("CreateStepTwo", ""));
  dispatch(initialize("SkeletonUserProfile", ""));
  dispatch(initialize("Messages", ""));
  dispatch(initialize("VerifiedProfilePage", ""));
  dispatch(initialize("ChooseCity", ""));
  dispatch(initialize("LocationPopup", ""));

  dispatch(reset("signupStep2"));
  dispatch(reset("DatePreview"));
  dispatch(reset("RegisterFormMale"));
  dispatch(reset("signupStep3"));
  dispatch(reset("RegisterForm"));
  dispatch(reset("forgotpassword"));
  dispatch(reset("LoginForm"));
  dispatch(reset("SecondStep"));
  dispatch(reset("ThirdStep"));
  dispatch(reset("CreateStepFour"));
  dispatch(reset("CreateStepOne"));
  dispatch(reset("CreateStepThree"));
  dispatch(reset("CreateStepTwo"));
  dispatch(reset("SkeletonUserProfile"));
  dispatch(reset("Messages"));
  dispatch(reset("VerifiedProfilePage"));
  dispatch(reset("ChooseCity"));
  dispatch(reset("LocationPopup"));
};

export const restore = (savedState) => {
  return (dispatch) => {
    dispatch(restoreState(savedState));
  };
};

export function registration(data, loader) {
  return { type: SIGNUP1, payload: data, loader: loader };
}

export function login(data, setLoading) {
  return { type: LOGIN, payload: data, loader: setLoading };
}

export function signupStep2(data, setLoader, onSuccess) {
  return { type: SIGNUP2, payload: data, loader: setLoader, onSuccess };
}

export function signupStep3(data, setLoader, onSuccess) {
  return { type: SIGNUP3, payload: data, loader: setLoader, onSuccess };
}

export function signupStep4(data, setLoader, handleUpdateRoutePage) {
  return {
    type: SIGNUP4,
    payload: data,
    loader: setLoader,
    handleUpdateRoutePage: handleUpdateRoutePage,
  };
}

export const updateUserTokens = (interestedTokens, superInterestedTokens) => {
  return {
    type: UPDATE_USER_TOKENS,
    payload: {
      interested_tokens: interestedTokens,
      super_interested_tokens: superInterestedTokens,
    },
  };
};

export const updateUserChats = (chatCount) => {
  return {
    type: UPDATE_USER_CHATS,
    payload: {
      chat_tokens: chatCount,
    },
  };
};
