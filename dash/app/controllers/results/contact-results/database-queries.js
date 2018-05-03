var moment = require('moment');
var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');
var Fbevent = require('../../../models/fbevent');
var Feedback = require('../../../models/feedback');
var Device = require('../../../models/device');
var utils = require('../utils');
var decryptFeedback = require('../../../lib/encryption').decryptFeedback

function getDeviceNames(options) {
  var deviceIds = options.deviceId;
  var organizationId = options.organizationId ? mongoose.Types.ObjectId(organizationId) : null;
  var query = { _id: { $in: _.uniq(deviceIds) } };
  return Device.find(query, { name: 1 })
}

function getTexts(options) {
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
  });

  if(!_.isEmpty(options.feedbacks)) {
    query = utils.addFilters(query, options, questionId)
  } else {
    query["data.question_id"]=questionId
  }

  let optionsSort = { created_at_adjusted_ts: -1 };
  let optionsLimit = options.limit || 1000;
  if (options.limitCount) {
    optionsSort = { created_at_adjusted_ts: options.limitPosition === 'oldest' ? 1 : -1 } 
    optionsLimit = options.limitCount
  }
  return Feedback.find(query, { _id: 0, created_at_adjusted_ts: 1, data: [], device_id: 1, question_type: 1, crypted: 1 })
    .sort(optionsSort)
    .skip(options.skip || 0)
    .limit(optionsLimit)
    .exec()
    .then(contacts => {
      return contacts
        .map(contact => decryptFeedback(contact.toObject()))
        .filter(contact => {
          var notEmptyDataValues = (contact.data || [])
            .filter(value => typeof value.data !== 'boolean')
            .map(value => value.data)
            .filter(value => value !== '');

          return notEmptyDataValues.length > 0;
        });
    });
}

function getData(options) {
  return Promise.all([getDeviceNames(options), getTexts(options)])
    .then(data => {
      return { deviceNames: data[0], contacts: data[1] }
    });
}

module.exports = { getData };
