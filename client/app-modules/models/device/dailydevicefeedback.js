var mongoose = require('mongoose');

var dailyDeviceFeedbackSchema = mongoose.Schema({
    device_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    date: { type: Number, required: true },
    hour: { type: Number, required: true },
    fbevent_count: { type: Number, default: 0 },
    feedback_count: { type: Number, default: 0 },
    num_count: { type: Number, default: 0 },
    num_sum: { type: Number, default: 0 }
});

dailyDeviceFeedbackSchema.statics.increase = function(options) {
  var query = {
    device_id: options.deviceId,
    date: options.date,
    hour: options.hour,
  };

  var update = {
    $inc: {
      fbevent_count: options.fbeventCount || 0,
      feedback_count: options.feedbackCount || 0,
      num_count: options.numCount || 0,
      num_sum: options.numSum || 0
    }
  };

  return this.update(query, update, { upsert: true }).exec();
}

module.exports = mongoose.model('Dailydevicefeedback', dailyDeviceFeedbackSchema);
