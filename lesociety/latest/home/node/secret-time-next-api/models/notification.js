/*
* Schema for notification table
*/
const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema({

  // user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  user_email: { type: String },
  title: { type: String },
  message: { type: String },

  sent_time: { type: Date, default: Date.now },
  read_date_time: { type: Date },

  type : { type: String }, // check default-messages in seeder
  status: { type: Number, default: 0 }, // 0 : Un read, 1 :  read
  deleted_date: { type: Date, default: null },
  created_date: { type: Date, default: Date.now },
  update_date : { type: Date, default: Date.now },

});

// PERFORMANCE: Critical indexes for notification queries
NotificationSchema.index({ user_email: 1, created_date: -1 }); // User's notifications sorted by date
NotificationSchema.index({ user_email: 1, status: 1, created_date: -1 }); // Unread notifications
NotificationSchema.index({ user_email: 1, type: 1, created_date: -1 }); // Filter by type
NotificationSchema.index({ created_date: -1 }); // General sorting
NotificationSchema.index({ status: 1, created_date: -1 }); // Admin queries

const notification = mongoose.model('notification', NotificationSchema);
module.exports = notification;
