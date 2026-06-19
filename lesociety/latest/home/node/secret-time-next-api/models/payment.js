/*
* Schema for payment table
*/
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PaymentSchema = new Schema({
  username_id: { type: String },
  transaction_id: { type: String, sparse: true }, // sparse: true allows multiple nulls
  amount: { type: String },
  tax: { type: String },
  bank_name: { type: String },
  payment_status: { type: String },
  currency: { type: String },
  interested_tokens: { type: Number, default: 0 },
  super_interested_tokens: { type: Number, default: 0 },
  chat_tokens: { type: Number, default: 0 },
  a_la_carte_count: { type: Number, default: 0 },
  queens_bundle_count: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  credited_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_date: { type: Date },
});

// Add index for transaction_id (sparse allows multiple nulls)
PaymentSchema.index({ transaction_id: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ username_id: 1, created_at: -1 });
PaymentSchema.index({ payment_status: 1, created_at: -1 });

const payment = mongoose.model('payment', PaymentSchema);

module.exports = payment;
