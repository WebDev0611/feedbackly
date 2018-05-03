var mongoose = require('mongoose');

var encryption = require('../lib/encryption');
var _ = require('lodash');

var fbeventSchema = mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    question_type: { type: String, index: true },
    device_id: { type: mongoose.Schema.Types.ObjectId, required:true },
    survey_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    created_at: {type: Date, default: Date.now },
    created_at_adjusted_ts: { type: Number },
    chain_started_at: { type: Number },
    data: Array,
    updated: Boolean,
    read: Boolean,
    ip: String,
    hidden: Boolean,
    organization_id: { type: mongoose.Schema.Types.ObjectId },
    feedback_id: mongoose.Schema.Types.ObjectId,
    internalId: String,
    offset: Number,
    feedbacks: mongoose.Schema.Types.Mixed,
    crypted: { type: Boolean, default: false },
    period_sequence: { type: Number }
});

function decrypt(fbevent) {
  var data = [...[], ...(fbevent.data || [])];

  if(data.length === 0) {
    return fbevent;
  }

  switch(fbevent.question_type) {
    case 'Text':
      return fbevent.crypted === true
        ? _.assign({}, fbevent, { data: [encryption.decrypt(data[0])] })
        : fbevent;
      break;
    case 'Contact':
      return fbevent.crypted === true
        ? _.assign({}, fbevent, { data: _.map(data, value => _.assign({}, value, { data: encryption.decrypt(value.data) })) })
        : fbevent;
      break;
    default:
      return fbevent;
  }
}

fbeventSchema.statics.decrypt = function(fbevent) {
  return decrypt(fbevent);
}

fbeventSchema.methods.toJSON = function() {
  return decrypt(this.toObject());
}

module.exports = mongoose.model('Fbevent', fbeventSchema);
