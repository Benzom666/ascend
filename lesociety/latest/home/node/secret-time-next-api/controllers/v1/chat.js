const { response } = require("express");
const { find } = require("lodash");
const helper = require("../../helpers/helper");
const chatRoom = require("../../models/chat_room");
const user = require("../../models/user");
const chat = require("../../models/chat");
const date = require("../../models/dates");
const _ = require("lodash");
const { createLogger } = require("../../lib/logger");

const logger = createLogger('chat');
var currentSocket = [];
const REQUEST_EXPIRY_HOURS = 48;

exports.SocketInit = async (socket, socketUser) => {
    currentSocket[socketUser.user?._id] = { socket, user: socketUser.user };
    // on message sent, make it dynamic, for security
    let messageLsnr = `send-${socketUser.user?.user_name}`;
    let readedChat = `recieve-${socketUser.user?._id}`;

    /**
     * event should be called from frontend to send message
     * @param  recieverId
     * @param message
     * @param chatRoomId
     */
    socket.on("sendMessage", async (message) => {
        logger.debug('Message received', { userId: socketUser.user?._id, messageLength: message?.message?.length });

        // NOTE: Female token deduction on sendMessage was removed.
        // Females only pay tokens when they ACCEPT a request (in acceptRequest handler below).
        // Charging on every message sent was the bug — females were losing tokens silently
        // even when just rejecting/ignoring a request or when it expired.

        // store on db
        chat.create(
            {
                sender_id: socketUser.user._id,
                receiver_id: message.recieverId,
                sent_time: new Date(),
                message: message.message,
                room_id: message.chatRoomId,
            },
            (err, chat) => {
                if (!err) {
                    // logger.debug("here we got the data", "recieve-" + message.recieverId, chat); // Disabled for performance
                    socket.broadcast.emit("recieve-" + message.recieverId, chat); // will pass the message to other receivers
                } else {
                    logger.debug(err.message);
                }
            }
        );
    });

    /**
     * event should be called whenever socket connection would be breaked
     */
    socket.on("disconnect", () => {
        logger.debug("SOCKET SEVER DISCONNECT");
    });

    /**
     * this event should be called by reciever side to confirm that messages has been readed
     * @param recieverId
     * @param senderId
     * @param chatId
     */

    socket.on("readMessage", (data) => {
        let { recieverId, senderId, chatId } = data;
        if (chatId.length > 0 && recieverId != undefined && senderId != undefined) {
            chat.updateMany(
                { _id: { $in: chatId }, receiver_id: recieverId, read_date_time: null },
                { read_date_time: new Date() },
                (err, data) => {
                    if (!err) {
                        logger.debug("here we got thedata ");
                        socket.broadcast.emit("readed-" + senderId, {
                            id: chatId,
                            recieverId: recieverId,
                        }); // will pass the message to other receviers
                    }
                }
            );
        } else {
            logger.debug("data incomplete");
        }
    });

    /**
     * this event should be called by sender side to delete the message
     * @param recieverId
     * @param senderId
     * @param chatId
     */

    socket.on("deleteMessage", (data) => {
        let { recieverId, senderId, chatId } = data;
        if (chatId.length > 0 && recieverId != undefined && senderId != undefined) {
            chat.findOneAndDelete({ _id: { $in: chatId }, senderId: senderId }, (err, data) => {
                if (!err) {
                    logger.debug("here we got thedata ");
                    socket.broadcast.emit("deleted-" + recieverId, {
                        id: chatId,
                        senderId: senderId,
                    }); // will pass the message to other receviers
                }
            });
        } else {
            logger.debug("data incomplete");
        }
    });
};

exports.createRequest = async (req, res, next) => {
    const { recieverId, message, dateId, isSuperInterested = false } = req.body;
    const { userdata } = req.datajwt;
    let debitedUser = null;
    const now = new Date();

    const refundDebitedToken = async () => {
        if (userdata.gender !== "male") return;
        if (isSuperInterested) {
            await user.updateOne({ _id: userdata._id }, { $inc: { super_interested_tokens: 1 } });
        } else {
            await user.updateOne({ _id: userdata._id }, { $inc: { interested_tokens: 1 } });
        }
    };

    try {
        const existingRoom = await chatRoom.findOne({
            users: { $all: [userdata._id, recieverId] },
            date_id: dateId,
            $or: [
                { status: { $in: [1, 2] } },
                {
                    status: 0,
                    $or: [
                        { expires_at: null },
                        { expires_at: { $exists: false } },
                        { expires_at: { $gt: now } },
                    ],
                },
            ],
        }).sort({ created_date: -1 });

        const debitMaleTokens = async () => {
            if (userdata.gender !== "male") return null;
            if (isSuperInterested) {
                debitedUser = await user.findOneAndUpdate(
                    { _id: userdata._id, super_interested_tokens: { $gt: 0 } },
                    { $inc: { super_interested_tokens: -1 } },
                    { new: true, projection: { interested_tokens: 1, super_interested_tokens: 1 } }
                );
                if (!debitedUser) {
                    return res.status(403).json(
                        helper.errorResponse(
                            [],
                            403,
                            "You need Super Interested tokens to send this request. Please top up."
                        )
                    );
                }
            } else {
                debitedUser = await user.findOneAndUpdate(
                    { _id: userdata._id, interested_tokens: { $gt: 0 } },
                    { $inc: { interested_tokens: -1 } },
                    { new: true, projection: { interested_tokens: 1, super_interested_tokens: 1 } }
                );
                if (!debitedUser) {
                    return res.status(403).json(
                        helper.errorResponse(
                            [],
                            403,
                            "You need Interested tokens to send this request. Please top up."
                        )
                    );
                }
            }
            return null;
        };

        if (existingRoom) {
            const debitResponse = await debitMaleTokens();
            if (debitResponse) return debitResponse;

            try {
                const createdChat = await chat.create({
                    sender_id: userdata._id,
                    receiver_id: recieverId,
                    sent_time: new Date(),
                    message: message,
                    room_id: existingRoom._id,
                });

                if (currentSocket[userdata._id]) {
                    currentSocket[userdata._id].socket.broadcast.emit(
                        "recieve-" + recieverId,
                        createdChat
                    );
                }
            } catch (chatErr) {
                logger.debug(chatErr.message);
            }

            return res.status(200).json(
                helper.successResponse(
                    {
                        chatRoom: existingRoom,
                        userBalances: debitedUser
                            ? {
                                  interested_tokens: debitedUser.interested_tokens || 0,
                                  super_interested_tokens: debitedUser.super_interested_tokens || 0,
                              }
                            : null,
                    },
                    200,
                    "Room already exist !"
                )
            );
        }

        const debitResponse = await debitMaleTokens();
        if (debitResponse) return debitResponse;

        const cr = await chatRoom.create({
            users: [userdata._id, recieverId],
            status: 0,
            date_id: dateId,
            requester_id: userdata._id,
            expires_at: new Date(Date.now() + REQUEST_EXPIRY_HOURS * 60 * 60 * 1000),
            isSuperInterested: isSuperInterested,
        });

        if (currentSocket[userdata._id]) {
            currentSocket[userdata._id].socket.broadcast.emit("request-" + recieverId, cr);
        }

        try {
            const createdChat = await chat.create({
                sender_id: userdata._id,
                receiver_id: recieverId,
                sent_time: new Date(),
                message: message,
                room_id: cr._id,
            });

            if (currentSocket[userdata._id]) {
                currentSocket[userdata._id].socket.broadcast.emit(
                    "recieve-" + recieverId,
                    createdChat
                );
            }
        } catch (chatErr) {
            logger.debug(chatErr.message);
        }

        return res.status(200).json(
            helper.successResponse(
                {
                    chatRoom: cr,
                    userBalances: debitedUser
                        ? {
                              interested_tokens: debitedUser.interested_tokens || 0,
                              super_interested_tokens: debitedUser.super_interested_tokens || 0,
                          }
                        : null,
                },
                200,
                "Chat room created successfully !"
            )
        );
    } catch (err) {
        if (debitedUser) {
            try {
                await refundDebitedToken();
            } catch (refundErr) {
                logger.debug("Token refund failed after request creation error:", refundErr.message);
            }
        }
        return res.status(500).json(helper.errorResponse(err, 500, "Something went wrong."));
    }
};

exports.acceptRequest = async (req, res, next) => {
    try {
        const { chatRoomId, senderId } = req.body;
        const { userdata } = req.datajwt;
        if (userdata.gender == "female") {
            const chatR = await chatRoom.findOne({
                _id: chatRoomId,
                users: { $in: userdata._id },
                status: 0,
            });

            if (!chatR) {
                return res.status(404).json(
                    helper.successResponse(
                        {
                            chatRoom: "",
                        },
                        404,
                        "Requested chat room not found!"
                    )
                );
            }

            let debitedBalanceField = "chat_tokens";
            let updatedFemaleUser = await user.findOneAndUpdate(
                { _id: userdata._id, chat_tokens: { $gt: 0 } },
                { $inc: { chat_tokens: -1 } },
                { new: true, projection: { chat_tokens: 1, remaining_chats: 1 } }
            );

            if (!updatedFemaleUser) {
                debitedBalanceField = "remaining_chats";
                updatedFemaleUser = await user.findOneAndUpdate(
                    { _id: userdata._id, remaining_chats: { $gt: 0 } },
                    { $inc: { remaining_chats: -1 } },
                    { new: true, projection: { chat_tokens: 1, remaining_chats: 1 } }
                );
            }

            if (!updatedFemaleUser) {
                return res
                    .status(403)
                    .json(
                        helper.errorResponse(
                            {},
                            403,
                            "You have no conversation balance left. Please top up."
                        )
                    );
            }

            const updateResult = await chatRoom.updateOne(
                { _id: chatRoomId, users: { $in: userdata._id }, status: 0 },
                { status: 1, expires_at: null, update_date: new Date() }
            );

            if (updateResult.modifiedCount < 1) {
                await user.updateOne(
                    { _id: userdata._id },
                    debitedBalanceField === "chat_tokens"
                        ? { $inc: { chat_tokens: 1 } }
                        : { $inc: { remaining_chats: 1 } }
                );
                return res
                    .status(400)
                    .json(helper.errorResponse("", 400, "failed to update status"));
            }

            if (currentSocket[userdata._id]) {
                chatR.status = 1;
                currentSocket[userdata._id].socket.broadcast.emit(
                    "requestAccept-" + senderId,
                    chatR
                );
            }
            chatR.status = 1;
            chatR.expires_at = null;
            return res.status(200).json(
                helper.successResponse(
                    {
                        chatRoom: chatR,
                        userBalances: {
                            chat_tokens: updatedFemaleUser.chat_tokens || 0,
                            remaining_chats: updatedFemaleUser.remaining_chats || 0,
                        },
                    },
                    200,
                    "Accepted!!"
                )
            );
        } else {
            return res
                .status(401)
                .json(helper.errorResponse({}, 401, "You are not Authorized for this request."));
        }
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

exports.rejectRequest = (req, res) => {
    try {
        let { chatRoomId, senderId } = req.body;
        let { userdata } = req.datajwt;

        if (userdata.gender !== "female") {
            return res
                .status(401)
                .json(helper.errorResponse({}, 401, "You are not Authorized for this request."));
        }

        chatRoom.findOne(
            { _id: chatRoomId, users: { $in: userdata._id }, status: 0 },
            (err, chatR) => {
                if (err) {
                    return res.status(500).json(helper.errorResponse("", 500, err.message));
                }

                if (!chatR) {
                    return res.status(404).json(
                        helper.successResponse({ chatRoom: "" }, 404, "Requested chat room not found!")
                    );
                }

                chatRoom.updateOne(
                    { _id: chatRoomId, users: { $in: userdata._id }, status: 0 },
                    { status: 3, update_date: new Date(), expires_at: null },
                    (updateErr, data) => {
                        if (updateErr || data.modifiedCount < 1) {
                            return res
                                .status(400)
                                .json(helper.errorResponse("", 400, "failed to update status"));
                        }

                        if (currentSocket[userdata._id]) {
                            chatR.status = 3;
                            currentSocket[userdata._id].socket.broadcast.emit(
                                "requestReject-" + senderId,
                                chatR
                            );
                        }

                        chatR.status = 3;
                        return res
                            .status(200)
                            .json(helper.successResponse({ chatRoom: chatR }, 200, "Rejected!!"));
                    }
                );
            }
        );
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

/*
exports.chatRoomList = async ( req, res, next )=>{
    try{
        let {userdata} = req.datajwt;
        let dataToSend=[];
        await chatRoom.find({ "users": { "$in": userdata._id } }).populate('users').populate('date_id').populate('blocked_by')
            .exec(async (err, List) => {

            if (!List.length) {
                return res.status(200).json(helper.successResponse({ 'chatRooms': List }, 200, 'No chatroom.'));
            }

            List.forEach( async (room, key)=>{
                let chats = await chat.find({"room_id": room._id}).sort({created_date: -1}).exec();
                logger.debug("chat message", room);
                room.users.forEach((user, i)=>{
                    if(user._id != userdata._id){
                        // logger.debug("here", key)
                        dataToSend[key] = {
                                            user: helper.userResponse(user),
                                            status:  List[key].status,
                                            _id: List[key]._id,
                                            message: chats[0],
                                            date_id: List[key].date_id,
                                            blocked_by:List[key].blocked_by,
                                            created_date: List[key].created_date
                                            }
                    }
                });
                if(key+1 == List.length){
                    return res.status(200).json(helper.successResponse({
                        // 'chatRooms': dataToSend
                        'chatRooms': _.without(dataToSend, null)
                      }, 200, 'List fetched!'));
                }
            });

        });

    }catch(err){
        return res.status(500).json(helper.errorResponse(err.message, 500, 'Something went wrong.'));
    }
}
*/

exports.chatRoomList = async (req, res, next) => {
    try {
        let { userdata } = req.datajwt;
        let dataToSend = [];

        var populateQuery = [{ path: "users" }, { path: "date_id" }, { path: "blocked_by" }];
        // select:['_id','images','user_name']
        let chatRoomModel = await chatRoom
            .find({ users: { $in: userdata._id } })
            .populate(populateQuery)
            .lean();

        await Promise.all(
            chatRoomModel.map(async (chatRoom) => {
                try {
                    let otherUserName;
                    chatRoom.users.forEach((user) => {
                        if (user.user_name !== userdata.user_name) {
                            otherUserName = user;
                        }
                    });
                    let chats = await chat
                        .find({ room_id: chatRoom._id })
                        .sort({ created_date: -1 })
                        .limit(1)
                        .exec();
                    let data = {
                        user: helper.userResponse(otherUserName),
                        status: chatRoom.status,
                        _id: chatRoom._id,
                        message: chats[0],
                        date_id: chatRoom.date_id,
                        blocked_by: chatRoom.blocked_by,
                        created_date: chatRoom.created_date,
                        expires_at: chatRoom.expires_at,
                        isSuperInterested: chatRoom.isSuperInterested || false,
                    };
                    dataToSend.push(data);
                } catch (error) {
                    logger.debug("error" + error);
                }
            })
        );
        return res.status(200).json(
            helper.successResponse(
                {
                    chatRooms: dataToSend,
                    // 'chatRooms': _.without(dataToSend, null)
                },
                200,
                "List fetched!"
            )
        );
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

exports.chatRoomHistory = async (req, res, next) => {
    try {
        let { chatRoomId, page = 1, limit = 50 } = req.query;
        let { userdata } = req.datajwt;
        
        // Validate and sanitize pagination params
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 50)); // Max 100 messages per request
        
        const chatR = await chatRoom.findOne({
            _id: chatRoomId,
            users: { $in: [userdata._id] }
        });
        
        if (!chatR) {
            return res.status(401).json(
                helper.errorResponse({}, 401, "You are not authorized to access this chat room.")
            );
        }
        
        // Get total count for pagination info
        const totalMessages = await chat.countDocuments({ room_id: chatRoomId });
        const totalPages = Math.ceil(totalMessages / limit);
        const skip = (page - 1) * limit;
        
        // Fetch paginated messages
        const messages = await chat
            .find({ room_id: chatRoomId })
            .sort({ created_date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        return res.status(200).json(
            helper.successResponse({
                chat: messages.reverse(), // Return in chronological order
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_messages: totalMessages,
                    total_pages: totalPages,
                    has_more: page < totalPages
                }
            }, 200, "Chat history fetched!")
        );
    } catch (err) {
        return res.status(500).json(
            helper.errorResponse(err.message, 500, "Something went wrong.")
        );
    }
};

/**
 * this function called to block user from user model and from all chat rooms
 * @param req.body
 */
exports.blockRequest = async (req, res, next) => {
    try {
        let { chatRoomId, recieverId } = req.body;
        let { userdata } = req.datajwt;

        chatRoom.findOne(
            { _id: chatRoomId, users: { $in: userdata._id }, status: 1 },
            (err, chatR) => {
                if (!err && chatR != null) {
                    chatRoom.updateOne(
                        { _id: chatRoomId, users: { $in: userdata._id }, status: 1 },
                        { status: 2, blocked_by: userdata._id },
                        (err, data) => {
                            logger.debug("this is data", data);
                            if (!err && data.modifiedCount >= 1) {
                                if (currentSocket[userdata._id]) {
                                    chatR.status = 2;
                                    currentSocket[userdata._id].socket.broadcast.emit(
                                        "requestBlock-" + recieverId,
                                        chatR
                                    );
                                }
                                chatR.status = 2;
                                chatR.blocked_by = userdata._id;
                                updateBlockedUsersInUserModel(userdata, recieverId, (err, data) => {
                                    if (err) {
                                        return res
                                            .status(400)
                                            .json(
                                                helper.errorResponse(
                                                    "",
                                                    400,
                                                    "Something went wrong while doing complete user block",
                                                    err
                                                )
                                            );
                                    }
                                    findAndBlockOtherChatRooms(
                                        userdata._id,
                                        recieverId,
                                        (err, data) => {
                                            if (err) {
                                                return res
                                                    .status(400)
                                                    .json(
                                                        helper.errorResponse(
                                                            "",
                                                            400,
                                                            "Something went wrong while finding and blocking other ChatRooms",
                                                            err
                                                        )
                                                    );
                                            }
                                            return res
                                                .status(200)
                                                .json(
                                                    helper.successResponse(
                                                        { chatRoom: chatR },
                                                        200,
                                                        "Accepted!!"
                                                    )
                                                );
                                        }
                                    );
                                });
                            } else {
                                return res
                                    .status(400)
                                    .json(helper.errorResponse("", 400, "failed to update status"));
                            }
                        }
                    );
                } else {
                    return res.status(404).json(
                        helper.successResponse(
                            {
                                chatRoom: "",
                            },
                            404,
                            "Requested chat room not found!"
                        )
                    );
                }
            }
        );
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

/**
 * this callback function used to find and block all the chat rooms of the given user
 * @param loginUserId
 * @param recieverId
 */
const findAndBlockOtherChatRooms = (loginUserId, recieverId, callback) => {
    chatRoom.find(
        {
            $and: [
                { users: { $in: [loginUserId] } },
                { users: { $in: [recieverId] } },
                { status: 1 },
            ],
        },
        (err, data) => {
            if (err) {
                // logger.debug(`Something went wrong while finding other chat room to block for this user ${loginUserId}`, err);
                callback(err, null);
            }
            if (data.length > 0) {
                let chatRoomIds = data.map((value) => {
                    return value._id.toString();
                });
                chatRoom.updateMany(
                    { _id: { $in: chatRoomIds }, users: { $in: loginUserId }, status: 1 },
                    { $set: { status: 2, blocked_by: loginUserId } },
                    { multi: true },
                    (err, res) => {
                        if (err) {
                            // logger.debug(`Something went wrong while updating following chat room ${chatRoomIds} to block for this user ${loginUserId}`, err);
                            callback(err, null);
                        }
                        logger.debug(
                            `Following chat rooms ${chatRoomIds} blocked successfully for this user ${loginUserId}`,
                            res
                        );
                        callback(null, data);
                    }
                );
            }
            logger.debug(`No chat rooms found for this user ${loginUserId}`);
            callback(null, data);
        }
    );
};

/**
 * this callback function used to block the user to see any dates of the blocked user
 * @param loginUserId
 * @param recieverId
 */
const updateBlockedUsersInUserModel = ({ _id, user_name }, recieverId, callback) => {
    user.findByIdAndUpdate(
        recieverId,
        { $push: { blocked_by_others: { $each: [user_name] } } },
        (err, result) => {
            if (err) {
                callback(err, null);
            }
            user.findByIdAndUpdate(
                _id,
                { $push: { blocked_users_by_self: { $each: [result.user_name] } } },
                (err, result) => {
                    if (err) {
                        callback(err, null);
                    }
                    callback(null, result);
                }
            );
        }
    );
};

/**
 * this function called to unblock user from user model and from all chat rooms
 * @param req.body
 */
exports.unBlockRequest = async (req, res) => {
    try {
        let { chatRoomId, recieverId } = req.body;
        let { userdata } = req.datajwt;

        chatRoom.findOne(
            { _id: chatRoomId, users: { $in: userdata._id }, status: 2 },
            (err, chatR) => {
                if (!err && chatR != null) {
                    chatR.blocked_by = undefined;
                    chatRoom.updateOne(
                        { _id: chatRoomId, users: { $in: userdata._id }, status: 2 },
                        { $unset: { blocked_by: 1 }, status: 1 },
                        (err, data) => {
                            logger.debug("this is data", data);
                            if (!err && data.modifiedCount >= 1) {
                                if (currentSocket[userdata._id]) {
                                    chatR.status = 1;
                                    currentSocket[userdata._id].socket.broadcast.emit(
                                        "requestBlock-" + recieverId,
                                        chatR
                                    );
                                }
                                chatR.status = 1;
                                updateUnBlockedUsersInUserModel(
                                    userdata,
                                    recieverId,
                                    (err, data) => {
                                        if (err) {
                                            return res
                                                .status(400)
                                                .json(
                                                    helper.errorResponse(
                                                        "",
                                                        400,
                                                        "Something went wrong while doing complete user block",
                                                        err
                                                    )
                                                );
                                        }
                                        findAndUnBlockOtherChatRooms(
                                            userdata._id,
                                            recieverId,
                                            (err, data) => {
                                                if (err) {
                                                    return res
                                                        .status(400)
                                                        .json(
                                                            helper.errorResponse(
                                                                "",
                                                                400,
                                                                "Something went wrong while finding and blocking other ChatRooms",
                                                                err
                                                            )
                                                        );
                                                }
                                                return res
                                                    .status(200)
                                                    .json(
                                                        helper.successResponse(
                                                            { chatRoom: chatR },
                                                            200,
                                                            "Accepted!!"
                                                        )
                                                    );
                                            }
                                        );
                                    }
                                );
                            } else {
                                return res
                                    .status(400)
                                    .json(helper.errorResponse("", 400, "failed to update status"));
                            }
                        }
                    );
                } else {
                    return res.status(404).json(
                        helper.successResponse(
                            {
                                chatRoom: "",
                            },
                            404,
                            "Requested chat room not found!"
                        )
                    );
                }
            }
        );
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

/**
 * this callback function used to unblock the user to see any dates of the blocked user
 * @param Object
 * @param recieverId
 */
const updateUnBlockedUsersInUserModel = ({ _id, user_name }, recieverId, callback) => {
    user.findByIdAndUpdate(
        recieverId,
        { $pullAll: { blocked_by_others: [user_name] } },
        (err, result) => {
            if (err) {
                callback(err, null);
            }
            user.findByIdAndUpdate(
                _id,
                { $pullAll: { blocked_users_by_self: [result.user_name] } },
                (err, result) => {
                    if (err) {
                        callback(err, null);
                    }
                    callback(null, result);
                }
            );
        }
    );
};

/**
 * this callback function used to find and unblock all the chat rooms of the given user
 * @param loginUserId
 * @param recieverId
 */
const findAndUnBlockOtherChatRooms = (loginUserId, recieverId, callback) => {
    chatRoom.find(
        {
            $and: [
                { users: { $in: [loginUserId] } },
                { users: { $in: [recieverId] } },
                { is_blocked_by_admin: { $ne: 1 } },
                { status: 2 },
            ],
        },
        (err, data) => {
            if (err) {
                // logger.debug(`Something went wrong while finding other chat room to block for this user ${loginUserId}`, err);
                callback(err, null);
            }
            if (data.length > 0) {
                let chatRoomIds = data.map((value) => {
                    return value._id.toString();
                });
                chatRoom.updateMany(
                    {
                        _id: { $in: chatRoomIds },
                        is_blocked_by_admin: { $ne: 1 },
                        users: { $in: loginUserId },
                        status: 2,
                    },
                    { $unset: { blocked_by: 1 }, status: 1 },
                    { multi: true },
                    (err, res) => {
                        if (err) {
                            // logger.debug(`Something went wrong while updating following chat room ${chatRoomIds} to block for this user ${loginUserId}`, err);
                            callback(err, null);
                        }
                        logger.debug(
                            `Following chat rooms ${chatRoomIds} blocked successfully for this user ${loginUserId}`,
                            res
                        );
                        callback(null, data);
                    }
                );
            }
            logger.debug(`No chat rooms found for this user ${loginUserId}`);
            callback(null, data);
        }
    );
};

/**
 * Handle cron
 */
exports.handleCron = async () => {
    logger.debug("CRON TRIGGERED");

    // Expire pending requests after REQUEST_EXPIRY_HOURS and auto-refund token once.
    try {
        const now = new Date();
        const legacyPendingRooms = await chatRoom
            .find({
                status: 0,
                $or: [{ expires_at: null }, { expires_at: { $exists: false } }],
            })
            .select("_id created_date")
            .lean();

        for (const room of legacyPendingRooms) {
            const created = room.created_date ? new Date(room.created_date) : new Date();
            const legacyExpiry = new Date(
                created.getTime() + REQUEST_EXPIRY_HOURS * 60 * 60 * 1000
            );
            await chatRoom.updateOne(
                { _id: room._id, status: 0 },
                { $set: { expires_at: legacyExpiry, update_date: now } }
            );
        }

        const expiringRooms = await chatRoom
            .find({
                status: 0,
                expires_at: { $ne: null, $lte: now },
            })
            .select("_id requester_id users isSuperInterested is_refunded")
            .lean();

        for (const room of expiringRooms) {
            const requesterId = room.requester_id || (room.users && room.users[0]);
            if (!requesterId) continue;

            if (!room.is_refunded) {
                const tokenField = room.isSuperInterested
                    ? "super_interested_tokens"
                    : "interested_tokens";
                await user.findByIdAndUpdate(requesterId, {
                    $inc: { [tokenField]: 1 },
                    $set: { updated_at: now },
                });
            }

            await chatRoom.updateOne(
                { _id: room._id, status: 0 },
                {
                    $set: {
                        status: 4, // ignored/expired
                        is_refunded: true,
                        update_date: now,
                    },
                }
            );
        }
    } catch (expiryErr) {
        logger.debug("failed to expire pending chat requests", expiryErr);
    }

    chat.find({ read_date_time: null, mail_notified: { $in: [0, null] } })
        .populate("receiver_id")
        .populate("sender_id")
        .populate("room_id")
        .exec((err, data) => {
            if (!err && data.length > 0) {
                let email = [];

                data.forEach((data, i) => {
                    email[i] = {
                        to: data?.receiver_id?.email,
                        sender: data?.sender_id?.email,
                        senderUserName: data?.sender_id?.user_name,
                        dateId: data?.room_id?.date_id,
                        message: data?.message,
                    };

                    chat.updateOne({ _id: data._id }, { mail_notified: 1 }, (err, data) => {
                        if (!err) {
                            logger.debug("mail data updated", data, data._id);
                        } else {
                            logger.debug(err);
                        }
                    });
                });

                let mailData = _.uniqBy(email, "to");
                let dataDateType;
                mailData.forEach(async (data) => {
                    dataDateType = await date.findOne({ _id: data.dateId });
                    let { standard_class_date, middle_class_dates, executive_class_dates, price } =
                        dataDateType;
                    let dateType = middle_class_dates
                        ? middle_class_dates
                        : standard_class_date
                        ? standard_class_date
                        : executive_class_dates;

                    const emailData = {
                        to: data.to,
                        sender: data.sender,
                        userName: data.senderUserName,
                        host: process.env.FRONTEND_URL
                            ? process.env.FRONTEND_URL
                            : "http://localhost:3000",
                        template: "views/mails/unread-message-send-email.ejs",
                        message: data.message.substring(0, 25) + "...",
                        dateTypeWithPrice: `"${dateType}-$${price}"`,
                        subject: "New Message",
                    };
                    const mailResponse = helper.sendEmailNewSignup(emailData);
                });
            }
        });
};

exports.chatClear = async (req, res) => {
    try {
        let { chatRoomId, recieverId } = req.body;
        let { userdata } = req.datajwt;
        chatRoom.findOne({ _id: chatRoomId, users: { $in: userdata._id } }, (err, chatR) => {
            if (!err && chatR != null) {
                chat.deleteMany({ room_id: chatRoomId }, function () {
                    logger.debug("chatRoom: ", chatRoomId, ": Chat Deleted");
                    currentSocket[userdata._id]?.socket.broadcast.emit(
                        "chatRoomCleared-" + recieverId,
                        { deleted: true }
                    );
                    return res.status(200).json(
                        helper.successResponse(
                            {
                                chat: "chat deleted",
                            },
                            200,
                            "chat deleted!"
                        )
                    );
                }).catch(function (err) {
                    logger.debug(err);
                });
            } else {
                return res.status(400).json(helper.errorResponse("", 400, "failed to clear chat"));
            }
        });
    } catch (err) {
        return res
            .status(500)
            .json(helper.errorResponse(err.message, 500, "Something went wrong."));
    }
};

exports.chatRoomExists = async (req, res) => {
    let { recieverId, dateId } = req.query;
    let { userdata } = req.datajwt;
    const now = new Date();

    try {
        chatRoom.find(
            {
                users: { $all: [userdata._id, recieverId] },
                date_id: dateId,
                $or: [
                    { status: { $in: [1, 2] } },
                    {
                        status: 0,
                        $or: [
                            { expires_at: null },
                            { expires_at: { $exists: false } },
                            { expires_at: { $gt: now } },
                        ],
                    },
                ],
            },
            (err, cr) => {
                if (err) {
                    return res.status(500).json(helper.errorResponse([], 500, err.message));
                }

                cr = cr.sort((a, b) => {
                    const aTime = new Date(a.created_date || 0).getTime();
                    const bTime = new Date(b.created_date || 0).getTime();
                    return bTime - aTime;
                })[0];

                // room exists
                if (cr) {
                    return res
                        .status(200)
                        .json(helper.successResponse({ chatRoom: cr }, 200, true));
                }

                return res.status(200).json(helper.successResponse({ chatRoom: cr }, 200, false));
            }
        );
    } catch (err) {
        return res.status(500).json(helper.errorResponse(err, 500, "Something went wrong."));
    }
};

/**
 * Notification sender to web
 */
exports.pushNotification = (req, data) => {
    let { userdata } = req.datajwt;

    logger.debug("PUSH NOTIFICATION FIRED", data.receiverEmail);

    try {
        currentSocket[userdata._id]?.socket.broadcast.emit(
            `push-notification-${data.receiverEmail}`,
            data
        );
    } catch (err) {
        logger.debug("ERROR WHILE SENDING NOTIFICATION", err);
        // return false; // die silently for now
    }
};
