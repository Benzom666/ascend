/*
* Schema for chat table
*/
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatSchema = new Schema({

  sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User' },
  read_date_time: { type: Date },
  mail_notified: { type: Number, default : 0 },
  message: { type: String },

  sent_time: { type: Date, default: Date.now },

  room_id: { type: Schema.Types.ObjectId, ref: 'chatRoom' }, // From chat_room schema

  // Audit: message composed by an admin operator on behalf of sender_id
  sent_by_operator: { type: Boolean, default: false },
  operator_id: { type: Schema.Types.ObjectId, ref: 'User' },

  deleted_date: { type: Date },
  created_date: { type: Date, default: Date.now },
  update_date : { type: Date, default: Date.now },

});

const chat = mongoose.model('chat', ChatSchema);

// Indexes for chat scaling to 1000s of users
ChatSchema.index({ room_id: 1, created_date: -1 });
ChatSchema.index({ sender_id: 1, receiver_id: 1 });
ChatSchema.index({ receiver_id: 1, read_date_time: 1 });
ChatSchema.index({ mail_notified: 1, created_date: 1 });

module.exports = chat;
