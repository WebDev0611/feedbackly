var _ = require('lodash');
var mongoose = require('mongoose');

var schema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId},
    organization_id: {type: mongoose.Schema.Types.ObjectId},
    survey_id: mongoose.Schema.Types.ObjectId,
    device_id: [mongoose.Schema.Types.ObjectId],
    conditionSet: mongoose.Schema.Types.Mixed,
    messageContentFromQuestionIds: [mongoose.Schema.Types.ObjectId],
    receivers: Array,
    last_sent: Date,
    delay: Number,
    assignToGroup: mongoose.Schema.Types.ObjectId
});


module.exports = mongoose.model('Notification', schema);
