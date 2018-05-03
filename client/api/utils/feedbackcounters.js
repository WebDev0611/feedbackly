var _ = require('lodash')
var moment = require('moment')
var mongoose = require('mongoose')

function increaseFeedbackCounter(orgid, sequence){
  mongoose.connection.db.collection("billingperiodfeedbackcounters").update({
    organization_id: orgid,
    period: sequence
  }, {$inc: {count: 1}}, {upsert: true}).then()
}

async function getOrganizationPeriod(orgid){
  var organization = await mongoose.connection.db.collection("organizations").findOne({_id: orgid})
  var createdAtUnix = moment.utc(_.get(organization, 'created_at') || 0).unix();
  var nowUnix = moment.utc().unix();
  return Math.floor((nowUnix - createdAtUnix) / (30 * 24 * 60 * 60));
}

async function getFeedbackCounter(orgid){
  var period = await getOrganizationPeriod(orgid);

  var counter = await mongoose.connection.db.collection("billingperiodfeedbackcounters").findOne({
    organization_id: orgid,
    period: period
  })

  return {counter, period}
}

module.exports = { increaseFeedbackCounter, getFeedbackCounter}
