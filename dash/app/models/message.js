var mongoose = require('mongoose');
var schema= mongoose.Schema({
  feedback_id: mongoose.Schema.Types.ObjectId,
  created_at: {type: Date, default: Date.now },
  created_by: mongoose.Schema.Types.ObjectId,
  message: String,
  group_id: mongoose.Schema.Types.ObjectId,
  type: String,
  crypted: Boolean
});

module.exports = mongoose.model('Message', schema);
