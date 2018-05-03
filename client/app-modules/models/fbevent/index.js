var mongoose = require('mongoose');

var fbeventSchema = mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    question_type: { type: String, index: true },
    device_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    survey_id: mongoose.Schema.Types.ObjectId,
    created_at: {type: Date, default: Date.now },
    created_at_adjusted_ts: { type: Number }, // adjusts time so that lunchtime in USA == lunchtime in Finland
    chain_started_at: { type: Number },
    period_sequence: { type: Number },
    data: Array,
    updated: Boolean,
    read: Boolean,
    ip: String,
    hidden: Boolean,
    organization_id: { type: mongoose.Schema.Types.ObjectId },
    feedback_id: mongoose.Schema.Types.ObjectId,
    offset: Number,
    feedbacks: mongoose.Schema.Types.Mixed,
    v4: { type: Boolean, default: true },
    crypted: { type: Boolean, default: true },
    meta: mongoose.Schema.Types.Mixed,
    meta_query: mongoose.Schema.Types.Mixed,
    meta_browser: mongoose.Schema.Types.Mixed,
    language: String,
    isLast: Boolean,
    filtered: { type: Boolean, default: false }
});

module.exports = mongoose.model('Fbevent', fbeventSchema);
