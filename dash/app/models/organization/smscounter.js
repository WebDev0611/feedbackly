var mongoose = require('mongoose');
var Promise = require('bluebird');

var smsCounterSchema = mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    sms_message_count: { type: Number },
    latest_sms_charge: { type: Date }
});

smsCounterSchema.statics.increase = function(organizationId, amount) {
  return mongoose.models.SmsCounter.update({ organization_id: organizationId }, { $inc: { sms_message_count: amount } }, { upsert: true })
    .then(status => {
      if(status.upserted) {
        return mongoose.models.SmsCounter.update({ organization_id: organizationId }, { $set: { latest_sms_charge: new Date } });
      } else {
        return Promise.resolve();
      }
    });
}

module.exports = mongoose.model('SmsCounter', smsCounterSchema);
