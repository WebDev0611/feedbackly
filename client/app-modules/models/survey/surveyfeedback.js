var mongoose = require('mongoose');

var surveyFeedbackSchema = mongoose.Schema({
    _id: { type: String, required: true },
    fbevent_count: { type: Number, default: 0 },
    feedback_count: { type: Number, default: 0 }
});

surveyFeedbackSchema.statics.increase = function(options) {
  var query = {
    _id: options.surveyId
  };

  var update = {
    $inc: {
      fbevent_count: options.fbeventCount || 0,
      feedback_count: options.feedbackCount || 0
    }
  };

  return this.update(query, update, { upsert: true }).exec();
}


module.exports = mongoose.model('Surveyfeedback', surveyFeedbackSchema);
