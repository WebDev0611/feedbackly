var mongoose = require('mongoose');

var questionFeedbackSchema = mongoose.Schema({
    _id: { type: String, required: true },
    fbevent_count: { type: Number, default: 0 }
});

questionFeedbackSchema.statics.increase = function(options) {
  var query = {
    _id: options.questionId
  };

  var update = {
    $inc: {
      fbevent_count: options.fbeventCount || 0,
    }
  };

  return this.update(query, update, { upsert: true }).exec();
}

module.exports = mongoose.model('Questionfeedback', questionFeedbackSchema);
