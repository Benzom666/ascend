/*
* Schema for requests table
*/
const mongoose = require('mongoose');

const { Schema } = mongoose;

const RequestsSchema = new Schema({
  requester_id: { type: String },
  receiver_id: { type: String }, // Female profile id
  // date_created_id: { type: String }, // Female profile id
  date_id : { type: String },
  request_type: { type: String, enum: ["interested", "super_interested"], default: "interested" },
  status: { type: Number, default: 0 },
  // 0: pending (sent to female, waiting for response)
  // 1: accepted (approved by female)
  // 2: rejected (actively declined by female - no refund)
  // 3: ignored (not responded within 48h - auto-refund)
  message: { type: String },
  deleted_date: { type: Date },
  created_date: { type: Date, default: Date.now },
  update_date : { type: Date, default: Date.now },
  expires_at: { type: Date }, // Set to created_date + 48 hours
  is_refunded: { type: Boolean, default: false }, // Track if tokens were refunded
});

RequestsSchema.index({ receiver_id: 1, status: 1, created_date: -1 });
RequestsSchema.index({ requester_id: 1, receiver_id: 1, date_id: 1 });
RequestsSchema.index({ expires_at: 1, status: 1 });
// Hot path: female pending/ignored/rejected buckets
RequestsSchema.index({ receiver_id: 1, status: 1, expires_at: 1 });
// Hot path: requester history and reconciliation
RequestsSchema.index({ requester_id: 1, status: 1, created_date: -1 });

const requests = mongoose.model('requests', RequestsSchema);

module.exports = requests;
