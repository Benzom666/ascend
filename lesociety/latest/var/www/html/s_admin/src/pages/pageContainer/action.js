import axios from "axios";
import moment from "moment";
import Utils from "../../utility";

export const getUserList = (status = "", offSet = 1, updatedDetails) => {

  return (dispatch, getState) => {
    dispatch({
      type: "SET_LOADING",
      payload: {
        loading: true,
      },
    });
    const { per_page, search, userlist } =
      getState().userListReducer;
      let pathname =  `?user_name=${search}&status=${status}&per_page=${per_page}
      &current_page=${offSet}`;
      if(status === 10) {
        pathname = `?user_name=${search}&updated_details=true&per_page=${per_page}&current_page=${offSet}`;
      }
      if(status === 11) {
        pathname = `?user_name=${search}&document_uploaded=true&per_page=${per_page}&current_page=${offSet}`;
      }

    Utils.api.getApiCall(
      Utils.endPoints.user,
      pathname,
      (respData) => {
        dispatch({
          type: Utils.ActionName.USER_LIST,
          payload: {
            userlist: search.length
              ? respData?.data?.data?.users
              : [...respData?.data?.data?.users],
            pagination: respData?.data?.data?.pagination,
            loading: false,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
        dispatch({
          type: "SET_LOADING",
          payload: {
            loading: false,
          },
        });
      }
    );
  };
};
// get Default Message List
export const getDefaultMsgList = (msgType) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.getDefaultMsgList,
      msgType ? `?messageType=${msgType}` : "",
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_DEFAULT_MSG,
          payload: {
            defaultMsg: respData.data.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// user profile
export const getUserProfile = (username, pushToUserPage = false) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.userProfile,
      `?user_name=${username}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.USER_PROFILE,
          payload: {
            userProfileData: respData?.data?.data?.user,
            pushToUserPage
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// user status counter
export const getUserStatusCounter = () => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.userStatusCounter,
      ``,
      (respData) => {
        dispatch({
          type: Utils.ActionName.USER_COUNTER,
          payload: {
            usersAdminStatus: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get all request
export const getAllRequest = () => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.getRequest,
      ``,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_REQUEST,
          payload: {
            // usersAdminStatus: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// get influencer
export const getInfluencer = (status = "", offSet = 1, active = "") => {
  return (dispatch, getState) => {
    dispatch({
      type: "SET_LOADING",
      payload: {
        loading: true,
      },
    });
    const {
      per_page,
      influencerList,
      current_page = 1,
      search,
    } = getState().userListReducer;
    Utils.api.getApiCall(
      Utils.endPoints.getInfluencer,
      `?name=${search}&location=&status=${status}&assetOnly=&per_page=${per_page}&current_page=${offSet}&active=${active}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_INFLUENCER,
          payload: {
            influencerList: search.length
              ? respData?.data?.data?.influencer
              : [...influencerList, ...respData?.data?.data?.influencer],
            loading: false,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// get country list
export const getCountryList = () => {
  return (dispatch) => {
    dispatch({
      type: "SET_LOADING",
      payload: {
        loading: true,
      },
    });
    Utils.api.getApiCall(
      Utils.endPoints.getCountry, '',
      // `?name=${search}&location=&status=${status}&assetOnly=&per_page=${per_page}&current_page=${offSet}&active=${active}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_COUNTRY,
          payload: {
            countryList: respData?.data?.data,
            loading: false,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// get influencer email exists
export const getInfluencerEmailExists = (email) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.influencerEmail,
      `?email=${email}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_EXIST_MAIL,
          payload: {
            existEmailScuse: respData?.data?.data?.message,
            existEmail: "",
          },
        });
      },
      (error) => {
        dispatch({
          type: Utils.ActionName.GET_EXIST_MAIL,
          payload: {
            existEmail: error?.data?.data[0]?.message,
            existEmailScuse: "",
          },
        });
      }
    );
  };
};
// get Influencer exists
export const getInfluencerExistCode = (code) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.influencerExistCode,
      `?code=${code}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_INFLUENCER_EXIST,
          payload: {
            existCodeMsg: respData?.data?.message,
            existCode: "",
          },
        });
      },
      (error) => {
        dispatch({
          type: Utils.ActionName.GET_INFLUENCER_EXIST,
          payload: {
            existCode: error?.data?.data[0]?.message,
            existCodeMsg: "",
          },
        });
      }
    );
  };
};
// get Influencers Stats
export const getInfluencerStats = (username) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.getInfluencersStats,
      ``,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_INFLUENCER_STATS,
          payload: {
            influencerStats: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get Influencers Stats
export const getGeoStats = (
  country = "",
  gender = "",
  locationType = "country"
) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.getGeo,
      `?status=2&locationType=${locationType}&country=${country}&gender=${gender}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_GEO_STATS,
          payload: {
            geoStats: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// influencer update status
export const influencerCreate = (formData) => {
  return (dispatch) => {
    Utils.api.postApiCall(
      Utils.endPoints.influencerCreate,
      formData,
      (respData) => {
        Utils.showAlert(1, "Influence created successfully!");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// influencer update status
export const influencerUpdateStatus = (
  status,
  email,
  active,
  currentStatus
) => {
  return (dispatch) => {
    const dataToSend = {
      status,
      email,
      active,
    };
    Utils.api.putApiCall(
      Utils.endPoints.influencerUpdateStatus,
      dataToSend,
      (respData) => {
        Utils.showAlert(1, "Influencer status updated.");
        dispatch({
          type: Utils.ActionName.GET_INFLUENCER,
          payload: { influencerList: [] },
        });
        dispatch(getInfluencer(currentStatus));
        dispatch(getInfluencerStats());
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// influencer detail update
export const influencerUpdate = (name, email, promo, code, source) => {
  return (dispatch) => {
    const dataToSend = {
      name,
      email,
      promo,
      code,
      source,
    };
    Utils.api.putApiCall(
      Utils.endPoints.influencerPut,
      dataToSend,
      (respData) => {
        Utils.showAlert(1, "Influencer updated.");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// post Send Request
export const postSetRequest = () => {
  return (dispatch) => {
    // const { password } = values;
    const dataToSend = {
      // password,
    };
    Utils.api.postApiCall(
      Utils.endPoints.postSetRequest,
      dataToSend,
      (respData) => { },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// post send default msg
export const postSendDefaulMsg = (
  messageType,
  message_id,
  user_email_list,
  post_ids,
  currentStatus,
  source
) => {
  return (dispatch) => {
    // const { password } = values;
    const dataToSend = {
      messageType,
      message_id,
      user_email_list,
      post_ids,
    };
    Utils.api.postApiCall(
      Utils.endPoints.sendDefaultMsg,
      dataToSend,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_ALL_DATES,
          payload: { rowSelected: [] }
        });
        if(source === "user"){
          dispatch({
            type: Utils.ActionName.USER_LIST,
            payload: { tab: 1, search: "", per_page: 10, userlist: [],  isAPISuccess: true },
          });
          dispatch(getUserStatusCounter());
          dispatch(getUserList(currentStatus, 1, ""));
        }
        else if(source === "dates"){
          dispatch({
            type: Utils.ActionName.USER_LIST,
            payload: { tab: 1, search: "", per_page: 10, datesList: [],  isAPISuccess: true },
          });
          dispatch(getDateStats());
          dispatch(getAllDates(currentStatus, 1, ""));
        }
        else if(source === "user-profile") {
          dispatch(
            getUserProfile(currentStatus)
          )
        }
        Utils.showAlert(1, "Request mail sent to users");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// post verfiy user
export const postVerfiyUser = (email, currentStatus) => {
  return (dispatch) => {
    Utils.api.postApiCall(
      Utils.endPoints.userVerify,
      { email },
      (respData) => {
        console.log(respData.message)
        Utils.showAlert(1, respData.message);
        dispatch({
          type: Utils.ActionName.USER_LIST,
          payload: { tab: 1, search: "", per_page: 10, userlist: [], isAPISuccess: true },
        })
        if(currentStatus) {
          dispatch(getUserStatusCounter());
          dispatch(getUserList(currentStatus));
        }
      },
      (error) => {
        let { data } = error;
        console.log(data?.message);
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// post update user status
export const postUpdateUserStatus = (status, emails, source, currentStatus) => {
  return (dispatch) => {
    const dataToSend = {
      status,
      emails,
    };
    Utils.api.postApiCall(
      Utils.endPoints.updateUserStatus,
      dataToSend,
      (respData) => {
        Utils.showAlert(1, respData?.data.message);
        console.log(respData?.data.message);
        // Utils.showAlert(1, "Tagline and description updated successfully!")
        if (source === "user-list") {
          dispatch({
            type: Utils.ActionName.GET_ALL_DATES,
            payload: { userlist: [] },
          });
          dispatch(getUserStatusCounter());
          dispatch(getUserList(currentStatus));
        }
        else if (source === "user-profile") {
          dispatch(getUserProfile(currentStatus, true));
        }
      },
      (error) => {
        console.log(error.data)
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// update selfie and documents
export const updateDocumentVerification = (email, status, len) => {
  return (dispatch) => {

    const dataToSend = {
      email
    };
    Utils.api.putApiCall(
      Utils.endPoints.verifyDocuments,
      dataToSend,
      (respData) => {
        dispatch({
          type: "SET_LOADING",
          payload: {
            userlist: [],
            per_page: len
          },
        });
        Utils.showAlert(1, respData?.data.message);
        dispatch(getUserStatusCounter())
        dispatch(getUserList(status, 1));
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// post update date status
export const postUpdateDateStatus = (status, ids, currentStatus) => {
  return (dispatch) => {
    const dataToSend = {
      status,
      ids,
    };
    Utils.api.postApiCall(
      Utils.endPoints.updateDateStatus,
      dataToSend,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_ALL_DATES,
          payload: { datesList: [], isAPISuccess: true },
        });
        dispatch(getDateStats());
        dispatch(getAllDates(currentStatus));
        Utils.showAlert(1, "Post Blocked successfully!");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};


// post remove from new section
export const postRemove = (status, ids, currentStatus) => {
  return (dispatch) => {
    const dataToSend = {
      status,
      ids,
    };
    Utils.api.postApiCall(
      Utils.endPoints.postRemove,
      dataToSend,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_ALL_DATES,
          payload: { datesList: [], isAPISuccess: true },
        });
        dispatch(getDateStats());
        dispatch(getAllDates(currentStatus));
        Utils.showAlert(1, "Post Remove successfully!");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

export const getDeactivateUser = () => {
  return (dispatch, getState) => {
    const { per_page, current_page, search } = getState().userListReducer;
    Utils.api.getApiCall(
      Utils.endPoints.user,
      `?user_name=${search}&location=&status=3&assetOnly=&per_page=${per_page}&current_page=${current_page}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.USER_LIST,
          payload: {
            userlist: search.length
              ? respData?.data?.data?.users
              : respData?.data?.data?.users,
            pagination: respData?.data?.data?.pagination,
          },
        });
        // navigate("/dashboard");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

export const getPendingUser = () => {
  return (dispatch, getState) => {
    const { per_page, current_page, search } = getState().userListReducer;
    Utils.api.getApiCall(
      Utils.endPoints.user,
      `?user_name=${search}&location=&status=0&assetOnly=&per_page=${per_page}&current_page=${current_page}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.USER_LIST,
          payload: {
            userlist: search.length
              ? respData?.data?.data?.users
              : respData?.data?.data?.users,
            pagination: respData?.data?.data?.pagination,
          },
        });
        // navigate("/dashboard");
      },
      (error) => {
        let { data } = error;

        Utils.showAlert(2, data?.message);
        // setSubmitting(true);
      },
      { email: "", location: "", status: 0, assetOnly: true, per_page }
    );
  };
};
// get influencer
export const getAllDates = (status, offSet = 1, active = "") => {
  return (dispatch, getState) => {
    dispatch({
      type: "SET_LOADING",
      payload: {
        loading: true,
      },
    });
    const { per_page, current_page, search, datesList } =
      getState().userListReducer;
    Utils.api.getApiCall(
      Utils.endPoints.getAllDate,
      `?user_name=${search}&status=${status ? status : ""
      }&per_page=${per_page}&current_page=${offSet}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_ALL_DATES,
          payload: {
            datesList: search.length
              ? respData?.data?.data?.dates
              : [...datesList, ...respData?.data?.data?.dates],
            datesCont: respData?.data?.data?.pagination,
            loading: false,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get register dashboard
export const getRegDashboard = () => {
  return (dispatch, getState) => {
    const { rStartDate, rEndDate } = getState().userListReducer;
    let start_date = moment(rStartDate);
    let start_mins_date = start_date.format("YYYY-MM-DD");
    let end_date = moment(rEndDate).format("YYYY-MM-DD:HH:mm:ss");
    Utils.api.getApiCall(
      Utils.endPoints.getRegisterDashboard,
      `?gender=female&status=2&start_date=${start_mins_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_REGCOMPFEMALE,
          payload: {
            registerCompFemaleList: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
export const getRegDashboardMale = () => {
  return (dispatch, getState) => {
    const { rStartDate, rEndDate } = getState().userListReducer;
    let start_date = moment(rStartDate);
    let start_mins_date = start_date.format("YYYY-MM-DD");
    let end_date = moment(rEndDate).format("YYYY-MM-DD:HH:mm:ss");

    Utils.api.getApiCall(
      Utils.endPoints.getRegisterDashboard,
      `?gender=male&status=2&start_date=${start_mins_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_REGCOMPMALE,
          payload: {
            registerCompMaleList: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
export const getUnRegDashboard = () => {
  return (dispatch, getState) => {
    const { unRstartDate, unRendDate } = getState().userListReducer;
    let start_date = moment(unRstartDate);
    let start_mins_date = start_date.format("YYYY-MM-DD");
    let end_date = moment(unRendDate).format("YYYY-MM-DD:HH:mm:ss");
    Utils.api.getApiCall(
      Utils.endPoints.getRegisterDashboard,
      `?gender=female&status=1&start_date=${start_mins_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_REGUNCOMPFEMALE,
          payload: {
            registerUnCompFemaleList: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
export const getUnRegDashboardMale = () => {
  return (dispatch, getState) => {
    const { unRstartDate, unRendDate } = getState().userListReducer;
    let start_date = moment(unRstartDate);
    let start_mins_date = start_date.format("YYYY-MM-DD");
    let end_date = moment(unRendDate).format("YYYY-MM-DD:HH:mm:ss");
    Utils.api.getApiCall(
      Utils.endPoints.getRegisterDashboard,
      `?gender=male&status=1&start_date=${start_mins_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_REGUNCOMPMALE,
          payload: {
            registerUnCompMaleList: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get country
export const getCountry = (status, active) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.getCountry,
      ``,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_ALL_DATES,
          payload: {
            // datesList: respData?.data?.data?.dates,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get date stats
export const getDateStats = (status, active) => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.datestats,
      ``,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_DATES_STATS,
          payload: {
            datesStats: respData?.data?.data,
          },
        });
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};
// get dashboard total user stats
export const getDashboardStats = (status="", start_date = "", end_date = "") => {
  return (dispatch) => {
    Utils.api.getApiCall(
      Utils.endPoints.datedashboardstats, // '' ,{start_date, end_date, status: []},
      `?status=${status}&start_date=${start_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_DASHBOARD_STATS,
          payload: {
            dashboardStats: respData?.data?.data[0],
          },
        });
        Utils.showAlert(1, "Total users data fetched successfully");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(
          2,
          typeof data?.message === "string" ? data?.message : undefined
        );
      }
    );
  };
};
export const getDashboardStatsNew = (status="", start_date = "", end_date = "") => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.datedashboardstats,
      `?status=${status}&start_date=${start_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_DASHBOARDNEW_STATS,
          payload: {
            dashboardStatsNew: respData?.data?.data,
          },
        });
        Utils.showAlert(1, "New users data fetched successfully");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(
          2,
          typeof data?.message === "string" ? data?.message : undefined
        );
      }
    );
  };
};
export const getDashboardStatsDeactive = (status="", start_date = "", end_date = "") => {
  return (dispatch, getState) => {
    Utils.api.getApiCall(
      Utils.endPoints.datedashboardstats,
      `?status=${status}&start_date=${start_date}&end_date=${end_date}`,
      (respData) => {
        dispatch({
          type: Utils.ActionName.GET_DASHBOARDDEACTIVATE_STATS,
          payload: {
            dashboardStatsDeactive: respData?.data?.data,
          },
        });
        Utils.showAlert(1, "Deactivate users data fetched successfully");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(
          2,
          typeof data?.message === "string" ? data?.message : undefined
        );
      }
    );
  };
};
// create country
export const createCountry = (dataToSend) => {
  return (dispatch) => {
    Utils.api.postApiCall(
      Utils.endPoints.postCountry,
      dataToSend,
      (respData) => {
        dispatch(getCountryList());
        Utils.showAlert(1, "Country created successfully!");
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.data?.name || data?.message);
      }
    );
  };
};
// delete influencer
export const deleteInfluencer = (email, status) => {
  return (dispatch) => {
    Utils.api.deleteApiCall(
      Utils.endPoints.deleteInf,
      { data: { email: email } },
      (respData) => {
        Utils.showAlert(1, "Influence Delete successfully!");
        dispatch(getInfluencer(status));
        dispatch(getInfluencerStats());
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// delete country
export const deleteCountry = (name) => {
  return (dispatch) => {
    Utils.api.deleteApiCall(
      Utils.endPoints.deleteCountry,
      { data: { name } },
      (respData) => {
        Utils.showAlert(1, "Country removed successfully!");
        dispatch(getCountryList());
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.message);
      }
    );
  };
};

// post country
export const updateCountryName = (formData) => {
  return (dispatch) => {
    Utils.api.putApiCall(
      Utils.endPoints.deleteCountry,
      { ...formData },
      (respData) => {
        Utils.showAlert(1, "Country name updated successfully!");
        dispatch(getCountryList());
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.data?.name || data?.message);
      }
    );
  };
};

// get register user count
export const getRegisterUserCount = (formData) => {
  return (dispatch) => {
    Utils.api.getApiCall(
      Utils.endPoints.registerUserCount,
      "",
      (respData) => {// registerUserCount
        console.log(respData);
        dispatch({
          type: Utils.ActionName.USER_LIST,
          payload: {
            registerUserCount: respData?.data?.data,
          },
        });
        // Utils.showAlert(1, "User");
        // dispatch(getCountryList());
      },
      (error) => {
        let { data } = error;
        Utils.showAlert(2, data?.data?.name || data?.message);
      }
    );
  };
};
