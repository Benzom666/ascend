const { createLogger } = require("../../lib/logger");
const logger = createLogger("date");

const mongoose = require("mongoose");
const Dates = require("../../models/dates");
const helper = require("../../helpers/helper");
const User = require("../../models/user");
const ChatRoom = require("../../models/chat_room");

/**
 * Listing of users based on full_name, sort and order
 * Default current_page is 1 and per_page will be 10
 * @param current_page int
 * @param per_page int
 * @param sort string
 * @param order int
 */

exports.getAllDates = async (req, res) => {
    logger.debug("req", req.query);
    let {
        current_page = 1,
        per_page = 10,
        location = "",
        province = "",
        sort = "created_at",
        order = -1,
        assetOnly = false,
        status = "",
    } = req.query;

    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
        logger.debug("current_page", current_page);

        let userDetails = await User.findOne({ _id: req.datajwt.userdata._id });
        let userNameCondition;
        let { gender, country_code, role, user_name } = userDetails;
        
        if (req.query.user_name) {
            userNameCondition = user_name &&
                user_name.length && {
                    $and: [
                        {
                            user_name: {
                                $nin: [
                                    ...userDetails.blocked_users_by_self,
                                    ...userDetails.blocked_by_others,
                                ],
                            },
                        },
                        { user_name: { $eq: req.query.user_name } },
                    ],
                };
        } else {
            userNameCondition = user_name &&
                user_name.length && {
                    user_name: {
                        $nin: [
                            ...userDetails.blocked_users_by_self,
                            ...userDetails.blocked_by_others,
                        ],
                    },
                };
        }

        // only female can search for any country
        // or if it's admin then he can search any location
        if (
            role == 2 ||
            ((gender == "female" || gender == "F" || gender == "f") && req.query.country_code)
        ) {
            country_code = req.query.country_code;
        }

        current_page = parseInt(current_page);
        per_page = parseInt(per_page);

        if (current_page < 1)
            res.status(400).json(
                helper.errorResponse([], 400, "Invalid page number, should start with 1.")
            );

        const skip = per_page * (current_page - 1);

        // Normalize location for case-insensitive matching
        const normalizedLocation = location ? String(location).trim() : "";
        const locationRegex = normalizedLocation
            ? new RegExp(`^${escapeRegExp(normalizedLocation)}(,|$)`, "i")
            : null;

        let query = {
            status: 2, // CRITICAL FIX: Only show ACTIVE dates (status=2), not drafts (status=1)
            date_status: true, // do not fetch draft dates
            ...(normalizedLocation && { location: { $regex: locationRegex } }),
            ...(country_code && country_code.length && { country_code: { $eq: country_code } }),
            ...(province && province.length && {
                $or: [
                    { province: { $regex: new RegExp(`^${province}$`, "i") } },
                    { province: { $exists: false } },
                    { province: "" },
                    { province: null },
                ],
            }),
            ...(status && status.length && { status: { $eq: +status } }),
            ...userNameCondition,
        };

        if (req.query.user_name) {
            delete query.date_status;
            // When viewing own profile, show ALL dates regardless of country
            delete query.country_code;
        }

        if (status == 5) {
            // to return new dates
            query = { ...query, is_new: true, status: { $ne: 4 } };
        }

        // OPTIMIZED DATABASE-LEVEL SORTING with DISTANCE-BASED priority
        //
        // Each known user-city has a distance map to every other known
        // city. The aggregation builds a $switch dynamically from
        // cityDistances[userLocation], so a viewer in any of the cities
        // below gets distinct, ordered priorities for every nearby city
        // (no more 'all same-province cities collapse to one bucket'
        // bug, which interleaved Brampton/Toronto/London for a London
        // viewer).
        //
        // The compared field strips anything after the first comma (so
        // 'London, ON' compares equal to 'london'), making the sort
        // robust to the legacy mixed location format.
        const userLocationRaw = userDetails.location ? String(userDetails.location).toLowerCase() : "";
        const userLocation = userLocationRaw.split(",")[0].trim();
        const userProvince = userDetails.province ? String(userDetails.province).toLowerCase() : "";

        const cityDistances = {
            // From Toronto
            toronto:   { toronto: 0, pickering: 35, brampton: 40, hamilton: 65, "stoney creek": 70, waterdown: 75, london: 190 },
            // From Pickering
            pickering: { pickering: 0, toronto: 35, brampton: 55, "stoney creek": 70, hamilton: 75, waterdown: 80, london: 180 },
            // From London
            london:    { london: 0, waterdown: 110, hamilton: 120, "stoney creek": 125, brampton: 180, pickering: 185, toronto: 190 },
            // From Hamilton
            hamilton:  { hamilton: 0, "stoney creek": 10, waterdown: 15, toronto: 65, brampton: 70, pickering: 75, london: 120 },
            // From Brampton
            brampton:  { brampton: 0, toronto: 40, pickering: 55, hamilton: 70, "stoney creek": 75, waterdown: 80, london: 180 },
        };

        // location field with anything after the first comma stripped, lowercased.
        // Tolerates 'London, ON' / 'london' both matching 'london'.
        const docCityExpr = {
            $toLower: {
                $trim: {
                    input: {
                        $arrayElemAt: [
                            { $split: [{ $ifNull: ["$location", ""] }, ","] },
                            0,
                        ],
                    },
                },
            },
        };

        // Build distance branches for the viewer's city.
        // Each branch maps a date city -> distance (km) priority.
        const userCityMap = cityDistances[userLocation] || {};
        const distanceBranches = Object.entries(userCityMap)
            .filter(([city]) => city !== userLocation)
            .sort((a, b) => a[1] - b[1])
            .map(([city, dist]) => ({
                case: { $eq: [docCityExpr, city] },
                then: dist,
            }));

        const basePipeline = [
            { $match: query },
            {
                $addFields: {
                    // Lower = closer to viewer.
                    // 0       : same city as viewer
                    // 10..200 : known-distance city in the same/neighbouring metro
                    // 500     : same province, unknown distance
                    // 1000    : other province / country
                    loc_priority: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: [docCityExpr, userLocation] },
                                    then: 0,
                                },
                                ...distanceBranches,
                                {
                                    case: {
                                        $eq: [
                                            { $toLower: { $ifNull: ["$province", ""] } },
                                            userProvince,
                                        ],
                                    },
                                    then: 500,
                                },
                            ],
                            default: 1000,
                        },
                    },
                },
            },
            {
                $sort: {
                    loc_priority: 1,      // First by location priority (0=city, 1=province, 2=other)
                    [sort]: order,        // Then by requested sort field (e.g., created_at)
                    _id: 1                // CRITICAL: Stable sort - ensures same order across page loads
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_name",
                    foreignField: "user_name",
                    as: "user_data",
                    ...(assetOnly && {
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    user_name: 1,
                                    age: 1,
                                    images: 1,
                                    un_verified_images: 1,
                                    description: 1,
                                    tagline: 1,
                                    aspirationName: 1,
                                    occupation: 1,
                                    documents_verified: 1,
                                },
                            },
                        ],
                    }),
                },
            },
            // CRITICAL FIX: Filter out dates where user_data lookup failed
            {
                $match: {
                    user_data: { $ne: [] },
                    "user_data.0._id": { $exists: true }
                }
            }
        ];

        const aggregationPipeline = [
            ...basePipeline,
            {
                $facet: {
                    metadata: [{ $count: "total_dates" }],
                    dates: [
                        { $skip: skip },
                        { $limit: per_page },
                        {
                            $project: {
                                loc_priority: 0
                            }
                        }
                    ]
                }
            }
        ];

        const aggregationResult = await Dates.aggregate(aggregationPipeline).collation({
            locale: "en",
            strength: 2,
        });

        const facetData = aggregationResult[0] || {};
        const total_dates = facetData?.metadata?.[0]?.total_dates || 0;

        logger.debug(total_dates);
        const total_pages = Math.ceil(total_dates / per_page);

        if (total_pages == 0) {
            return res.status(200).json({
                status: 200,
                error: false,
                message: "Success",
                data: {
                    dates: [],
                    pagination: {
                        current_page: 1,
                        per_page: per_page,
                        total_pages: 0,
                        total_dates: 0
                    }
                }
            });
        }

        if (current_page > total_pages) {
            return res
                .status(400)
                .json(
                    helper.errorResponse(
                        [],
                        400,
                        "Invalid page number, can't be greater than total pages."
                    )
                );
        }

        const datesData = facetData?.dates || [];

        return res.status(200).json(
            helper.successResponse(
                {
                    dates: datesData,
                    pagination: {
                        current_page,
                        per_page,
                        total_dates,
                        total_pages,
                    },
                },
                200,
                "All dates fetched successfully!"
            )
        );
    } catch (err) {
        logger.debug("err catched", err);
        return res.status(500).json(helper.errorResponse(err, 500, "Something went wrong."));
    }
};

/**
 * Get draft date
 * Only post can be in draft.
 * date_status label is uesed to do this. By default it's false, means draft.
 */
exports.getDraftDate = async (req, res) => {
    try {
        const dateInDraft = await Dates.findOne({
            date_status: false,
            user_name: req.datajwt.userdata.user_name,
        });
        if (dateInDraft) {
            return res
                .status(200)
                .json(helper.successResponse(dateInDraft, 200, "Date fetched successfully!"));
        } else {
            return res
                .status(404)
                .json(helper.successResponse(dateInDraft, 200, "Date not found!"));
        }
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to fetch date"));
    }
};

/**
 * Get create-date entry state for the authenticated user.
 * This is the single server-backed source of truth for:
 * - active date limit
 * - draft resume
 * - fresh create eligibility
 */
exports.getCreateEntry = async (req, res) => {
    try {
        const userName = req?.datajwt?.userdata?.user_name;

        if (!userName) {
            return res
                .status(401)
                .json(
                    helper.errorResponse(
                        { error: "Failed to authenticate token!" },
                        401,
                        "Failed to authenticate token!"
                    )
                );
        }

        const [draftDate, activeCount] = await Promise.all([
            Dates.findOne({
                date_status: false,
                user_name: userName,
            })
                .sort({ updated_at: -1, created_at: -1 })
                .lean(),
            Dates.countDocuments({
                date_status: true,
                user_name: userName,
                status: { $nin: [3, 4, 6] },
            }),
        ]);

        const hasDraft = Boolean(draftDate);
        const limitReached = activeCount >= 4;

        return res.status(200).json(
            helper.successResponse(
                {
                    can_create: hasDraft || !limitReached,
                    limit_reached: limitReached,
                    has_draft: hasDraft,
                    active_count: activeCount,
                    draft_date: draftDate || null,
                    resume_mode: hasDraft ? "draft-edit" : "create",
                },
                200,
                "Create date entry state fetched successfully!"
            )
        );
    } catch (error) {
        return res
            .status(400)
            .json(
                helper.errorResponse(
                    { error: error.message },
                    400,
                    "Failed to fetch create date entry state"
                )
            );
    }
};

/**
 * Get date by id
 */
exports.getDateById = async (req, res) => {
    try {
        const { id } = req.params;
        const date = await Dates.findById(id).lean();

        if (!date) {
            return res.status(404).json(helper.errorResponse([], 404, "Date not found"));
        }

        const userData = await User.findOne(
            { user_name: date.user_name },
            { _id: 0, images: 1, un_verified_images: 1, description: 1, tagline: 1, user_name: 1 }
        ).lean();

        return res
            .status(200)
            .json(helper.successResponse({ ...date, user_data: userData ? [userData] : [] }, 200, "Date fetched successfully!"));
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to fetch date"));
    }
};

/**
 * Create date
 * 1. First check if any post is in draft if yes then not allowed to created new date
 * 2. Check if user already has 4 active dates (max limit)
 * 3. If no draft found and under limit, then create new date.
 */
exports.date = async (req, res) => {
    try {
        const { isUpdate = false } = req.body;
        const { user_name, gender } = req.datajwt.userdata;

        logger.debug("date creation started");

        if (!isUpdate) {
            // Check for draft dates
            const dateInDraft = await Dates.findOne({
                date_status: false,
                user_name: user_name,
            });

            if (dateInDraft) {
                return res
                    .status(403)
                    .json(
                        helper.errorResponse(
                            { error: "You already have a date in draft." },
                            403,
                            "You already have a date in draft."
                        )
                    );
            }

            // Check for max active dates limit (4 dates max - one per photo)
            // CRITICAL FIX: Only count ACTIVE dates (status=2), not drafts (status=1)
            const activeDatesCount = await Dates.countDocuments({
                date_status: true,
                user_name: user_name,
                status: 2 // Only count active/live dates, not drafts
            });

            if (activeDatesCount >= 4) {
                return res
                    .status(403)
                    .json(
                        helper.errorResponse(
                            { error: "You've reached your limit of 4 active dates." },
                            403,
                            "You've reached your limit of 4 active dates."
                        )
                    );
            }
        }

        // Validate gender field for proper handling
        const normalizedGender = String(gender || "").toLowerCase();
        if (!["male", "female", "m", "f"].includes(normalizedGender)) {
            return res
                .status(400)
                .json(
                    helper.errorResponse(
                        { error: "Invalid gender information. Please update your profile." },
                        400,
                        "Invalid gender information. Please update your profile."
                    )
                );
        }

        const dateObj = new Dates({
            ...req.body,
            ...(isUpdate && { is_new: true }),
            updated_at: new Date(),
        });

        const success = await dateObj.save();

        if (success) {
            const success_message =
                isUpdate == "true" || isUpdate == true
                    ? "Date updated successfully!"
                    : "Date created successfully!";
            return res.status(201).json(helper.successResponse(success, 201, success_message));
        } else {
            return res
                .status(500)
                .json(
                    helper.errorResponse(
                        { error: "Failed to create date. Refresh the page and retry." },
                        500,
                        "Failed to create date. Refresh the page and retry."
                    )
                );
        }
    } catch (error) {
        logger.error("Date creation error:", error);
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to create date"));
    }
};

/**
 * Update date
 */
exports.updateDate = async (req, res) => {
    try {
        const update = req.body;
        const { date_id, user_name } = update;

        if (!mongoose.Types.ObjectId.isValid(date_id)) {
            return res
                .status(400)
                .json(helper.errorResponse({ error: "Invalid date id" }, 400, "Invalid date id"));
        }

        const doc = await Dates.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(date_id), user_name },
            {
                ...update,
                updated_at: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res
                .status(404)
                .json(
                    helper.errorResponse(
                        { error: "Date not found for this user." },
                        404,
                        "Date not found for this user."
                    )
                );
        }

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { date: helper.dateResponse(doc) },
                    201,
                    "Date updated successfully!"
                )
            );
    } catch (error) {
        res.status(400).json(
            helper.errorResponse({ error: error.message }, 400, "Failed to update date")
        );
    }
};

/**
 * Delete draft date if exists.
 */
exports.deleteDate = async (req, res) => {
    try {
        const dateInDraft = await Dates.findOne({
            date_status: false,
            user_name: req.datajwt.userdata.user_name,
        });

        if (dateInDraft) {
            let success = await dateInDraft.delete();

            if (success) {
                return res
                    .status(200)
                    .json(helper.successResponse(success, 200, "Date deleted successfully!"));
            } else {
                return res
                    .status(500)
                    .json(
                        helper.errorResponse(
                            { error: "Failed to create date. Refresh the page and retry." },
                            500,
                            "Failed to create date. Refresh the page and retry."
                        )
                    );
            }
        } else {
            return res.status(200).json(helper.successResponse([], 200, "Draft Date not found!"));
        }
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to create date"));
    }
};

/**
 * delete Dates by date ids
 */
exports.deleteDateByIds = async (req, res) => {
    try {
        const ids = Array.isArray(req.body?.ids)
            ? req.body.ids.filter(Boolean)
            : req.body?.ids
            ? [req.body.ids]
            : [];

        if (!ids.length) {
            return res
                .status(400)
                .json(helper.errorResponse({ error: "No date ids provided." }, 400, "No date ids provided."));
        }

        const datesDeleted = await Dates.deleteMany({
            _id: { $in: ids },
        });

        if (datesDeleted.deletedCount) {
            return res
                .status(200)
                .json(helper.successResponse(datesDeleted, 200, "Date deleted successfully!"));
        } else {
            return res.status(200).json(helper.successResponse([], 200, " Dates not found!"));
        }
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to delete dates."));
    }
};

/**
 * Update draft date status
 */
exports.updateDraftStatus = async (req, res) => {
    try {
        const { date_status, image_index } = req.body;

        let { user_name, role } = req.datajwt.userdata;

        if (role == 2) {
            return res
                .status(400)
                .json(helper.errorResponse(error, 400, "Admin can not update draft date."));
        }

        const dateInDraft = await Dates.findOne({ date_status: false, user_name: user_name });

        if (dateInDraft) {
            if (date_status === true) {
                // CRITICAL FIX: Only count ACTIVE dates (status=2), not drafts
                const activeDatesCount = await Dates.countDocuments({
                    date_status: true,
                    user_name,
                    status: 2, // Only count active/live dates
                });

                if (activeDatesCount >= 4) {
                    return res
                        .status(403)
                        .json(
                            helper.errorResponse(
                                { error: "You've reached your limit of 4 active dates." },
                                403,
                                "You've reached your limit of 4 active dates."
                            )
                        );
                }
            }

            dateInDraft.date_status = date_status;
            // CRITICAL FIX: Update image_index when publishing draft
            if (typeof image_index === 'number') {
                dateInDraft.image_index = image_index;
            }
            // dateInDraft.is_new = false;
            dateInDraft.updated_at = new Date();
            await dateInDraft.save();
            return res
                .status(200)
                .json(helper.successResponse(dateInDraft, 200, "Date fetched successfully!"));
        }

        return res
            .status(404)
            .json(helper.successResponse(dateInDraft, 200, "Draft date not found!"));
    } catch (error) {
        res.status(400).json(
            helper.errorResponse({ error: error.message }, 400, "Failed to update date")
        );
    }
};

/**
 * @param req
 * @param res
 * Update date status as 1 : Pending, 2: Verified, 3 Block ( deactivated ), 4: Delete ( soft ), 6: Warned 7: Re Submitted
 */
exports.updateStatus = async (req, res) => {
    try {
        const loginUserId = req.datajwt.userdata._id; //admin ID
        const { status, ids } = req.body;

        Dates.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    status: +status,
                    // is_new: false,
                    is_blocked_by_admin: 1,
                    blocked_date: new Date(),
                },
                updated_at: new Date(),
            },
            (error, result) => {
                logger.debug(result);
                if (error) {
                    return res
                        .status(400)
                        .json(helper.errorResponse(error, 400, "Failed to update date status"));
                }
                if (result.modifiedCount >= 1) {
                    ChatRoom.updateMany(
                        { date_id: { $in: ids } },
                        {
                            $set: { status: 2, blocked_by: loginUserId, is_blocked_by_admin: 1 },
                            updated_at: new Date(),
                        },
                        (error, result) => {
                            if (error) {
                                return res
                                    .status(400)
                                    .json(
                                        helper.errorResponse(
                                            error,
                                            400,
                                            "Failed to update date associated chatrooms status"
                                        )
                                    );
                            }
                            return res
                                .status(200)
                                .json(
                                    helper.successResponse(
                                        [],
                                        201,
                                        "Date status updated successfully!"
                                    )
                                );
                        }
                    );
                } else {
                    return res
                        .status(200)
                        .json(helper.successResponse([], 201, "Date status updated successfully!"));
                }
                return res
                    .status(200)
                    .json(helper.successResponse([], 201, "Date status updated successfully!"));
            }
        );
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

exports.getStats = async (req, res) => {
    let stats = {
        total_dates: 0,
        verified_dates: 0,
        pending_dates: 0,
        deactivated_dates: 0,
        new_dates: 0,
        warned_dates: 0,
        re_submitted_dates: 0,
    };
    try {
        const totalDates = await Dates.countDocuments({
            status: { $nin: [3, 6] },
            date_status: true,
        });

        const pendingDates = await Dates.aggregate([
            { $match: { date_status: false } },
            { $count: "pending_dates" },
        ]);

        const verifiedDates = await Dates.aggregate([
            { $match: { date_status: true } },
            { $count: "verified_dates" },
        ]);

        const deactivatedDates = await Dates.aggregate([
            { $match: { status: 3 } },
            { $count: "deactivated_dates" },
        ]);

        const newDates = await Dates.aggregate([
            { $match: { is_new: true, date_status: true } },
            { $count: "new_dates" },
        ]);

        const warnedDates = await Dates.aggregate([
            { $match: { status: 6 } },
            { $count: "warned_dates" },
        ]);

        const reSubmittedDates = await Dates.aggregate([
            { $match: { status: 7 } },
            { $count: "re_submitted_dates" },
        ]);

        if (totalDates) {
            stats.total_dates = totalDates;
        }

        if (verifiedDates.length) {
            stats.verified_dates = verifiedDates[0].verified_dates;
        }

        if (pendingDates.length) {
            stats.pending_dates = pendingDates[0].pending_dates;
        }

        if (deactivatedDates.length) {
            stats.deactivated_dates = deactivatedDates[0].deactivated_dates;
        }

        if (newDates.length) {
            stats.new_dates = newDates[0].new_dates;
        }

        if (warnedDates.length) {
            stats.warned_dates = warnedDates[0].warned_dates;
        }

        if (reSubmittedDates.length) {
            stats.re_submitted_dates = reSubmittedDates[0].re_submitted_dates;
        }

        res.status(200).json(helper.successResponse(stats, 200, "Posts ( Dates ) stats."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse(error, 500, error));
    }
};

// Make is new false
exports.seenDatesByIds = async (req, res) => {
    try {
        const { ids } = req.body;

        const datesUpdated = await Dates.updateMany({ _id: { $in: ids } }, { is_new: false });

        if (datesUpdated) {
            return res
                .status(200)
                .json(helper.successResponse(datesUpdated, 200, "Date updated successfully!"));
        } else {
            return res.status(200).json(helper.successResponse([], 200, "Dates not found!"));
        }
    } catch (error) {
        return res
            .status(400)
            .json(helper.errorResponse({ error: error.message }, 400, "Failed to delete dates."));
    }
};
