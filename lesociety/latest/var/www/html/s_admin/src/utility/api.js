import Utils from ".";
import axios from "axios";

/**
 * function to check if code matches to user invalid.
 * @param data
 */
export const checkUserValidation = (data) => {
  if (data) {
    const { status } = data,
      { sessionExpired, unauthorized, accessDenied } =
        Utils.constants.api_error_code;

    if (status) {
      return (
        status === sessionExpired ||
        status === unauthorized ||
        status === accessDenied
      );
    }
    return false;
  }
  return false;
};

/**
 *
 * @param endPoint api end point
 * @param params request data
 * @param successCallback function for handle success response
 * @param errorCallback  function for handle error response
 */
const postApiCall = async (
  endPoint,
  params,
  successCallback,
  errorCallback
) => {
  await Utils.constants.axios
    .post(endPoint, params)
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        let payload = {
          data: {
            statusCode: 408,
          },
        };
        errorCallback(payload);
      } else if (error.response) {
        let data = error.response.data;
        if (checkUserValidation(data)) {
          //if user session expired

          logOutApiCall(error).then((res) => {
            successCallback(res)
          }).catch((err) => {
            errorCallback(err.response);
          });
        } else {
          errorCallback(error.response);
        }
      } else if (!error.response) {
        let payload = {
          data: {
            statusCode: "",
            message: "Please check your internet connection!",
          },
        };
        errorCallback(payload);
      }
    });
};
/**
 *
 * @param endPoint api end point
 * @param params api url parameter
 * @param successCallback function for handle success response
 * @param errorCallback function for handle error response
 */
const getApiCall = async (
  endPoint,
  params = "",
  successCallback,
  errorCallback,
  data = {}
) => {
  const axiosFunc = axios.create({
    timeout: 100000,
    baseURL: Utils.constants.API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      //      Content-Type: 'application/x-www-form-urlencoded'

    },
  })
  await axiosFunc
    .get(Utils.constants.apiUrl + endPoint + params, data)
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      if (error.response?.data?.status == 401) {
        localStorage.removeItem("accessToken");
        // document.location.reload(true); 
        // navigate("/");
      }
      if (error.code === "ECONNABORTED") {
        let payload = {
          data: {
            statusCode: 408,
          },
        };
        errorCallback(payload);
      } else if (error.response) {
        let data = error.response.data;
        if (checkUserValidation(data)) {
          //if user session expired
          logOutApiCall(error).then((res) => {
            successCallback(res)
          }).catch((err) => {
            errorCallback(err.response);
          });
        } else {

          errorCallback(error.response);
        }
      } else if (!error.response) {
        let payload = {
          data: {
            statusCode: "",
            // message: "Please check your internet connection!",
            message: "Internal server issue, please try again later",
          },
        };
        errorCallback(payload);
      }
    });
};

/**
 *
 * @param endPoint api end point
 * @param params api request data
 * @param successCallback function for handle success response
 * @param errorCallback function for handle error response
 */
const deleteApiCall = async (
  endPoint,
  params,
  successCallback,
  errorCallback
) => {
  await Utils.constants.axios
    .delete(endPoint, params)
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        let payload = {
          data: {
            statusCode: 408,
          },
        };
        errorCallback(payload);
      } else if (error.response) {
        let data = error.response.data;
        if (checkUserValidation(data)) {
          logOutApiCall(error).then((res) => {
            successCallback(res)
          }).catch((err) => {
            errorCallback(err.response);
          });
        } else {
          errorCallback(error.response);
        }
      } else if (!error.response) {
        let payload = {
          data: {
            statusCode: "",
            // message: "Please check your internet connection!",
            message: "Internal server issue, please try again later",
          },
        };
        errorCallback(payload);
      }
    });
};

/**
 *
 * @param endPoint api end point
 * @param params api request data
 * @param successCallback function for handle success response
 * @param errorCallback function for handle error response
 */
const patchApiCall = (
  endPoint,
  params,
  successCallback,
  errorCallback
) => {
  Utils.constants.axios
    .patch(endPoint, params)
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        let payload = {
          data: {
            statusCode: 408,
          },
        };
        errorCallback(payload);
      } else if (error.response) {
        let data = error.response.data;
        if (checkUserValidation(data)) {
          //if user session expired
          logOutApiCall(error).then((res) => {
            successCallback(res)
          }).catch((err) => {
            errorCallback(err.response);
          });
        } else {
          errorCallback(error.response);
        }
      } else if (!error.response) {
        let payload = {
          data: {
            statusCode: "",
            // message: "Please check your internet connection!",
            message: "Internal server issue, please try again later",
          },
        };
        errorCallback(payload);
      }
    });
};
/**
 *
 * @param endPoint api end point
 * @param params request data
 * @param successCallback function for handle success response
 * @param errorCallback  function for handle error response
 */
const putApiCall = async (
  endPoint,
  params,
  successCallback,
  errorCallback
) => {
  await Utils.constants.axios
    .put(endPoint, params)
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      if (error.status === "ECONNABORTED") {
        let payload = {
          data: {
            statusCode: 408,
          },
        };
        errorCallback(payload);
      } else if (error.response) {
        let data = error.response.data;
        if (checkUserValidation(data)) {
          //if user session expired
          logOutApiCall(error).then((res) => {
            successCallback(res)
          }).catch((err) => {
            errorCallback(err.response);
          });
        } else {
          errorCallback(error.response);
        }
      } else if (!error.response) {
        let payload = {
          data: {
            statusCode: "",
            // message: "Please check your internet connection!",
            message: "Internal server issue, please try again later",
          },
        };
        errorCallback(payload);
      }
    });
};
/**
 * Logout API
 */
const logOutApiCall = async (error) => {
  if (!navigator.onLine) {
    //check if user is online or not
    Utils.showAlert(3, "Please check your internet connection!");
    return;
  }
  const originalRequest = error.config
  Utils.constants.getAccessToken();
  let data = {
    refresh_token: localStorage.getItem("refreshToken"),
    phone_code: localStorage.getItem("countryCode"),
    phone_number: `${localStorage.getItem("phone")}`,
    os_type: 3,
    phone_id: localStorage.getItem('phoneId'),
    user_role: 3,
  }
  const accessTokenResposnse = await Utils.constants.axios
    .put(Utils.endPoints.refreshToken, data)
    .then((response) => {
      return response;
    })
  localStorage.setItem("accessToken", accessTokenResposnse.data.access_token);
  localStorage.setItem("refreshToken", accessTokenResposnse.data.refresh_token);
  originalRequest.headers["LiviaApp-Token"] =
    accessTokenResposnse.data.access_token;
  return axios(originalRequest)
};

/**
 * export all function
 */
const api = {
  putApiCall,
  getApiCall,
  postApiCall,
  patchApiCall,
  deleteApiCall,
  logOutApiCall,
  checkUserValidation,
};


export default api
