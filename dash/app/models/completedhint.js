var _ = require('lodash');
var mongoose = require('mongoose');

var completedHintSchema = mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hint_id: { type: String, required: true }
});

completedHintSchema.statics.setAsCompleted = function(options) {
  var query = { user_id: options.userId, hint_id: options.hintId };

  return this.update(query, { $set: query }, { upsert: true });
}

completedHintSchema.statics.getCompleted = function(userId) {
  return this.find({ user_id: userId })
    .then(hints => {
      return _.map(hints || [], hint => hint.hint_id)
    });
}

module.exports = mongoose.model('Completedhint', completedHintSchema);
