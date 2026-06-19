const { createLogger } = require("../../lib/logger");
const logger = createLogger("request");

/* eslint-disable no-console */
const Requests = require("../../models/requests");
const User = require("../../models/user");
const helper = require("../../helpers/helper");

const REQUEST_STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2,
    IGNORED: 3,
};

const addHours = (date, hours) => {
    const next = new Date(date);
    next.setHours(next.getHours() + hours);
    return next;
};

const refundRequestTokenIfNeeded = async (requestDoc) => {
    if (!requestDoc || requestDoc.is_refunded) return false;

    const tokenField =
        requestDoc.request_type === "super_interested"
            ? "super_interested_tokens"
            : "interested_tokens";

    const updatedUser = await User.findOneAndUpdate(
        { email: requestDoc.requester_id },
        { $inc: { [tokenField]: 1 }, $set: { updated_at: new Date() } },
        { new: true }
    );

    if (!updatedUser) return false;

    requestDoc.is_refunded = true;
    await requestDoc.save();
    return true;
};

exports.getAllRequests = async (req, res) => {
    try {
        const { email } = req.datajwt.userdata;
        const status = Number(req.query.status ?? REQUEST_STATUS.PENDING);

        const requests = await Requests.find(
            { receiver_id: email, status },
            { __v: 0 }
        ).sort({ created_date: -1 });

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { requests },
                    200,
                    requests.length ? "Requests received." : "No requests received."
                )
            );
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const { email } = req.datajwt.userdata;
        const now = new Date();

        const requests = await Requests.find(
            {
                receiver_id: email,
                status: REQUEST_STATUS.PENDING,
            },
            { __v: 0 }
        )
            .sort({ created_date: -1 })
            .lean();

        const requesterEmails = requests.map((r) => r.requester_id).filter(Boolean);
        const requesters = await User.find(
            { email: { $in: requesterEmails } },
            { _id: 1, email: 1, user_name: 1, images: 1 }
        ).lean();

        const requesterMap = requesters.reduce((acc, u) => {
            acc[u.email] = u;
            return acc;
        }, {});

        const data = requests.map((request) => {
            const requester = requesterMap[request.requester_id];
            const expiresAt = request.expires_at ? new Date(request.expires_at) : null;
            const hoursRemaining = expiresAt
                ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
                : 0;

            return {
                ...request,
                requester: requester
                    ? {
                          id: requester._id,
                          email: requester.email,
                          user_name: requester.user_name,
                          images: requester.images || [],
                      }
                    : null,
                hours_remaining: hoursRemaining,
            };
        });

        return res.status(200).json(helper.successResponse({ requests: data }, 200, "Pending requests fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const { receiver_id, date_id = "", message = "", request_type = "interested" } = req.body;
        const { gender, email } = req.datajwt.userdata;

        if (["f", "female"].includes(String(gender).toLowerCase())) {
            return res
                .status(400)
                .json(helper.errorResponse([], 400, "You are not allowed to send request!"));
        }

        const existingRequest = await Requests.findOne({
            requester_id: email,
            receiver_id,
            date_id,
            status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED] },
        }).sort({ created_date: -1 });

        if (existingRequest) {
            const messageByStatus =
                existingRequest.status === REQUEST_STATUS.PENDING
                    ? "Please wait for request approval."
                    : "Request already accepted. You can send message now.";
            return res.status(200).json(helper.successResponse(existingRequest, 200, messageByStatus));
        }

        const request = new Requests({
            requester_id: email,
            receiver_id,
            date_id,
            message,
            request_type: request_type === "super_interested" ? "super_interested" : "interested",
            expires_at: addHours(new Date(), 48),
        });

        const requestResponse = await request.save();
        return res
            .status(200)
            .json(helper.successResponse(requestResponse, 201, "Request sent. Please wait for the approval."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { request_id } = req.body;
        const { email } = req.datajwt.userdata;

        const request = await Requests.findOne({
            _id: request_id,
            receiver_id: email,
            status: REQUEST_STATUS.PENDING,
        });

        if (!request) {
            return res.status(404).json(helper.errorResponse([], 404, "Pending request not found."));
        }

        request.status = REQUEST_STATUS.ACCEPTED;
        request.update_date = new Date();
        await request.save();

        return res.status(200).json(helper.successResponse(request, 200, "Request accepted."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { request_id } = req.body;
        const { email } = req.datajwt.userdata;

        const request = await Requests.findOne({
            _id: request_id,
            receiver_id: email,
            status: REQUEST_STATUS.PENDING,
        });

        if (!request) {
            return res.status(404).json(helper.errorResponse([], 404, "Pending request not found."));
        }

        request.status = REQUEST_STATUS.REJECTED;
        request.update_date = new Date();
        await request.save();

        return res.status(200).json(helper.successResponse(request, 200, "Request rejected."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

exports.ignoreRequest = async (req, res) => {
    try {
        const { request_id } = req.body;
        const { email } = req.datajwt.userdata;

        const request = await Requests.findOne({
            _id: request_id,
            receiver_id: email,
            status: REQUEST_STATUS.PENDING,
        });

        if (!request) {
            return res.status(404).json(helper.errorResponse([], 404, "Pending request not found."));
        }

        request.status = REQUEST_STATUS.IGNORED;
        request.update_date = new Date();
        const refunded = await refundRequestTokenIfNeeded(request);

        return res
            .status(200)
            .json(
                helper.successResponse(
                    { request, refunded },
                    200,
                    refunded ? "Request ignored and token refunded." : "Request ignored."
                )
            );
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

// Get request statistics for inbox
exports.getRequestStats = async (req, res) => {
    try {
        const { email } = req.datajwt.userdata;

        const stats = await Requests.aggregate([
            { $match: { receiver_id: email } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            ignored: 0,
        };

        stats.forEach((stat) => {
            if (stat._id === REQUEST_STATUS.PENDING) result.pending = stat.count;
            if (stat._id === REQUEST_STATUS.ACCEPTED) result.accepted = stat.count;
            if (stat._id === REQUEST_STATUS.REJECTED) result.rejected = stat.count;
            if (stat._id === REQUEST_STATUS.IGNORED) result.ignored = stat.count;
        });

        return res
            .status(200)
            .json(helper.successResponse(result, 200, "Request statistics retrieved."));
    } catch (error) {
        logger.error("Error getting request stats:", error);
        return res.status(500).json(helper.errorResponse([], 500, "Failed to get statistics."));
    }
};
