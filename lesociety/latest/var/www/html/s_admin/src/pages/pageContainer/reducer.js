import Utils from "../../utility";

const registerBackDate = new Date();
registerBackDate.setDate(registerBackDate.getDate() - 7);
const registerUnVefifiedBackDate = new Date();
registerUnVefifiedBackDate.setDate(registerUnVefifiedBackDate.getDate() - 7);

const initialState = {
  userlist: [],
  userProfileData: [],
  usersAdminStatus: [],
  influencerStats: [],
  geoStats: [],
  defaultMsg: [],
  influencerList: [],
  datesList: [],
  datesCont: [],
  registerCompFemaleList: [],
  registerCompMaleList: [],
  registerUnCompFemaleList: [],
  registerUnCompMaleList: [],
  datesStats: [],
  dashboardStats: [],
  dashboardStatsNew: [],
  dashboardStatsDeactive: [],
  existEmail: "",
  existEmailScuse: "",
  existCodeMsg: "",
  existCode: "",
  pagination: {},
  per_page: 10,
  search: "",
  current_page: "1",
  tab: 1,
  rowSelected: [],
  // emails:[],
  rStartDate: registerBackDate,
  rEndDate: new Date(),
  unRstartDate: registerUnVefifiedBackDate,
  unRendDate: new Date(),
  loading: false,
  countryList: [],
  isAPISucceess: false,
  allCountryList: [],
  registerUserCount: {},
  pushToUserPage: false,
  page: 1
};
export const userListReducer = (state = initialState, action) => {
  switch (action.type) {
    case Utils.ActionName.USER_LIST:
      return {
        ...state,
        ...action.payload,
      };
    case Utils.ActionName.GET_TOKEN:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.USER_PROFILE}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.USER_COUNTER}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_INFLUENCER_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_DEFAULT_MSG}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_INFLUENCER}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_GEO_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_DATES_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_DASHBOARD_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_DASHBOARDNEW_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_DASHBOARDDEACTIVATE_STATS}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_ALL_DATES}`:
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_PAGE':
      return {
        ...state,
        ...action.payload
      };
    case `${Utils.ActionName.GET_EXIST_MAIL}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_INFLUENCER_EXIST}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_REGCOMPFEMALE}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_REGCOMPMALE}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_REGUNCOMPFEMALE}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_REGUNCOMPMALE}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_COUNTRY}`:
      return {
        ...state,
        ...action.payload,
      };
    case `${Utils.ActionName.GET_ALL_COUNTRY}`:
      return {
        ...state,
        allCountryList: action.payload,
      };
    default:
      return { ...state };
  }
};
