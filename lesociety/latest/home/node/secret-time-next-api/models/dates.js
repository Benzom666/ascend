/*
* Schema for DatesSchema table
*/
const mongoose = require('mongoose');

const { Schema } = mongoose;

const DatesSchema = new Schema({
  location: { type: String },
  country_code: { type: String },
  country: { type: String },
  province: { type: String },
  standard_class_date: { type: String },
  middle_class_dates:{ type: String },
  executive_class_dates:{ type: String },
  date_length: { type: String, },
  price:{ type: Number },
  image_index: { type: Number, default: 0 },
  date_details :{ type: String },
  user_name: { type: String, required: true },
  verification_docs: { type: String },
  // verified:  { type: Boolean, default: false },
  is_new: { type: Boolean, default: true },

  date_status: { type: Boolean, default: false }, // Draft by default. Will be true when published.
  status: { type: Number, default: 2 }, // CHANGED: Default to 2 (Verified) since no admin approval needed
  // 1 : Pending, 2: Verified, 3 Block ( deactivated ), 4: Delete ( soft ),
  // 5: to return new dates 6: to return warned dates 7: To return Re Submitted date. These will be sent in get date api only, check date listing api

  // warned: { type: Boolean, default: false },
  // re_submitted: { type: Boolean, default: false },
  warning_sent_date: { type: Date, default: null },
  is_blocked_by_admin: { type: Number , default: 0},
  blocked_date: { type: Date },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

DatesSchema.index({ location: -1 },   {
  collation: {
    locale: 'en',
    strength: 2
  }
}
);

// Additional indexes for scaling to 1000s of dates
DatesSchema.index({ user_name: 1, date_status: 1 });
DatesSchema.index({ status: 1, date_status: 1 });
DatesSchema.index({ is_new: 1, status: 1 });
DatesSchema.index({ country_code: 1, status: 1 });
DatesSchema.index({ province: 1, status: 1 });
DatesSchema.index({ created_at: -1 });
DatesSchema.index({ price: 1 });

const dates = mongoose.model('dates', DatesSchema);

module.exports = dates;
