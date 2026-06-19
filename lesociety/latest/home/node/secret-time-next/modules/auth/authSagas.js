import { call, put, race, take, takeLatest } from "redux-saga/effects";
import { apiRequest, showToast } from "../../utils/Utilities";
import { AUTHENTICATE, AUTHENTICATE_UPDATE } from "./actionConstants";
import { stopSubmit, reset } from "redux-form";
import Router from "next/router";
import { SIGNUP1, SIGNUP2, SIGNUP3, LOGIN, SIGNUP4 } from "./actionConstants";

export function* login(action) {
  console.log('=== SAGA LOGIN START ===', action);
  action.loader(true);
  try {
    console.log('=== API REQUEST START ===', {
      url: `user/login`,
      payload: action.payload
    });
    const response = yield race({
      success: call(apiRequest, {
        data: action.payload,
        method: "POST",
        url: `user/login`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });
    if (response.success) {
      // API returns data wrapped in { data: { data: { user info } } }
      // response.success is the axios response, so:
      // response.success.data = { data: { data: { token, ...user } }, status, error, message }
      // response.success.data.data = { data: { token, ...user } }
      // response.success.data.data.data = { token, ...user }
      const userData = response.success.data.data.data || response.success.data.data;

      if (!userData || !userData.email) {
        action.loader(false);
        showToast("Invalid response from server", "error");
        return;
      }
      
      yield put({
        type: AUTHENTICATE,
        payload: userData,
      });
      //  showToast(response.success.data.message, 'success')
      action.loader(false);
      
      console.log('=== LOGIN DEBUG ===', {
        status: userData.status,
        step_completed: userData.step_completed,
        verified_screen_shown: userData.verified_screen_shown
      });
      
      // If user is blocked
      if (userData.status === 3) {
        console.log('Redirecting to: /auth/block');
        Router.replace("/auth/block");
      }
      // If verified user with completed profile - go straight to user list
      else if (userData.status === 2 && userData.verified_screen_shown === true && userData.step_completed === 4) {
        console.log('Redirecting to: /user/user-list');
        Router.replace("/user/user-list");
      }
      // If verified user who hasn't seen verified screen
      else if (userData.status === 2 && userData.verified_screen_shown === false) {
        console.log('Redirecting to: /user/verified');
        Router.replace("/user/verified");
      }
      // If admin requested changes
      else if (userData.request_change_fired) {
        console.log('Redirecting to: /auth/verify-profile');
        Router.replace("/auth/verify-profile");
      }
      // If profile is incomplete (step 1, 2, or 3), go to profile page
      else if (userData.step_completed === 1 || userData.step_completed === 2 || userData.step_completed === 3) {
        console.log('Redirecting to: /auth/profile (incomplete)');
        Router.replace("/auth/profile");
      }
      // Default: go to profile page
      else {
        console.log('Redirecting to: /auth/profile (default)', userData);
        Router.replace("/auth/profile");
      }
      yield put(reset("LoginForm"));
    }
  } catch (error) {
    console.log('=== LOGIN ERROR ===', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
      fullError: error
    });
    action.loader(false);
    if (error.response?.status === 401) {
      yield put(
        stopSubmit("LoginForm", {
          [error.response &&
          (error.response?.data?.message ===
            "Given user name is not registered" ||
            error.response?.data?.message ===
              "Given user email is not registered")
            ? "email"
            : "password"]: error?.response
            ? error.response.data.message
            : error.message,
        })
      );
    } else {
      showToast("Something went wrong", "error");
    }
  }
}

function* signup(data) {
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      yield put({
        type: AUTHENTICATE,
        payload: response.success.data.data,
      });
      data.loader(false);
      Router.push({
        pathname: "/auth/profile",
      });
      if (data.payload?.gender === "male") {
        yield put(reset("RegisterFormMale"));
      } else {
        yield put(reset("RegisterForm"));
      }
      yield put(reset("signupStep2"));
    }
  } catch (error) {
    data.loader(false);
    yield put(
      stopSubmit(
        data.payload?.gender === "male" ? "RegisterFormMale" : "RegisterForm",
        error?.response ? error.response.data.data : {}
      )
    );
    // showToast("Something went wrong", 'error')
  }
}

function* signupStep2(data) {
  data.loader(true);
  try {
    console.log("console from here ", data.payload);
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step2`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      const apiUser = response.success?.data?.data?.user;
      const freshToken = response.success?.data?.data?.token;
      const basePayload = apiUser || {
        description: data?.payload?.description,
        tagline: data?.payload?.tagline,
        images: data?.payload?.images,
        step_completed: 2,
        un_verified_images: data?.payload?.un_verified_images,
        un_verified_tagline: data?.payload?.un_verified_tagline,
        un_verified_description: data?.payload?.un_verified_description,
      };
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: freshToken ? { ...basePayload, token: freshToken } : basePayload,
      });
      // showToast(response.success.data.message, 'success')
      //yield put(reset('signupStep2'))
      data.loader(false);
      window.scrollTo(0, 0);
      if (typeof data.onSuccess === "function") {
        data.onSuccess();
      }
    }
  } catch (error) {
    data.loader(false);
    yield put(
      stopSubmit("signupStep2", error?.response ? error.response.data.data : {})
    );
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!" &&
      typeof window !== "undefined"
    ) {
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);
    }
    return error;
  }
}

function* signupStep3(data) {
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step3`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      const apiUser = response.success?.data?.data?.user;
      const freshToken = response.success?.data?.data?.token;
      const basePayload = apiUser || {
        height: data.payload?.height,
        is_smoker: data.payload?.is_smoker,
        occupation: data.payload?.occupation,
        max_education: data.payload?.max_education,
        step_completed: 3,
      };
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: freshToken ? { ...basePayload, token: freshToken } : basePayload,
      });
      data?.loader(false);
      window.scrollTo(0, 0);
      if (typeof data.onSuccess === "function") {
        data.onSuccess();
      }
      // showToast(response.success.data.message, 'success')
      yield put(reset("signupStep3"));
      yield put(reset("signupStep2"));
    }
  } catch (error) {
    yield put(
      stopSubmit("signupStep3", error?.response ? error.response.data.data : {})
    );
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );
    data.loader(false);

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!" &&
      typeof window !== "undefined"
    ) {
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);
    }
    return error;
  }
}

function* signupStep4(data) {
  // debugger
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step4`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      const freshToken = response.success?.data?.data?.token;
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: freshToken
          ? { step_completed: 4, token: freshToken }
          : { step_completed: 4 },
      });
      data.loader(false);
      window.scrollTo(0, 0);
      if (typeof data.handleUpdateRoutePage === "function") {
        data.handleUpdateRoutePage();
      }
      // showToast(response.success.data.message, 'success')
    }
  } catch (error) {
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );
    data.loader(false);

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!" &&
      typeof window !== "undefined"
    ) {
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);
    }
    return error;
  }
}

export default function* authWatcher() {
  yield takeLatest(SIGNUP1, signup);
  yield takeLatest(SIGNUP2, signupStep2);
  yield takeLatest(SIGNUP3, signupStep3);
  yield takeLatest(SIGNUP4, signupStep4);
  yield takeLatest(LOGIN, login);
}
