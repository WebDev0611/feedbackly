'use strict';

var mongoose = require('mongoose');

var organizationSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 1 },
	logo: { type: String, required: false },
	custom_theme: {type: Object},
	privacypolicy: {type: String },
  billing_status: String,
  is_stripe_customer: { type: Boolean, default: false },
  stripe_customer_id: { type: String },
  created_at: { type: Date, default: Date.now(), required: true },
  customership_state: String,
  meta: { type: Object },
  pending_ipad_signup: {type: Boolean, required: false}
});

module.exports = mongoose.model('Organization', organizationSchema);
