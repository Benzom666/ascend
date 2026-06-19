/*
 * Schema for chat_room table
 */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatRoomSchema = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String }, // will be created dynamic
    status: { type: Number, default: 0 }, // 0=pending, 1=accepted, 2=blocked, 3=rejected, 4=ignored/expired
    blocked_by: { type: Schema.Types.ObjectId, ref: "User" },
    requester_id: { type: Schema.Types.ObjectId, ref: "User" },
    date_id: { type: Schema.Types.ObjectId, ref: "dates" },
    expires_at: { type: Date },
    is_refunded: { type: Boolean, default: false },
    deleted_date: { type: Date },
    is_blocked_by_admin: { type: Number, default: 0 },
    created_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },
    isSuperInterested: { type: Boolean, default: false },
});

ChatRoomSchema.index({ users: 1 });
ChatRoomSchema.index({ date_id: 1 });
ChatRoomSchema.index({ status: 1 });
ChatRoomSchema.index({ created_date: -1 });
ChatRoomSchema.index({ expires_at: 1, status: 1 });
ChatRoomSchema.index({ requester_id: 1, status: 1 });
// Hot paths: inbox and state transitions for a given user + status
ChatRoomSchema.index({ users: 1, status: 1, update_date: -1 });
// Hot path: dedupe/lookup pair room by date
ChatRoomSchema.index({ users: 1, date_id: 1, status: 1 });
// Hot path: unread/activity and timeline views
ChatRoomSchema.index({ users: 1, created_date: -1 });

const chatRoom = mongoose.model("chatRoom", ChatRoomSchema);

module.exports = chatRoom;
