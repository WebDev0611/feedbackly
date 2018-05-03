var mongoose = require('mongoose');
var Promise = require('bluebird');
var moment = require('moment');

var Organization = require('app-modules/models/organization');

var schema = mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  period: { type: Number, required: true },
  count: { type: Number, required: true, default: 0 }
});

schema.statics.increaseCounterForOrganization = function(organizationId) {
  return this.getOrganizationsPeriod(organizationId)
    .then(period => {
      return this.findOneAndUpdate({ organization_id: organizationId, period }, { $inc: { count: 1 } }, { upsert: true, new: true })
    })
    .then(counter => counter.count);
}

schema.statics.getOrganizationsCurrentCounter = function(organizationId) {
  return this.getOrganizationsPeriod(organizationId)
    .then(period => {
      return this.findOne({ organization_id: organizationId, period });
    })
    .then(counter => {
      if(counter) {
        return counter.count;
      } else {
        return 0;
      }
    });
}

schema.statics.getOrganizationsPeriod = function(organizationId) {
  return Organization.findOne({ _id: organizationId })
    .then(organization => {
      if(!organization || !organization.created_at) {
        return Promise.resolve(0);
      }

      var createdAtUnix = moment.utc(organization.created_at).unix();
      var nowUnix = moment.utc().unix();

      return Math.floor((nowUnix - createdAtUnix) / (30 * 24 * 60 * 60));
    });
}

module.exports = mongoose.model('Periodicfbeventcounter', schema);
