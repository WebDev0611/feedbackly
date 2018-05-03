var _ = require('lodash');
var moment = require('moment');

var Devicefeedback = require('app-modules/models/device/devicefeedback');
var Dailydevicefeedback = require('app-modules/models/device/dailydevicefeedback');
var Questionfeedback = require('app-modules/models/question/questionfeedback');
var Surveyfeedback = require('app-modules/models/survey/surveyfeedback');

function increase(options) {
  Devicefeedback.increase(options);
  Dailydevicefeedback.increase(options);
  Questionfeedback.increase(options);
  Surveyfeedback.increase(options);
}

function getCounterFromFbevent(fbevent) {

  var deviceId = fbevent.device_id;
  var surveyId = fbevent.survey_id;
  var questionId = fbevent.question_id;
  var date = moment.utc(fbevent.created_at_adjusted_ts * 1000).startOf('day').unix();
  var hour = moment(fbevent.created_at_adjusted_ts * 1000).hours();

  var numSum = 0;
  var numCount = 0;
  var feedbackCount = 0;

  if(fbevent._isFirst === '1') {
    feedbackCount = 1;
  }

  switch(fbevent.question_type) {
    case 'Button':
      numSum = parseFloat(fbevent.data[0] || 0);
      numCount = 1;
      break;
    case 'Slider':
      numSum: _.reduce(fbevent.data || [], (sum, data) => sum + parseFloat(data.data), 0);
      numCount = 1;
      break;
    case 'NPS':
      numSum = parseFloat(fbevent.data[0] || 0);
      numCount = 1;
      break;
  }

  return {
    deviceId,
    surveyId,
    questionId,
    date,
    hour,
    fbeventCount: 1,
    feedbackCount,
    numSum,
    numCount
  };
}

module.exports = { increase, getCounterFromFbevent };
