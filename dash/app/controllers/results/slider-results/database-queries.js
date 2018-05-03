var moment = require('moment');
var mongoose = require('mongoose');
var _ = require('lodash');

var Fbevent = require('../../../models/fbevent');
var Feedback = require('../../../models/feedback');
var utils = require('../utils');

function getData(options) {
  var questionId = options.questionId;
  var deviceId = options.deviceId
  var surveyId = options.surveyId
  var organizationId = options.organizationId ? mongoose.Types.ObjectId(organizationId) : null;
  var dateFrom = moment.utc(options.dateFrom).startOf('day').unix();
  var dateTo = moment.utc(options.dateTo).add(1, 'days').unix();

  var query = utils.attachFbeventLimitToQuery(options.responseLimit)({
    device_id: { $in: deviceId },
    survey_id: { $in: surveyId },
    created_at_adjusted_ts: {
      $gte: dateFrom,
      $lt: dateTo
    }
  })

  if(!_.isEmpty(options.feedbacks)) {
    query = utils.addFilters(query, options, questionId)
  } else {
    query["data.question_id"]=questionId
  }
  
  if (!options.limitCount) {
    return Feedback.find(query, { _id: 0, created_at_adjusted_ts: 1, data: [] }).stream();
  }
  return Feedback.find(
    query,
    { 
      _id: 0,
      created_at_adjusted_ts: 1, 
      data: [] 
    })
    .sort({created_at_adjusted_ts: options.limitPosition === 'oldest' ? 1 : -1})
    .limit(options.limitCount)
    .stream();
}

module.exports = { getData };
