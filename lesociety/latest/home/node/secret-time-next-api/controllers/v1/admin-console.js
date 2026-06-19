/*
 * Admin Console (read-only oversight)
 * Unified, admin-protected view over profiles, their incoming interest
 * requests, chat rooms and message history. Read-only by design.
 */
const mongoose = require("mongoose");
const User = require("../../models/user");
const Requests = require("../../models/requests");
const Chat = require("../../models/chat");
const ChatRoom = require("../../models/chat_room");
const helper = require("../../helpers/helper");
const { getPaginationParams, getPaginatedResponse } = require("../../helpers/pagination");

const SAFE_USER_FIELDS =
    "user_name email gender first_name last_name age location country status role verified images created_at last_logged_in";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* GET /profiles - paginated list of all profiles with search/filter */
exports.listProfiles = async (req, res) => {
    try {
        const { search, gender, status, role } = req.query;
        const { limit, skip } = getPaginationParams(req.query);

        const filter = {};
        if (gender) filter.gender = gender;
        if (status !== undefined && status !== "") filter.status = Number(status);
        if (role !== undefined && role !== "") filter.role = Number(role);
        if (search) {
            const rx = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ user_name: rx }, { email: rx }, { first_name: rx }, { last_name: rx }];
        }

        const [profiles, total] = await Promise.all([
            User.find(filter).select(SAFE_USER_FIELDS).sort({ created_at: -1 }).limit(limit).skip(skip).lean(),
            User.countDocuments(filter),
        ]);

        return res
            .status(200)
            .json(helper.successResponse(getPaginatedResponse(profiles, total, req.query), 200, "Profiles fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

/* GET /profiles/:id - one profile with activity counts */
exports.getProfileOverview = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json(helper.errorResponse([], 400, "Invalid profile id."));

        const profile = await User.findById(id).select(SAFE_USER_FIELDS).lean();
        if (!profile) return res.status(404).json(helper.errorResponse([], 404, "Profile not found."));

        const [requestStats, chatRoomCount] = await Promise.all([
            Requests.aggregate([
                { $match: { receiver_id: profile.email } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            ChatRoom.countDocuments({ users: profile._id }),
        ]);

        const requests = { pending: 0, accepted: 0, rejected: 0, ignored: 0 };
        requestStats.forEach(({ _id, count }) => {
            if (_id === 0) requests.pending = count;
            else if (_id === 1) requests.accepted = count;
            else if (_id === 2) requests.rejected = count;
            else if (_id === 3) requests.ignored = count;
        });

        return res
            .status(200)
            .json(helper.successResponse({ profile, counts: { requests, chatRooms: chatRoomCount } }, 200, "Profile overview fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

/* GET /profiles/:id/requests - incoming interest requests for a profile */
exports.getProfileRequests = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json(helper.errorResponse([], 400, "Invalid profile id."));

        const profile = await User.findById(id).select("email").lean();
        if (!profile) return res.status(404).json(helper.errorResponse([], 404, "Profile not found."));

        const { limit, skip } = getPaginationParams(req.query);
        const filter = { receiver_id: profile.email };
        if (req.query.status !== undefined && req.query.status !== "") filter.status = Number(req.query.status);

        const [requests, total] = await Promise.all([
            Requests.find(filter, { __v: 0 }).sort({ created_date: -1 }).limit(limit).skip(skip).lean(),
            Requests.countDocuments(filter),
        ]);

        const requesterEmails = [...new Set(requests.map((r) => r.requester_id).filter(Boolean))];
        const requesters = await User.find({ email: { $in: requesterEmails } })
            .select("email user_name images gender")
            .lean();
        const requesterMap = requesters.reduce((acc, u) => ({ ...acc, [u.email]: u }), {});

        const data = requests.map((request) => ({
            ...request,
            requester: requesterMap[request.requester_id] || null,
        }));

        return res
            .status(200)
            .json(helper.successResponse(getPaginatedResponse(data, total, req.query), 200, "Profile requests fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

/* GET /profiles/:id/chatrooms - chat rooms involving a profile */
exports.getProfileChatRooms = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json(helper.errorResponse([], 400, "Invalid profile id."));

        const { limit, skip } = getPaginationParams(req.query);
        const filter = { users: id };

        const [rooms, total] = await Promise.all([
            ChatRoom.find(filter, { __v: 0 })
                .populate("users", "user_name email images gender")
                .sort({ update_date: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            ChatRoom.countDocuments(filter),
        ]);

        const data = await Promise.all(
            rooms.map(async (room) => {
                const [lastMessage, messageCount] = await Promise.all([
                    Chat.findOne({ room_id: room._id }).sort({ created_date: -1 }).select("message sender_id created_date").lean(),
                    Chat.countDocuments({ room_id: room._id }),
                ]);
                const otherUser = (room.users || []).find((u) => String(u._id) !== String(id)) || null;
                return { ...room, otherUser, lastMessage, messageCount };
            })
        );

        return res
            .status(200)
            .json(helper.successResponse(getPaginatedResponse(data, total, req.query), 200, "Profile chat rooms fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

/* GET /chatrooms/:roomId/messages - message history for a room */
exports.getChatRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!isValidId(roomId)) return res.status(400).json(helper.errorResponse([], 400, "Invalid room id."));

        const room = await ChatRoom.findById(roomId).populate("users", "user_name email images gender").lean();
        if (!room) return res.status(404).json(helper.errorResponse([], 404, "Chat room not found."));

        const { limit, skip } = getPaginationParams(req.query);
        const filter = { room_id: roomId };

        const [messages, total] = await Promise.all([
            Chat.find(filter, { __v: 0 })
                .populate("sender_id", "user_name images")
                .sort({ created_date: 1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            Chat.countDocuments(filter),
        ]);

        return res
            .status(200)
            .json(helper.successResponse({ room, ...getPaginatedResponse(messages, total, req.query) }, 200, "Messages fetched."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};

/* POST /chatrooms/:roomId/messages - send a message on behalf of a profile (operator) */
exports.sendOperatorMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { senderId } = req.body;
        const message = String(req.body.message || "").trim();

        if (!isValidId(roomId) || !isValidId(senderId))
            return res.status(400).json(helper.errorResponse([], 400, "Invalid room or sender id."));
        if (!message) return res.status(400).json(helper.errorResponse([], 400, "Message cannot be empty."));

        const room = await ChatRoom.findById(roomId).lean();
        if (!room) return res.status(404).json(helper.errorResponse([], 404, "Chat room not found."));

        const memberIds = (room.users || []).map(String);
        if (!memberIds.includes(String(senderId)))
            return res.status(400).json(helper.errorResponse([], 400, "Sender is not a member of this room."));

        const receiverId = memberIds.find((id) => id !== String(senderId));
        if (!receiverId) return res.status(400).json(helper.errorResponse([], 400, "No recipient found in this room."));

        const created = await Chat.create({
            sender_id: senderId,
            receiver_id: receiverId,
            room_id: roomId,
            message,
            sent_time: new Date(),
            sent_by_operator: true,
            operator_id: req.user._id,
        });

        await ChatRoom.updateOne({ _id: roomId }, { update_date: new Date() });

        // Deliver live to the real recipient using the same contract as normal messages.
        const io = req.app.get("io");
        if (io) io.emit("recieve-" + receiverId, created);

        return res.status(201).json(helper.successResponse(created, 201, "Message sent."));
    } catch (error) {
        return res.status(500).json(helper.errorResponse([], 500, error.message));
    }
};
