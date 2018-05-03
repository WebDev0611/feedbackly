// app/models/feedback.js

var mongoose = require('mongoose');
var encryption = require('../lib/encryption');

// define the schema for our feedback model
var feedbackSchema = mongoose.Schema({
  survey_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  device_id: mongoose.Schema.Types.ObjectId,
  organization_id: mongoose.Schema.Types.ObjectId,
  created_at_adjusted_ts: Number,
  created_at: Date,
  meta_query: [
    { key: String,
      val: String
    }
  ],
  meta_browser: {
    browser: Object,
    device: Object,
    os: Object
  },
  language: String,
  period_sequence: Number,
  data: [{
      value: mongoose.Schema.Types.Mixed,
      question_type: String,
      question_id: mongoose.Schema.Types.ObjectId,
      hidden: Boolean,
      crypted: Boolean,
      created_at: Date
    }],
  processedByGroup: Array,
  notified: Array,
  contact: Object,
  processingLog: Array,
  processed: Boolean
});

// methods ======================

// create the model for feedbacks and expose it to our app

module.exports = mongoose.model('Feedback', feedbackSchema);
