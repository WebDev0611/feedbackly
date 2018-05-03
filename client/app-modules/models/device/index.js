// app/models/device.js
'use strict';

var mongoose = require('mongoose');

var deviceSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 1 },
	type: { type: String, required: true },
	description: String,
  organization_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
  udid: String,
  is_base_device: { type: Boolean, default: false },
  active_survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  scheduled_surveys: [{_id: mongoose.Schema.Types.ObjectId, valid_from: Date}],
	logo: String,
	bgcolor: {type: String, default: '#EFF3F8'},
	use_default_settings: {type: Boolean, default: true},
	passcode: String,
  last_seen: Date,
  latest_activation: Number,
  request_screenshot: Boolean,
  v4: Boolean,
  settings: Object,
  last_seen_battery: String,
  last_feedback: Date,
  upsells: {
    neutral: mongoose.Schema.Types.ObjectId,
    positive: mongoose.Schema.Types.ObjectId,
    negative: mongoose.Schema.Types.ObjectId
  },
  force_default_language: String,
  focuses: Object
});


module.exports = mongoose.model('Device', deviceSchema);
