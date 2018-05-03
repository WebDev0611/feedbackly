/// aggregateFbeventCount

/* options = {
  dateFrom,
  dateTo,
  organizationId,
  deviceId,
  questionId,
  plan.maxFbeventCount || undefined,
  totalsTarget: 'organization' || 'device'

  NEW:
  matchOptions: {'data.Button.abcdef': {$in: [0.5, 0.25]}, 'meta.customerId': {$in: ['1234']}
  question_type: 'Button' || 'Word' etc
}
*/

var mongoose = require('mongoose')
var moment = require('moment')
var _ = require('lodash')
function createFbeventCountAggregation(options){

// date stuff
var middleDate = moment.utc(options.dateFrom).startOf('day').unix();
var dateTo = moment.utc(options.dateTo).add(1, 'days').unix();
var difference = dateTo - moment.utc(options.dateFrom).startOf('day').unix();
var dateFrom = moment.utc((middleDate - difference) * 1000).unix();

// convert to oid
var organizationId = mongoose.Types.ObjectId(options.organizationId);
var deviceId = _.map(options.deviceId, id => mongoose.Types.ObjectId(id));
var questionId = mongoose.Types.ObjectId(options.questionId);

// set match rules

var match = {
  [`data.${options.question_type}.${options.questionId}`]: {$exists: true},
  created_at_adjusted_ts: {
    $gte: dateFrom,
    $lt: dateTo
  }
};

// include only feedbacks in plan
if(_.get(options, 'plan.maxFbeventCount')) match.period_sequence = { $lte: options.plan.maxFbeventCount }

// determine wheter to count organization or device
if(options.totalsTarget === 'organization') {
  match.organization_id = organizationId;
} else {
  match.device_id = { $in: deviceId };
}

// extra matching options like metadata
if(options.matchOptions){
  _.forEach(options.matchOptions, (val, key) => {
    _.set(match, key, val);
  })
}

// sum according to date groups
var group = {
  _id: '$date_group',
  count: { $sum: 1 }
};

if(options.group !== undefined) {
  group = options.group;
}

// if average is included the "sum" field is summed
if(options.includeAverage) {
  group.sum = { $sum: '$sum' }
}


var project = {
  data: `$data.${options.question_type}.${options.questionId}`,
  date_group: {
    $cond: { if: { $gte: ['$created_at_adjusted_ts', middleDate] }, then: 1, else: 0 }
  }
};

var aggregation = [
  { $match: match },
  { $project: project },
  { $group: group }
];

return aggregation
}

module.exports = {createFbeventCountAggregation}
