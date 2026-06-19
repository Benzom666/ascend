const helper = require("./helper");

module.exports = (req, res, next) => {
  const role = Number(req?.user?.role ?? req?.datajwt?.userdata?.role ?? 0);

  if (role !== 2) {
    return res
      .status(403)
      .json(helper.errorResponse([], 403, "Admin access required."));
  }

  return next();
};
