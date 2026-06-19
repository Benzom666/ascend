const { createLogger } = require("../../lib/logger");
const logger = createLogger("user");

/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const async = require("async");
const bcrypt = require("bcrypt");
const randomNumber = require("random-number");
const mongoose = require("mongoose");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/user");
const helper = require("../../helpers/helper");
const {
    normalizeModeratedText,
    getModerationError,
} = require("../../helpers/contentModeration");
const mails = require("../../helpers/mails");
const { sendMail, deleteNotificationById } = require("./notification");
const moment = require("moment-timezone");

const issueFreshAccessToken = (user) => {
    if (!user) return null;
    try {
        const authService = require("../../lib/auth");
        return authService.generateAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            gender: user.gender,
        });
    } catch (err) {
        logger.error("Failed to issue fresh access token", err);
        return null;
    }
};

const hasPendingProfileDetails = (user) =>
    !!user &&
    !!user.un_verified_profile_details &&
    Object.keys(user.un_verified_profile_details).length > 0;

const applyPendingProfileDetails = (user) => {
    if (!hasPendingProfileDetails(user)) {
        user.un_verified_profile_details = {};
        return;
    }

    Object.entries(user.un_verified_profile_details).forEach(([key, value]) => {
        user[key] = value;
    });
    user.un_verified_profile_details = {};
};

/**
 * Listing of users based on full_name, sort and order
 * Default current_page is 1 and per_page will be 10
 * @param current_page int
 * @param per_page int
 * @param sort string
 * @param order int
 * @param full_name string ( fullname %fullname% )
 */

exports.getAllUsers = async (req, res) => {
    let {
        current_page = 1,
        per_page = 10,
        email = "",
        sort = "created_at",
        order = -1,
        first_name = "",
        last_name = "",
        location = "",
        status = "",
        user_name = "",
        updated_details = false,
        document_uploaded = false,
    } = req.query;

    current_page = parseInt(current_page);
    per_page = parseInt(per_page);

    let query = {
        status: { $ne: 4 },
        role: { $eq: 1 },
        ...(email.length && { email: { $regex: new RegExp(`^${email}`, "i") } }),
        ...(location.length && { location: { $regex: new RegExp(`^${location}`, "i") } }),
        ...(first_name.length && { first_name: { $regex: new RegExp(`^${first_name}`, "i") } }),
        ...(last_name.length && { last_name: { $regex: new RegExp(`^${last_name}`, "i") } }),
        ...(user_name.length && { user_name: { $regex: new RegExp(`^${user_name}`, "i") } }),
        ...(status.length && { status: { $eq: status } }),
    };

    // active users
    if (status == 2) {
        query = {
            ...query,
            email_verified: true,
            // documents_verified: false,
        };
    }

    if (status == 1) {
        query = {
            ...query,
            status: 1,
            email_verified: true,
            request_change_fired: false,
        };
    }
    //if status=5 passed in user listing then new user will be returned
    if (status == 5) {
        query = {
            ...query,
            status: { $eq: 1 }, // pending
            email_verified: true,
            documents_verified: false,
            request_change_fired: false,
        };
    }

    //if status=6 passed in user listing then requested user will be returned
    if (status == 6) {
        query = {
            ...query,
            status: { $ne: 0 }, // pending
            request_change_fired: true,
        };
    }

    //if updated_details passed in user listing then users with tagline and description is not verified or image is not verified
    // not verified means new image or tag/des added i.e edit screen is used.
    // this list will have approved users only ( email_verified == true and  documents_verified == false  )
    if (updated_details == "true" || updated_details == true) {
        query = {
            ...query,
            is_new: false,
            email_verified: true,
            request_change_fired: false,
            $or: [
                { un_verified_tagline: { $exists: true, $ne: "" } },
                { un_verified_description: { $exists: true, $ne: "" } },
                {
                    $expr: {
                        $gt: [
                            {
                                $size: {
                                    $objectToArray: { $ifNull: ["$un_verified_profile_details", {}] },
                                },
                            },
                            0,
                        ],
                    },
                },
                {
                    $expr: {
                        $gt: [{ $size: { $ifNull: ["$un_verified_images", []] } }, 0],
                    },
                },
            ],
            // $or: [{ tag_desc_verified: false }, { image_verified: false }],
        };
    }

    if (document_uploaded == true || document_uploaded == "true") {
        query = {
            ...query,
            selfie: { $ne: null },
            document: { $ne: null },
            documents_verified: false,
        };
    }
    if (current_page < 1)
        res.status(400).json(
            helper.errorResponse([], 400, "Invalid page number, should start with 1.")
        );

    const skip = per_page * (current_page - 1);

    try {
        const total_users = await User.countDocuments(query);
        const total_pages = Math.ceil(total_users / per_page);

        if (total_users == 0) {
            return res
                .status(400)
                .json(helper.errorResponse([], 400, "No users found.Refine your search."));
        }

        if (current_page > total_pages)
            return res
                .status(400)
                .json(
                    helper.errorResponse(
                        [],
                        400,
                        "Invalid page number, can't be greater than total pages."
                    )
                );

        User.find(query)
            .skip(skip)
            .limit(per_page)
            .sort({ [sort]: order })
            .select({
                password: 0,
                __v: 0,
            })
            .exec(async (err, users) => {
                if (!err) {
                    // Convert the 'created_at' field to 'America/Toronto' timezone for each user
                    /*    users = users.map(user => {
              user = user.toObject(); // Convert user document to a plain JavaScript object
              let utcDate = new Date(user.created_at);
              user.created_at = utcDate.toLocaleString('en-US', { timeZone: 'America/Toronto' });
              return user;
            });*/
                    users = users.map((user) => {
                        user = user.toObject(); // Convert user document to a plain JavaScript object
                        user.created_at = moment(user.created_at).tz("America/Toronto").format();
                        return user;
                    });

                    return res.status(200).json(
                        helper.successResponse(
                            {
                                users,
                                pagination: {
                                    current_page,
                                    per_page,
                                    total_users,
                                    total_pages,
                                },
                            },
                            200,
                            "All users fetched successfully !"
                        )
                    );
                }
                return res
                    .status(400)
                    .json(helper.errorResponse(err, 400, "Something went wrong."));
            });
    } catch (err) {
        return res.status(400).json(helper.errorResponse(err, 400, "Something went wrong."));
    }
};

/**
 * Get user details based on email
 * @param sort string
 * @param order int
 */
exports.getUserDetail = async (req, res) => {
    const { email = "", first_name = "", last_name = "" } = req.body;

    try {
        User.find(
            {
                email: { $regex: new RegExp(`^${email}`, "i") },
                first_name: { $regex: new RegExp(`^${first_name}`, "i") },
                last_name: { $regex: new RegExp(`^${last_name}`, "i") },
            },
            { _id: 0, password: 0, __v: 0 }
        ).exec((err, users) => {
            if (!err) {
                return res.status(200).json(
                    helper.successResponse(
                        {
                            users,
                        },
                        200,
                        "All users fetched successfully !"
                    )
                );
            }
            return res.status(400).json(helper.errorResponse(err, 400, "Something went wrong."));
        });
    } catch (err) {
        logger.debug(err);
        return res.status(400).json(helper.errorResponse(err, 400, "Something went wrong."));
    }
};

/**
 * Signup otp send for users
 */
exports.sendOtp = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }).then((user) => {
        if (user) {
            return res.status(400).json(helper.errorResponse([], 400, "Email already exists."));
        }
    });
    Otp.findOneAndRemove({ type: "EMAIL", entity: email }).then(() => {
        const random = randomNumber({ min: 1000, max: 9999, integer: true });
        const otp = new Otp({ otp: random, type: "EMAIL", entity: email });
        otp.save((err) => {
            if (err) {
                return res.status(500).json(helper.errorResponse([], 500, "Internal server error"));
            }

            const emaildata = {
                otp: random,
            };
            ejs.renderFile("views/mails/otp-email.ejs", emaildata, (err, data) => {
                if (err) {
                    logger.debug("Error: ejs.renderFile", err);
                    return res
                        .status(500)
                        .json(helper.errorResponse([], 500, "Email template could not found"));
                }
                // setup email data with unicode symbols
                const mailOptions = {
                    from: process.env.MAIL_ID_FROM, // sender address
                    to: email,
                    subject: "One time password", // Subject line
                    html: data,
                };
                // return res.status(200).json({message:'OTP sent.'});
                // send mail with defined transport object
                mails.sendMail(mailOptions, (err) => {
                    if (err) {
                        return res
                            .status(500)
                            .json(helper.errorResponse([], 500, "Email could not be sent"));
                    }
                    return res
                        .status(200)
                        .json(helper.successResponse({ email }, 200, `OTP sent to ${email}!`));
                });
            });
        });
    });
};

/**
 * Signup user
 */
/*exports.signup = (req, res) => {
  try{

    bcrypt.hash(req.body.password, 10, async (error, password) => {
      if (error) {
        return res.status(500).json(helper.errorResponse({ error: 'Couldn\'t hash password.' }, 500, 'Couldn\'t hash password.'));
      }

      let {
        email,
        location = '',
        country_code = '',
        country = '',
        province = '',
        user_name = ''
       } = req.body;


      email = email.toLowerCase();
      location = location.toLowerCase();
      country_code = country_code.toLowerCase();
      country = country.toLowerCase();
      province = province.toLowerCase();
      user_name = user_name.toLowerCase();

      const user = new User({
        ...req.body,
        email,
        location,
        country_code,
        password,
        province,
        user_name,
        step_completed: 1,
       });
       const user1 = await User.findOne({user_name: req.body.user_name.toLowerCase()});
       if (user1) {
         res.json({user_exist: "User already exists."});
       }
      let success = await user.save()
      if(success){
        delete success._doc.password
        let data = {
          ...success._doc
        }
        res.status(201).json(helper.successResponse(data, 201, 'Signed up successfully!'));
      }
    })
  }catch(error){
    res.status(400).json(helper.errorResponse({ error:error.message }, 400, 'Failed to create user'));
  }
}*/

/*exports.signup = async (req, res) => {
  try{
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    let {
      email,
      location = '',
      country_code = '',
      country = '',
      province = '',
      user_name = ''
     } = req.body;

    email = email.toLowerCase();
    location = location.toLowerCase();
    country_code = country_code.toLowerCase();
    country = country.toLowerCase();
    province = province.toLowerCase();
    user_name = user_name.toLowerCase();

    const existingUser = await User.findOne({user_name: user_name});
    if (existingUser) {
      return res.status(400).json({error: "User already exists."});
    }

    const user = new User({
      ...req.body,
      email,
      location,
      country_code,
      password: hashedPassword,
      province,
      user_name,
      step_completed: 1,
      created_at: moment().tz('America/Toronto').toDate(), // created_at with Canada's timezone
    });

    const savedUser = await user.save();
    if(savedUser){
      delete savedUser.password;
      // convert the savedUser.created_at to the Toronto timezone
      savedUser.created_at = moment(savedUser.created_at).tz('America/Toronto').format();
      return res.status(201).json(helper.successResponse(savedUser, 201, 'Signed up successfully!'));
    } else {
      throw new Error("Failed to save user.");
    }
  }catch(error){
    res.status(400).json(helper.errorResponse({ error:error.message }, 400, 'Failed to create user'));
  }
}
*/

exports.signup = async (req, res) => {
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, 10);

        let {
            email,
            location = "",
            country_code = "",
            country = "",
            province = "",
            user_name = "",
        } = req.body;

        email = email.toLowerCase();
        location = location.toLowerCase();
        country_code = country_code.toLowerCase();
        country = country.toLowerCase();
        province = province.toLowerCase();
        user_name = user_name.toLowerCase();

        const existingUser = await User.findOne({ user_name: user_name });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." });
        }

        const user = new User({
            ...req.body,
            email,
            location,
            country_code,
            password: hashedPassword,
            province,
            user_name,
            step_completed: 1,
            created_at: moment().tz("America/Toronto").toDate(), // created_at with Canada's timezone
            // Give women 15 free chats on signup, men start locked (0)
            remaining_chats: req.body.gender === "female" ? 15 : 0,
        });

        const savedUser = await user.save();
        if (savedUser) {
            let savedUserObject = savedUser.toObject();
            delete savedUserObject.password;
            // convert the savedUser.created_at to the Toronto timezone
            savedUserObject.created_at = moment(savedUser.created_at)
                .tz("America/Toronto")
                .format();
            return res
                .status(201)
                .json(helper.successResponse(savedUserObject, 201, "Signed up successfully!"));
        } else {
            throw new Error("Failed to save user.");
        }
    } catch (error) {
        res.status(400).json(
            helper.errorResponse({ error: error.message }, 400, "Failed to create user")
        );
    }
};

//const moment = require('moment-timezone');

/*exports.signup = (req, res) => {
  try {
    bcrypt.hash(req.body.password, 10, async (error, password) => {
      if (error) {
        return res.status(500).json(helper.errorResponse({ error: 'Couldn\'t hash password.' }, 500, 'Couldn\'t hash password.'));
      }

      let {
        email,
        location = '',
        country_code = '',
        country = '',
        province = '',
        user_name = ''
      } = req.body;

      email = email.toLowerCase();
      location = location.toLowerCase();
      country_code = country_code.toLowerCase();
      country = country.toLowerCase();
      province = province.toLowerCase();
      user_name = user_name.toLowerCase();

      const timezones = moment.tz.zonesForCountry('America/New_York'); // Get all timezones for America/newyork

      const created_At = {}; // Object to store timestamps for different timezones

      for (const timezone of timezones) {
        created_At[timezone] = moment().tz(timezone).toDate().format();
	logger.debug(created_At);
      }

      const user = new User({
        ...req.body,
        email,
        location,
        country_code,
        password,
        province,
        user_name,
        step_completed: 1,
        created_At:created_At
      });

      const user1 = await User.findOne({ user_name: req.body.user_name.toLowerCase() });
      if (user1) {
        res.json({ user_exist: "User already exists." });
      }

      let success = await user.save();
      if (success) {
        delete success._doc.password;
        let data = {
          ...success._doc
        };
        res.status(201).json(helper.successResponse(data, 201, 'Signed up successfully!'));
      }
    });
  } catch (error) {
    res.status(400).json(helper.errorResponse({ error: error.message }, 400, 'Failed to create user'));
  }
};*/

/**
 * Signup2 user
 * Image upload step
 */
exports.signup2 = (req, res) => {
    const {
        email,
        images,
        description,
        tagline,
        step_completed = 2,
        isUpdate = false,
        un_verified_tagline,
        un_verified_description,
        un_verified_images,
        verified_screen_shown = "",
        notificationId = "",
    } = req.body;

    User.findOne({ email }, (error, user) => {
        if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

        if (!images) {
            res.status(400).json(helper.errorResponse([], 400, "Minimum one image required."));
        }

        user.step_completed = step_completed;
        user.images = images;

        if (un_verified_images) {
            user.un_verified_images = un_verified_images;
            user.image_verified = false;
            // user.updated_details = false;
        } else if (images) {
            user.image_verified = true;
        }

        if (un_verified_tagline) {
            user.un_verified_tagline = un_verified_tagline;
            user.tag_desc_verified = false;
        } else if (tagline) {
            user.tagline = tagline;
            user.tag_desc_verified = true;
            // user.updated_details = false;
        }

        if (un_verified_description) {
            user.un_verified_description = un_verified_description;
            user.tag_desc_verified = false;
        } else if (description) {
            user.description = description;
            user.tag_desc_verified = true;
            // user.updated_details = false;
        }

        if (verified_screen_shown) {
            user.verified_screen_shown = verified_screen_shown;
        }

        user.request_change_fired = false; // user updating his/her profile so revert now.

        if (notificationId) {
            logger.debug("notificationId to delete", notificationId);
            const deletedNotification = deleteNotificationById(notificationId);
            logger.debug("deletedNotification", deletedNotification);
        }
        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
            }

            const freshToken = issueFreshAccessToken(user);
            return res
                .status(200)
                .json(
                    helper.successResponse(
                        { user: helper.userResponse(user), token: freshToken },
                        201,
                        "User updated successfully!"
                    )
                );
        });
    });
};

/**
 * Signup3 user
 *
 */
exports.signup3 = (req, res) => {
    const {
        email,
        height,
        max_education,
        is_smoker,
        occupation,
        step_completed = 3,
        isUpdate = false,
    } = req.body;

    User.findOne({ email }, (error, user) => {
        if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

        if (height && height !== "") {
            if (isUpdate) {
                user.un_verified_profile_details = {
                    ...(user.un_verified_profile_details || {}),
                    height,
                };
            } else {
                user.height = height;
            }
        }

        if (max_education && max_education !== "") {
            if (isUpdate) {
                user.un_verified_profile_details = {
                    ...(user.un_verified_profile_details || {}),
                    max_education,
                };
            } else {
                user.max_education = max_education;
            }
        }

        if (is_smoker && is_smoker !== "") {
            if (isUpdate) {
                user.un_verified_profile_details = {
                    ...(user.un_verified_profile_details || {}),
                    is_smoker,
                };
            } else {
                user.is_smoker = is_smoker;
            }
        }

        if (occupation && occupation !== "") {
            if (isUpdate) {
                user.un_verified_profile_details = {
                    ...(user.un_verified_profile_details || {}),
                    occupation,
                };
            } else {
                user.occupation = occupation;
            }
        }

        // if atleast one of the field have value
        // treat step 3 as completed
        if (height || max_education || occupation) {
            user.step_completed = step_completed;
        }

        user.request_change_fired = false; // user updating his/her profile so revert now.

        // send verification mail
        // const token = crypto.randomBytes(20).toString('hex');
        // user.email_verification_token = token;

        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
            }
            const freshToken = issueFreshAccessToken(user);
            return res
                .status(200)
                .json(
                    helper.successResponse(
                        { user: helper.userResponse(user), token: freshToken },
                        201,
                        "User updated successfully!"
                    )
                );
        });
    });
};

/**
 * Signup4 user
 *
 */
exports.signup4 = (req, res) => {
    const { email, step_completed = 4, isUpdate = false } = req.body;

    User.findOne({ email }, (error, user) => {
        if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

        // send verification mail
        let token = null;
        if (user.email_verified === false) {
            token = crypto.randomBytes(20).toString("hex");
        }

        user.email_verification_token = token;

        user.step_completed = step_completed;

        user.request_change_fired = false; // user updating his/her profile so revert now.

        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
            }

            // we will use same API to update the existing users
            // so if we are updating then no need to fire email confirmation.
            if (user.email_verified === false) {
                const emailData = {
                    to: email,
                    token,
                    host: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : req.headers.host,
                    backendHost: process.env.BACKENDEND_URL
                        ? process.env.BACKENDEND_URL
                        : req.headers.host,
                    template: "views/mails/verify-email.ejs",
                    subject: "Email Verification Link",
                };
                const mailResponse = helper.sendEmailNewSignup(emailData);
            }

            const freshToken = issueFreshAccessToken(user);
            return res
                .status(200)
                .json(
                    helper.successResponse(
                        { user: helper.userResponse(user), token: freshToken },
                        201,
                        "User updated successfully!"
                    )
                );
        });
    });
};
/**
 * Login user
 */
exports.login = (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    User.findOne({ email: email }, (err, user) => {
        if (!user) {
            return res
                .status(401)
                .json(helper.errorResponse([], 401, "Given user email is not registered"));
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (!result) {
                return res
                    .status(401)
                    .json(helper.errorResponse([], 401, "Incorrect email or password."));
            }

            const maxUpdates = {};
            const interestedMax = user.interested_tokens_max || 0;
            const superInterestedMax = user.super_interested_tokens_max || 0;
            const chatMax = user.chat_tokens_max || 0;

            if ((user.interested_tokens || 0) > interestedMax) {
                maxUpdates.interested_tokens_max = user.interested_tokens || 0;
                user.interested_tokens_max = maxUpdates.interested_tokens_max;
            }
            if ((user.super_interested_tokens || 0) > superInterestedMax) {
                maxUpdates.super_interested_tokens_max = user.super_interested_tokens || 0;
                user.super_interested_tokens_max = maxUpdates.super_interested_tokens_max;
            }
            if ((user.chat_tokens || 0) > chatMax) {
                maxUpdates.chat_tokens_max = user.chat_tokens || 0;
                user.chat_tokens_max = maxUpdates.chat_tokens_max;
            }

            if (Object.keys(maxUpdates).length > 0) {
                User.updateOne({ _id: user._id }, { $set: maxUpdates }).exec();
            }

            // SECURITY FIX: Use centralized auth service for token generation
            const authService = require("../../lib/auth");
            const tokens = authService.generateTokenPair({
                _id: user._id,
                email: user.email,
                role: user.role,
                gender: user.gender
            });
            
            delete user._doc.password;

            let currentTime = new Date();
            const nextInterestedMax = Math.max(
                Number(user.interested_tokens_max) || 0,
                Number(user.interested_tokens) || 0
            );
            const nextSuperInterestedMax = Math.max(
                Number(user.super_interested_tokens_max) || 0,
                Number(user.super_interested_tokens) || 0
            );
            const nextChatMax = Math.max(
                Number(user.chat_tokens_max) || 0,
                Number(user.chat_tokens) || 0
            );

            const loginUpdate = {
                before_last_logged_in: user.last_logged_in,
                last_logged_in: currentTime,
            };

            if (nextInterestedMax !== Number(user.interested_tokens_max) || Number.isNaN(Number(user.interested_tokens_max))) {
                loginUpdate.interested_tokens_max = nextInterestedMax;
                user.interested_tokens_max = nextInterestedMax;
            }
            if (nextSuperInterestedMax !== Number(user.super_interested_tokens_max) || Number.isNaN(Number(user.super_interested_tokens_max))) {
                loginUpdate.super_interested_tokens_max = nextSuperInterestedMax;
                user.super_interested_tokens_max = nextSuperInterestedMax;
            }
            if (nextChatMax !== Number(user.chat_tokens_max) || Number.isNaN(Number(user.chat_tokens_max))) {
                loginUpdate.chat_tokens_max = nextChatMax;
                user.chat_tokens_max = nextChatMax;
            }

            User.findOneAndUpdate({ email: email }, loginUpdate).exec();
            user.before_last_logged_in = user.last_logged_in;
            user.last_logged_in = currentTime;

            res.status(200).json(
                helper.successResponse({ 
                    data: { 
                        token: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                        ...user._doc 
                    } 
                }, 200, "Logged in successfully!")
            );
        });
    });
};

/**
 * Update user
 */
exports.update = (req, res) => {
    const { full_name, type } = req.body;
    const { id } = req.params;
    User.countDocuments({ type: 1 }, (err, count) => {
        if (!err) {
            User.findOne({ _id: id }, (error, user) => {
                if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));
                if (user.type === 1 && count > 1) {
                    user.name = full_name;
                    user.type = type;
                    user.save();
                    return res
                        .status(200)
                        .json(
                            helper.successResponse(
                                { user: helper.userResponse(user) },
                                201,
                                "Updated successfully!"
                            )
                        );
                }
                if (user.type === 1 && count === 1) {
                    if (type === 2) {
                        return res
                            .status(400)
                            .json(
                                helper.errorResponse(
                                    [],
                                    400,
                                    "You can't become a member as you are the last admin"
                                )
                            );
                    }
                    user.name = full_name;
                    user.is_new = false;
                    user.save();
                    return res
                        .status(201)
                        .json(
                            helper.successResponse(
                                { user: helper.userResponse(user) },
                                201,
                                "Name changed successfully"
                            )
                        );
                }
                if (user.type === 2) {
                    return res
                        .status(403)
                        .json(helper.errorResponse([], 403, "Only admin can update user"));
                }
            });
        }
    });
};

/**
 * Get user details by mongo _id
 */
exports.getUser = (req, res) => {
    const { user_name } = req.query;
    User.findOne({ user_name: user_name }, (err, user) => {
        if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { user: helper.userResponse(user) },
                    200,
                    "User details fetched successfully!"
                )
            );
    });
};

/**
 * Get name or email user exists or not
 */
exports.nameOrEmail = (req, res) => {
    logger.debug(req.body);
    const { user_name, email } = req.body;
    if (user_name) {
        User.findOne({ user_name: user_name }, (err, user) => {
            if (user)
                res.status(403).json(
                    helper.errorResponse(
                        [{ user_name: "User name already exist" }],
                        403,
                        "User name already exist"
                    )
                );
            return res.status(200).json(helper.successResponse({}, 200, "New user name!"));
        });
    } else if (email) {
        User.findOne({ email: email }, (err, user) => {
            if (user)
                res.status(403).json(
                    helper.errorResponse(
                        [{ email: "User email already exist" }],
                        403,
                        "User email already exist"
                    )
                );
            return res.status(200).json(helper.successResponse({}, 200, "New email!"));
        });
    } else {
        res.status(402).json(helper.errorResponse([], 402, "Please provide user_name or email"));
    }
};

/**
 * Change password when old password is known
 */
exports.changePassword = (req, res) => {
    const { old_password, new_password } = req.body;
    const { email, password } = req.datajwt.userdata;
    User.findOne({ email }, (err, user) => {
        if (!err && user) {
            bcrypt.compare(old_password, password, (err, result) => {
                if (result) {
                    bcrypt.hash(new_password, 10, (err, pass) => {
                        if (!err) {
                            user.password = pass;
                            user.save();
                            return res
                                .status(200)
                                .json(
                                    helper.successResponse(
                                        helper.userResponse(user),
                                        200,
                                        "Password changed successfully"
                                    )
                                );
                        }
                        res.status(400).json(
                            helper.errorResponse([], 400, "Password hashing error")
                        );
                    });
                } else if (!result) {
                    return res
                        .status(200)
                        .json(helper.errorResponse([], 418, "Incorrect old password"));
                }
            });
        } else {
            return res.status(404).json(helper.errorResponse(err, 404, "User not found"));
        }
    });
};

/**
 * Send link for forget-password
 */
exports.forgetPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (!user) {
            return res.status(404).json(helper.errorResponse([], 404, "User doesn't exist"));
        }
        const token = crypto.randomBytes(20).toString("hex");
        user.reset_key = token;
        user.save();

        const emaildata = {
            token,
            host: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : req.headers.host,
        };

        ejs.renderFile("views/mails/forgot-pwd-email.ejs", emaildata, (err, data) => {
            if (err) {
                return res
                    .status(500)
                    .json(helper.errorResponse([], 500, "Email template could not found"));
            }

            const mailOptions = {
                from: process.env.MAIL_ID_FROM,
                to: email,
                subject: "Reset Password Link",
                html: data,
            };
            try {
                mails.sendMail(mailOptions, (err) => {
                    if (err) {
                        return res.status(500).json(helper.errorResponse([], 500, err));
                    }
                    return res
                        .status(200)
                        .json(
                            helper.successResponse([], 200, `Reset password link sent to ${email}!`)
                        );
                });
            } catch (err) {
                return res.status(500).json(helper.errorResponse([], 500, err));
            }
        });
    });
};

/**
 * Reset-password
 */
exports.resetPassword = (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || token === "") {
        return res.status(403).json(helper.errorResponse([], 403, "Token required."));
    }

    User.findOne({ reset_key: token }, (err, user) => {
        if (!user) {
            return res.status(404).json(helper.errorResponse([], 404, "User doesn't exist"));
        }

        if (user.reset_key === token) {
            bcrypt.hash(password, 10, (err, pass) => {
                user.password = pass;
                user.reset_key = undefined;
                user.save();
                res.status(200).json(
                    helper.successResponse(
                        helper.userResponse(user),
                        200,
                        "Password changed successfully!"
                    )
                );
            });
        } else {
            user.reset_key = undefined;
            user.save();
            res.status(418).json(
                helper.errorResponse([], 418, "Token match error. Resend new token")
            );
        }
    });
};

/**
 * Send link to verify email
 */
exports.verifyEmail = async (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (!user) {
            return res.status(404).json(helper.errorResponse([], 404, "User doesn't exist"));
        }
        const token = crypto.randomBytes(20).toString("hex");
        user.email_verification_token = token;
        user.save();

        const emailData = {
            to: email,
            token,
            host: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : req.headers.host,
            backendHost: process.env.BACKENDEND_URL ? process.env.BACKENDEND_URL : req.headers.host,
            template: "views/mails/verify-email.ejs",
        };

        ejs.renderFile("views/mails/verify-email.ejs", emailData, async (err, data) => {
            if (err) {
                return res
                    .status(500)
                    .json(helper.errorResponse([], 500, "Email template could not found"));
            }

            const mailOptions = {
                from: process.env.MAIL_ID_FROM,
                to: email,
                subject: "Email Verification Link",
                html: data,
            };
            try {
                await mails.sendMail(mailOptions);
                return res
                    .status(200)
                    .json(
                        helper.successResponse(
                            [],
                            200,
                            `Email verification link sent to ${email}!`
                        )
                    );
            } catch (sendErr) {
                return res
                    .status(500)
                    .json(helper.errorResponse([], 500, sendErr?.message || sendErr));
            }
        });
    });
};

/**
 * Validate email if token method
 */
exports.emailVerification = (req, res) => {
    const { email, token } = req.body;

    if (!token) {
        return res.status(404).json(helper.errorResponse([], 404, "Token required"));
    }

    User.findOne({ email_verification_token: token, email: email }, (err, user) => {
        if (!user) {
            return res
                .status(404)
                .json(helper.errorResponse([], 404, "User doesn't exist or token not matched."));
        }

        if (user.email_verification_token === token) {
            user.email_verification_token = null;
            user.email_verified = true;
            user.save();

            // SECURITY FIX: Use centralized auth service
            const authService = require("../../lib/auth");
            const tokens = authService.generateTokenPair({
                _id: user._id,
                email: user.email,
                role: user.role,
                gender: user.gender
            });

            res.status(200).json(
                helper.successResponse({ 
                    token: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn,
                    ...user._doc 
                }, 200, "Email verified successfully!")
            );
        } else {
            user.email_verification_token = undefined;
            user.save();
            res.status(418).json(
                helper.errorResponse([], 418, "Token match error. Resend new token")
            );
        }
    });
};

exports.validatebyEmail = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user)
        res.status(200).json(helper.successResponse({ isValid: true }, 200, "User not found"));
    else
        res.status(200).json(
            helper.successResponse({ isValid: false }, 200, "User already exists")
        );
};

exports.validatebyUsername = async (req, res) => {
    const username = req.body.user_name;
    const user = await User.findOne({ user_name: username.toLowerCase() });
    if (!user)
        return res
            .status(200)
            .json(helper.successResponse({ isValid: true }, 200, "User not found"));
    // else res.status(200).json(helper.successResponse({isValid:false}, 200, 'User already exists'));
    const user1 = await User.findOne({ user_name: username.toLowerCase() });
    if (user1) {
        return res.json({ user_exist: "User already exist." });
    }
};

exports.userStats = async (req, res) => {
    const { lookback } = req.query; // in days

    let stats = {
        total_users: 0,
        new_users: 0,
        verified_users: 0,
        pending_users: 0,
        deactivated_users: 0,
        verified_photos: 0,
        pending_photos: 0,
        updated_details: 0,
        requested_by_admin: 0,
        document_uploaded: 0,
    };

    // 1 : Pending, 2: Verified, 3 Block ( deactivated ), 4: Delete ( soft )

    try {
        const totalUsers = await User.countDocuments({
            role: { $eq: 1 },
            status: { $ne: 4 },
        });

        const newUsers = await User.countDocuments({
            role: { $eq: 1 }, // user ( 2 is for admin )
            status: { $eq: 1 }, // pending
            email_verified: true,
            documents_verified: false,
            request_change_fired: false,
        });

        const pendingUsers = await User.aggregate([
            {
                $match: {
                    status: 1,
                    role: { $eq: 1 },
                    email_verified: true,
                    request_change_fired: false,
                },
            },
            {
                $count: "pending_users",
            },
        ]);

        const verifiedUsers = await User.aggregate([
            {
                $match: {
                    status: 2,
                    role: { $eq: 1 },
                },
            },
            {
                $count: "verified_users",
            },
        ]);

        const deactivatedUsers = await User.aggregate([
            {
                $match: {
                    status: 3,
                    role: { $eq: 1 },
                },
            },
            {
                $count: "deactivated_users",
            },
        ]);

        const verifiedUsersPhotos = await User.aggregate([
            {
                $match: {
                    image_verified: true,
                    role: { $eq: 1 },
                },
            },
            {
                $count: "verified_photos",
            },
        ]);

        const pendingPhotosVerification = await User.aggregate([
            {
                $match: {
                    image_verified: false,
                    email_verified: true,
                    role: { $eq: 1 },
                },
            },
            {
                $count: "pending_photos",
            },
        ]);

        const updatedDetails = await User.aggregate([
            {
                $match: {
                    status: { $ne: 4 },
                    role: { $eq: 1 },
                    is_new: false,
                    email_verified: true,
                    request_change_fired: false,
                    // verified: true,
                    $or: [
                        { un_verified_tagline: { $exists: true, $ne: "" } },
                        { un_verified_description: { $exists: true, $ne: "" } },
                        {
                            $expr: {
                                $gt: [
                                    {
                                        $size: {
                                            $objectToArray: {
                                                $ifNull: ["$un_verified_profile_details", {}],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                        {
                            $expr: {
                                $gt: [{ $size: { $ifNull: ["$un_verified_images", []] } }, 0],
                            },
                        },
                    ],
                    // $or: [{ tag_desc_verified: false }, { image_verified: false }],
                    // $and: [
                    //   {
                    //     is_new: false,
                    //     email_verified: true,
                    //   },
                    //   {
                    //     image_verified: false
                    //   },
                    //   {
                    //     tag_desc_verified: false
                    //   }
                    // ]
                },
            },
            // {
            //     $match: {
            //         role: { $eq: 1 },
            //         is_new: false,
            //     },
            // },
            { $count: "updated_details" },
        ]);

        const documentUploaded = await User.aggregate([
            {
                $match: {
                    $and: [
                        {
                            selfie: { $ne: null },
                            document: { $ne: null },
                            documents_verified: false,
                        },
                    ],
                },
            },
            {
                $match: {
                    role: { $eq: 1 },
                },
            },
            { $count: "document_uploaded" },
        ]);

        const requestedByAdmin = await User.aggregate([
            {
                $match: {
                    role: { $eq: 1 },
                    request_change_fired: true,
                },
            },
            {
                $count: "requested_by_admin",
            },
        ]);

        if (totalUsers) {
            stats.total_users = totalUsers;
        }

        if (newUsers) {
            stats.new_users = newUsers;
        }

        if (verifiedUsers.length) {
            stats.verified_users = verifiedUsers[0].verified_users;
        }

        if (pendingUsers.length) {
            stats.pending_users = pendingUsers[0].pending_users;
        }

        if (deactivatedUsers.length) {
            stats.deactivated_users = deactivatedUsers[0].deactivated_users;
        }

        if (verifiedUsersPhotos.length) {
            stats.verified_photos = verifiedUsersPhotos[0].verified_photos;
        }

        if (pendingPhotosVerification.length) {
            stats.pending_photos = pendingPhotosVerification[0].pending_photos;
        }

        if (updatedDetails.length) {
            stats.updated_details = updatedDetails[0].updated_details;
        }

        if (requestedByAdmin.length) {
            stats.requested_by_admin = requestedByAdmin[0].requested_by_admin;
        }

        if (documentUploaded.length) {
            stats.document_uploaded = documentUploaded[0].document_uploaded;
        }
        res.status(200).json(helper.successResponse(stats, 200, "Users stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

exports.updateStatus = async (req, res) => {
    try {
        let { status, emails, type } = req.body;

        // if only one email is passed
        if (!Array.isArray(emails)) {
            emails = emails.split();
        }

        emails.forEach((email) => {
            User.findOne({ email: email }, (err, user) => {
                let existingUserStatus = user.status;
                let userName = user.user_name;
                user.is_new = false;
                user.tag_desc_verified = true;
                user.image_verified = true;
                user.verified = true;
                user.status = +status;

                if (user.un_verified_tagline && user.un_verified_tagline.length) {
                    user.tagline = user.un_verified_tagline; // remove old data now
                    user.un_verified_tagline = "";
                }

                if (user.un_verified_description && user.un_verified_description.length) {
                    user.description = user.un_verified_description;
                    user.un_verified_description = ""; // remove old data now
                }

                if (user.un_verified_images && user.un_verified_images.length) {
                    user.images = user.un_verified_images;
                    user.un_verified_images = [];
                }

                applyPendingProfileDetails(user);

                user.save((err) => {
                    if (err) {
                        return res
                            .status(400)
                            .json(
                                helper.errorResponse({ error: err }, 400, "Failed to update user")
                            );
                    }

                    let emailData;
                    if (status == 3) {
                        emailData = {
                            mailTemplate: "views/mails/block-user-by-admin.ejs",
                            message: "Your profile is blocked!",
                            loginUrl: process.env.FRONTEND_URL,
                            type: "notification",
                            emailList: email,
                            subject: "Blocked from Ascend!!",
                            userName,
                        };
                    } else {
                        if (existingUserStatus != "1") {
                            emailData = {
                                mailTemplate: "views/mails/change-request-approved.ejs",
                                message: "Change Request Approved!",
                                loginUrl: process.env.FRONTEND_URL,
                                type: "notification",
                                emailList: email,
                                subject: "Change Request Approved.",
                                userName,
                            };
                        } else {
                            emailData = {
                                mailTemplate:
                                    user.gender === "female"
                                        ? "views/mails/profile-changes-femail.ejs"
                                        : "views/mails/profile-changes.ejs",
                                message: "Your profile status is updated successfully!",
                                loginUrl: process.env.FRONTEND_URL,
                                type: "notification",
                                emailList: email,
                                subject: "Welcome to Ascend.",
                                userName,
                            };
                        }
                    }
                    sendMail(emailData);
                });
            });
        });
        return res.status(200).json(helper.successResponse([], 201, "User updated successfully!"));
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

/**
 * Update user tokens/chats
 * Accepts increments for interested, super interested, and chat tokens
 */
exports.updateTokens = async (req, res) => {
    try {
        const {
            interested_tokens = 0,
            super_interested_tokens = 0,
            chat_tokens = 0,
        } = req.body;

        const inc = {};
        if (Number(interested_tokens)) inc.interested_tokens = Number(interested_tokens);
        if (Number(super_interested_tokens))
            inc.super_interested_tokens = Number(super_interested_tokens);
        if (Number(chat_tokens)) inc.chat_tokens = Number(chat_tokens);

        if (Object.keys(inc).length === 0) {
            return res
                .status(400)
                .json(helper.errorResponse([], 400, "No token updates provided."));
        }

        const user = await User.findOneAndUpdate(
            { _id: req.datajwt.userdata._id },
            { $inc: inc, updated_at: new Date() },
            { new: true }
        );

        if (!user) {
            return res
                .status(404)
                .json(helper.errorResponse([], 404, "User not found."));
        }

        const nextInterestedMax = Math.max(
            Number(user.interested_tokens_max) || 0,
            Number(user.interested_tokens) || 0
        );
        const nextSuperInterestedMax = Math.max(
            Number(user.super_interested_tokens_max) || 0,
            Number(user.super_interested_tokens) || 0
        );
        const nextChatMax = Math.max(
            Number(user.chat_tokens_max) || 0,
            Number(user.chat_tokens) || 0
        );

        if (nextInterestedMax !== Number(user.interested_tokens_max)) {
            user.interested_tokens_max = nextInterestedMax;
        }
        if (nextSuperInterestedMax !== Number(user.super_interested_tokens_max)) {
            user.super_interested_tokens_max = nextSuperInterestedMax;
        }
        if (nextChatMax !== Number(user.chat_tokens_max)) {
            user.chat_tokens_max = nextChatMax;
        }

        if (
            user.isModified("interested_tokens_max") ||
            user.isModified("super_interested_tokens_max") ||
            user.isModified("chat_tokens_max")
        ) {
            await user.save();
        }

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { user: helper.userResponse(user) },
                    200,
                    "Tokens updated successfully!"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to update tokens."));
    }
};

/**
 * Update popup preferences
 */
exports.updatePopupPreferences = async (req, res) => {
    try {
        const { create_date_popup_dismissed, date_live_popup_dismissed } = req.body;
        const update = {};

        if (typeof create_date_popup_dismissed === "boolean") {
            update.create_date_popup_dismissed = create_date_popup_dismissed;
        }
        if (typeof date_live_popup_dismissed === "boolean") {
            update.date_live_popup_dismissed = date_live_popup_dismissed;
        }

        if (Object.keys(update).length === 0) {
            return res
                .status(400)
                .json(helper.errorResponse([], 400, "No popup preferences provided."));
        }

        const user = await User.findOneAndUpdate(
            { _id: req.datajwt.userdata._id },
            { ...update, updated_at: new Date() },
            { new: true }
        );

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { user: helper.userResponse(user) },
                    200,
                    "Popup preferences updated."
                )
            );
    } catch (error) {
        return res.status(400).json(
            helper.errorResponse({ error: error.message }, 400, "Failed to update popup preferences.")
        );
    }
};
exports.requestInfo = async (req, res) => {
    try {
        const { email, message } = req.body;

        logger.debug(email, message);

        const emailData = {
            message: message,
        };

        ejs.renderFile("views/mails/request-info-email.ejs", emailData, (err, data) => {
            if (err) {
                return res
                    .status(500)
                    .json(helper.errorResponse([], 500, "Email template could not found"));
            }

            // setup email data with unicode symbols
            const mailOptions = {
                from: process.env.MAIL_ID_FROM, // sender address
                to: email,
                subject: "Request info", // Subject line
                html: data,
            };

            // send mail with defined transport object
            mails.sendMail(mailOptions, (err) => {
                if (err) {
                    return res
                        .status(500)
                        .json(helper.errorResponse([], 500, "Email could not be sent"));
                }
                return res
                    .status(200)
                    .json(
                        helper.successResponse(
                            { email, message },
                            200,
                            `Request info mail sent to ${email}!`
                        )
                    );
            });
        });
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

exports.audienceReach = async (req, res) => {
    try {
        const reach = User.aggregate([{ $group: { _id: "$item" } }]);

        logger.debug(reach);
        return res
            .status(200)
            .json(helper.successResponse({ reach }, 200, `Request info mail sent to ${email}!`));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * getVerified user for badge
 */
exports.getVerified = (req, res) => {
    const { email, selfie, document } = req.body;

    User.findOne({ email }, (error, user) => {
        if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

        if (!selfie) {
            res.status(400).json(helper.errorResponse([], 400, "Selfie  image required."));
        }

        if (!document) {
            res.status(400).json(helper.errorResponse([], 400, "Document image required."));
        }

        user.selfie = selfie;
        user.document = document;
        user.documents_verified = false;
        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
            }

            return res
                .status(200)
                .json(
                    helper.successResponse(
                        { user: helper.userResponse(user) },
                        201,
                        "User updated successfully!"
                    )
                );
        });
    });
};

exports.verifyDocument = async (req, res) => {
    try {
        const { email } = req.body;

        User.findOne({ email }, (error, user) => {
            if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

            user.documents_verified = true;
            user.is_new = false;
            user.save((err) => {
                if (err) {
                    return res
                        .status(400)
                        .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
                }
                return res
                    .status(200)
                    .json(
                        helper.successResponse(
                            { user: helper.userResponse(user) },
                            201,
                            "Document verified."
                        )
                    );
            });
        });
    } catch (err) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

/**
 * New image, tagline and description will be now shown on frontend.
 * user profile will be approved again.
 * This api is used in request by admin tab as well.
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.verifyTaglineDescription = async (req, res) => {
    try {
        const { email } = req.body;

        User.findOne({ email }, (error, user) => {
            if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));

            // empty old values

            user.is_new = false;

            user.tag_desc_verified = true;
            user.image_verified = true;
            user.verified = true;

            if (user.un_verified_tagline && user.un_verified_tagline.length) {
                user.tagline = user.un_verified_tagline; // remove old data now
                user.un_verified_tagline = "";
                //  user.tag_desc_verified = true;
                //  user.verified = true;
            }

            if (user.un_verified_description && user.un_verified_description.length) {
                user.description = user.un_verified_description;
                user.un_verified_description = ""; // remove old data now
                // user.tag_desc_verified = true;
                // user.verified = true;
            }

            if (user.un_verified_images && user.un_verified_images.length) {
                user.image = user.un_verified_images;
                // user.image_verified = true;
                // user.verified = true;
            }

            applyPendingProfileDetails(user);

            user.save((err) => {
                if (err) {
                    return res
                        .status(400)
                        .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
                }

                return res
                    .status(200)
                    .json(
                        helper.successResponse(
                            { user: helper.userResponse(user) },
                            201,
                            "User updated successfully."
                        )
                    );
            });
        });
    } catch (err) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

exports.updateVerifiedScreenStatus = async (req, res) => {
    try {
        const { email, status = false } = req.body;

        User.findOne({ email }, (error, user) => {
            if (!user) res.status(404).json(helper.errorResponse([], 404, "User not found"));
            user.verified_screen_shown = status;
            // user.is_new = false;
            user.save((err) => {
                if (err) {
                    return res
                        .status(400)
                        .json(helper.errorResponse({ error: err }, 400, "Failed to update user"));
                }
                return res
                    .status(200)
                    .json(
                        helper.successResponse(
                            { user: helper.userResponse(user) },
                            201,
                            "User screen status updated."
                        )
                    );
            });
        });
    } catch (err) {
        return res.status(500).json(helper.errorResponse([], 500, error));
    }
};

exports.blockUserRequest = async (req, res) => {
    try {
        let { userId } = req.body; // user whom to block
        let { userdata } = req.datajwt;

        const userData = await User.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(userdata._id) },
            { $push: { blocked_users: { $each: [userId] } } },
            { returnNewDocument: true }
        );

        if (!userData) {
            return res.status(404).json(helper.errorResponse([], 404, "User not found"));
        }
        return res
            .status(200)
            .json(
                helper.successResponse(
                    { user: helper.userResponse(userData) },
                    201,
                    "User is added in your blocked list."
                )
            );
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

/* Update dates warning popup status */
exports.updateDateWarningStatus = async (req, res) => {
    try {
        let dateWarningStatus = req.body.date_warning_popup;
        let { email } = req.datajwt.userdata;
        email = email.toLowerCase();

        User.findOne({ email: email }, (err, user) => {
            if (!user) {
                return res.status(401).json(helper.errorResponse([], 401, "User not registered"));
            }
            User.findOneAndUpdate(
                { email: email },
                { date_warning_popup: dateWarningStatus }
            ).exec();
            return res
                .status(200)
                .json(helper.successResponse({}, 200, "Date warning popup updated successfully!"));
        });
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

/* Update image warning popup status */
exports.updateImageWarningPopup = async (req, res) => {
    try {
        let imageWarningPopup = req.body.image_warning_popup;
        // let { email } = req.datajwt.userdata;
        // email = email.toLowerCase();

        User.findOne({ _id: req.params.userId }, (err, user) => {
            if (!user) {
                return res.status(401).json(helper.errorResponse([], 401, "User not registered"));
            }
            User.findOneAndUpdate(
                { _id: req.params.userId },
                { image_warning_popup: imageWarningPopup }
            ).exec();
            return res
                .status(200)
                .json(helper.successResponse({}, 200, "Image warning popup updated successfully!"));
        });
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

/**
 * Get current user data (me)
 * Returns fresh user data including token counts
 */
exports.getMe = async (req, res) => {
    try {
        const { userdata } = req.datajwt;
        const user = await User.findById(userdata._id).select('-password -__v');
        
        if (!user) {
            return res.status(404).json(
                helper.errorResponse([], 404, "User not found")
            );
        }
        
        return res.status(200).json(
            helper.successResponse(
                { user: helper.userResponse(user) },
                200,
                "User data fetched successfully"
            )
        );
    } catch (error) {
        return res.status(500).json(
            helper.errorResponse(error.message, 500, "Failed to fetch user data")
        );
    }
};

exports.saveAspiration = async (req, res) => {
    try {
        let { userdata } = req.datajwt;
        userdata = await User.findById(userdata._id).lean();

        const aspirationName = normalizeModeratedText(req.body?.aspirationName);
        const categatoryName = normalizeModeratedText(req.body?.categatoryName);
        const moderationError =
            getModerationError(aspirationName) || getModerationError(categatoryName);

        if (moderationError) {
            return res
                .status(400)
                .json(helper.errorResponse([], 400, moderationError));
        }

        await User.updateOne(
            { _id: userdata._id },
            {
                aspirationName,
                categatoryName,
                aspirationId: req.body?.aspirationId || null,
                categatoryId: req.body?.categatoryId || null,
            }
        );

        return res
            .status(200)
            .json(helper.successResponse([], 201, "Aspiration save successfully!"));
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

/**
 * Delete the authenticated user's own account (SignUpTC-5).
 * Removes the user document so the profile is no longer accessible.
 */
exports.deleteAccount = async (req, res) => {
    try {
        const { userdata } = req.datajwt;

        const user = await User.findById(userdata._id);
        if (!user) {
            return res.status(404).json(helper.errorResponse([], 404, "User doesn't exist"));
        }

        await User.deleteOne({ _id: userdata._id });
        logger.info(`User account deleted by self: ${userdata._id} (${userdata.email})`);

        return res
            .status(200)
            .json(helper.successResponse([], 200, "Your account has been deleted successfully."));
    } catch (error) {
        return res
            .status(500)
            .json(helper.errorResponse(error.message, 500, "Failed to delete account."));
    }
};
