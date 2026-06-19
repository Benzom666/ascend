const endPoint = {
  login: "user/login",
  forgotPassword: "user/forget-password",
  resetPassword: "user/reset-password",
  user: "user",
  userProfile: "user/user-by-name",
  userStatusCounter: "user/users-stats",
  getRequest: "request",
  getInfluencer: "influencer",
  getInfluencersStats: "influencer/stats",
  postSetRequest: "request/send-request",
  getDefaultMsgList: "defaultMessage",
  sendDefaultMsg: "defaultMessage/requestMessage",
  userVerify: "user/verify-taglinedescription",
  updateUserStatus: "user/update-status",
  influencerUpdateStatus: "influencer/update-status",
  influencerCreate: "influencer",
  influencerEmail: "influencer/exists",
  influencerExistCode:"influencer/code-exists",
  getAllDate: "date",
  updateDateStatus: "date/update-status",
  postRemove: "date/seen-by-ids",
  getRegisterDashboard: "dashboard/registration",
  registerUserCount: "dashboard/users-counts-with-percentage",
  getCountry: "country",
  postCountry: "country",
  getGeo: "dashboard/geo-stats",
  deleteInf: "influencer",
  influencerPut : "influencer",
  datestats: "date/stats",
  datedashboardstats: "dashboard/total-users",
  deleteCountry: "country",
  verifyDocuments: "user/verify-document",

  // Profiles Console (read-only oversight)
  consoleProfiles: "admin-console/profiles",
  consoleProfile: "admin-console/profiles/", // + :id
  consoleRoomMessages: "admin-console/chatrooms/", // + :roomId + /messages

};
export default endPoint;
