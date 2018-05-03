var _ = require('lodash');
var mongoose = require('mongoose');

var scheduledSurveySchema = mongoose.Schema({
  timestamp: { type: Number, required: true },
  time: Object,
  survey_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  type: { type: String, enum: ['ACTIVATION', 'EMAIL', 'SMS'] },
  device_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  data: {}
});

scheduledSurveySchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['timestamp', 'time', 'type', 'device_ids', 'data']);
}

module.exports = mongoose.model('ScheduledSurvey', scheduledSurveySchema);
