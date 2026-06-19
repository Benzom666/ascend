import axios from "axios";

const api_header_code = {
  alreadyEnabled2fa: 2003,
};
const api_error_code = {
  unauthorized: 401,
  accessDenied: 430,
  sessionExpired: 440,
  validationError: 400,
  emailNotVerified: 403,
};

const api_success_code = {
  postSuccess: 201,
  success: 200,
};

const insuranceCompany = {
  MAD: 11,
};

const response_alert = {
  INFORMATION_ALERT_WITHOUT_ACTION: 1,
  ALERT_WITH_ACTION: 2,
  ALERT_WITHOUT_ACTION: 3,
  CONNECTION_ERROR: 4,
  CONTACT_SUPPORT: 5,
};

const user_status = {
  ACTIVE: "1",
  NOT_ACTIVE: "2",
  MODERATION: "3",
  REFUSAL_TO_REGISTRATION: "4",
  BAN: "5",
  IN_REGISTRATION_PROCESS: "6",
};

const policy_status = {
  ACTIVE: "1",
  EXPIRED: "2",
  BALANCE_INSUFFICIENT: "3",
  BENEFITS_UPDATING: "4",
  BENEFITS_CHECK_FROM_LOCAL: "1",
  CLAIM_NOT_ALLOWED: "5",
};
// const API_URL = "https://usa.liviaapp.com";
// const API_URL = "https://liviastaging.appskeeper.in";
// const API_URL = "https://staging.liviaapp.com";
const normalizeApiUrl = (url) => {
  const normalizedUrl = (url || "https://lesociety-api.onrender.com/api/v1").replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api/v1")
    ? normalizedUrl
    : `${normalizedUrl}/api/v1`;
};

const API_URL = normalizeApiUrl(
  process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL
);

const $axios = axios.create({
  timeout: 100000,
  baseURL: API_URL,
  // baseURL: `https://staging.liviaapp.com/api`,
  // baseURL: `https://usa.liviaapp.com/api`,
  // baseURL: "https://usa.liviaapp.com/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
  },
});

/**
 * function to slugify url entered by user for business link
 * @param url
 */
// const slugifyUrl = (url: string) => {
//   var slugify = require("slugify");
//   return slugify(url, { remove: /[*+~.()'"!:@#$%!]/g, lower: true });
// };

// Retrieving the bucket name from env variable
const Bucket = process.env.REACT_APP_BUCKET_NAME;
const BASE_S3_URL = process.env.REACT_APP_S3_BASE_PATH;

/**
 * constant variable for the website
 */
const constant = {
  API_URL,
  Bucket,
  BASE_S3_URL,
  apiUrl: "",
  insuranceCompany,

  // slugifyUrl,
  axios: $axios,
  api_error_code,
  api_header_code,
  api_success_code,
  response_alert,
  user_status,
  policy_status,
  hasConnection: navigator.onLine,
  mainMenuLinksArray: ["/dashboard"],
  spaceRegex: /^\S*$/,
  // eslint-disable-next-line
  passwordRegex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9!_@./#&+-\d]{8,}$/,
  // eslint-disable-next-line
  emailRegex:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};
export default constant;
