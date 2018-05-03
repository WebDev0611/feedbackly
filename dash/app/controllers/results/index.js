var Question = require('../../models/question');
var Fbevent = require('../../models/fbevent');
var Feedback = require('../../models/feedback')
var wordResults = require('./word-results');
var imageResults = require('./image-results');
var buttonResults = require('./button-results');
var sliderResults = require('./slider-results');
var textResults = require('./text-results');
var NPSResults = require('./nps-results');
var contactResults = require('./contact-results');

var Promise = require('bluebird');
var _ = require('lodash');
var q = require('q');

function generateIdLegend(question, getter) {
  var legend = {};

  (question || { choices: [] }).choices.forEach(choice => {
    legend[choice.id.toString()] = getter(choice);
  });

  return legend;
}

function getFbeventCount(options) { // TO BE REMOVED
  return Fbevent.count({
    created_at_adjusted_ts: {
      $gte: options.from,
      $lte: options.to
    },
    device_id: { $in: options.deviceId },
    survey_id: { $in: options.surveyId }
  });
}

function getFeedbackChainCount(options) {
  var query = options.maxFbeventCount !== undefined ? {period_sequence: {$gt: options.maxFbeventCount}} : {}
  query = _.assign(query, {
    created_at_adjusted_ts: {
      $gte: options.from,
      $lte: options.to
    },
    device_id: { $in: options.deviceId },
    survey_id: { $in: options.surveyId }
  } )
  return Feedback.count(query)
}

function generateFeedbackObject(feedbacks) {
  var object = {};

  for(var key in feedbacks) {
    if(_.isArray(feedbacks[key])) {
      object[`${key}`] = { $in: _.map(feedbacks[key], feedback => feedback.value) }
    }
  }

  return object;
}
function getText(object, userLanguage) {
  if(!object) return '';
  if(userLanguage in object) return object[userLanguage];
  if('en' in object) return object['en'];
  return _.find(object) || '';
}



function questionResults(questionId, options) {
  var FOUR_BUTTONS_VALUES = [0, 0.33, 0.66, 1];
  var FIVE_BUTTONS_VALUES = [0, 0.25, 0.5, 0.75, 1];
  var NPS_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  var dateFrom = options.from;
  var dateTo =  options.to;
  var deviceId = options.devices || [];
  var surveyId = options.surveys|| [];
  var organizationId = options.organizationId;
  var requestQuestion = options.question;
  var feedbacks = generateFeedbackObject(options.feedbacks || []);
  var responseLimit = options.responseLimit;
  var language = options.language || 'en';
  var notHidden = (data) => !data.hidden;

  function sendResults(targetQuestion) {
    var promise = null;
    var values = targetQuestion.choices;
    var includeAverage = false;
    var legend = {};

    switch(targetQuestion.question_type) {
      case 'Word':
        legend = generateIdLegend(targetQuestion, data => getText(data.text, language));
        values = _.chain(targetQuestion.choices).filter(notHidden).map(data => data.id).value();
        let wordQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, includeAverage, legend, responseLimit }
        wordQueries = options.limitCount ? {...wordQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...wordQueries}
        promise = wordResults.getResults(wordQueries);
        break;
      case 'Image':
        legend = generateIdLegend(targetQuestion, data => getText(data.text, language));
        values = _.chain(targetQuestion.choices).filter(notHidden).map(data => data.id).value();
        let imageQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, includeAverage, legend, responseLimit }
        imageQueries = options.limitCount ? {...imageQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...imageQueries}
        promise = imageResults.getResults(imageQueries);
        break;
      case 'Button':
        values = targetQuestion.choices.length == 4 ? FOUR_BUTTONS_VALUES : FIVE_BUTTONS_VALUES;
        includeAverage = true;
        let buttonQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, includeAverage, legend, responseLimit }
        buttonQueries = options.limitCount ? {...buttonQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...buttonQueries}
        promise = buttonResults.getResults(buttonQueries);
        break;
      case 'Slider':
        legend = generateIdLegend(targetQuestion, data => getText(data.text, language));
        values = _.chain(targetQuestion.choices).filter(notHidden).map(data => data.id).value();
        var smallScale = !!(targetQuestion.opts||{}).smallScale;
        let sliderQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, legend, smallScale, responseLimit }
        sliderQueries = options.limitCount ? {...sliderQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...sliderQueries}
        promise = sliderResults.getResults(sliderQueries);
        break;
      case 'Text':
      let textQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, responseLimit }
      textQueries = options.limitCount ? {...textQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...textQueries}
      promise = textResults.getResults(textQueries);
        break;
      case 'NPS':
        legend = {};
        values = NPS_VALUES;
        let npsQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, legend, responseLimit }
        npsQueries = options.limitCount ? {...npsQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...npsQueries}
        promise = NPSResults.getResults(npsQueries);
        break;
      case 'Contact':
        legend = generateIdLegend(targetQuestion, data => getText(data.text, language));
        values = _.chain(targetQuestion.choices).filter(notHidden).map(data => data.id).value();
        let contactQueries = { questionId, dateFrom, dateTo, deviceId, surveyId, organizationId, feedbacks, values, legend, responseLimit }
        contactQueries = options.limitCount ? {...contactQueries, limitCount: options.limitCount, limitPosition: options.limitPosition} : {...contactQueries}
        promise = contactResults.getResults(contactQueries);
        break;
    }

    if(promise !== null) {
      return promise
        .then(data => _.assign({}, targetQuestion, data));
    } else {
      return Promise.reject();
    }
  }

  if(requestQuestion && requestQuestion.question_type) {
    return sendResults(requestQuestion);
  } else {
    return Question.findOne({ _id: questionId })
      .then(question => sendResults(question.toObject()));
  }
}

module.exports = { questionResults, getFbeventCount, getFeedbackChainCount };
