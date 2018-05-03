var moment = require('moment');
var mongoose = require('mongoose')
var _ = require('lodash')
function createWeekdayAggregation(options){
  /*
    options: {
      dateFrom,
      dateTo,
      questionId,
      [device_id],
      [surveyId],
      organizationId,
      type,
      plan.maxFbeventCount || undefined
    }

  */


  var question_type = options.type;
  var dateFrom = moment.utc(options.dateFrom).startOf('day').unix();
  var dateTo = moment.utc(options.dateTo).add(1, 'days').unix();;
  var questionId = mongoose.Types.ObjectId(options.questionId);
  var deviceId = _.map(options.deviceId, id => mongoose.Types.ObjectId(id));
  var surveyId = _.map(options.surveyId, id => mongoose.Types.ObjectId(id));
  var organizationId = options.organizationId ? mongoose.Types.ObjectId(organizationId) : null;

  var match = {
    [`data.${question_type}.${options.questionId}`]: {$exists: true},
    created_at_adjusted_ts: {
      $gte: dateFrom,
      $lt: dateTo
    },
    device_id: { $in: deviceId },
    survey_id: { $in: surveyId }
  };

  if(_.get(options, 'plan.maxFbeventCount')) match.period_sequence = { $lte: options.plan.maxFbeventCount }


  var group = {
    _id: { device_id: '$device_id', data: `$data.${question_type}.${options.questionId}` },
    fbevent_count: { $sum: 1 }
  }

  var aggregation = [
    { $match: match },
    { $group: group }
  ]

  return aggregation;

}

module.exports = { createWeekdayAggregation }
