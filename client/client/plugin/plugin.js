var objectId = require('bson-objectid');
var $ = require('npm-zepto');
var template = require('lodash.template');

var constants = require('./constants');
var pubsub = require('./utils/pubsub');
var utils = require('./utils/common');
var api = require('./utils/api');
var storage = require('./utils/storage');

var question = require('./questions/question');
var button = require('./questions/button');
var contact = require('./questions/contact');
var image = require('./questions/image');
var nps = require('./questions/nps');
var slider = require('./questions/slider');
var text = require('./questions/text');
var word = require('./questions/word');
var end = require('./questions/end');

var compiled = template(`
  <% if(isFixed) { %>
    <div class="<%= classPrefix %>-header <%= classPrefix %>-header-inverse">
      <img src="<%= dashUrl %>/images/logos/feedbackly-logo-inverse-rgb.png">

      <button class="<%= classPrefix %>-remove">&#10005;</button>
    </div>

    <div class="<%= classPrefix %>-header <%= classPrefix %>-header-light">
      <img src="<%= dashUrl %>/images/logos/feedbackly-logo-rgb.png">
    </div>
  <% } %>

  <div class="<%= classPrefix %>-content">
    <div class="<%= classPrefix %>-question-container"></div>
    <div class="<%= classPrefix %>-survey-progress">
      <div class="<%= classPrefix %>-survey-progress-indicator"></div>
    </div>
  </div>
`);

function plugin(params) {
  var deviceId = params.deviceId;
  var udid = params.udid;
  var currentQuestionIndex = 0;
  var activeTranslation;
  var survey = params.survey;
  var pubsubChannel = pubsub();
  var $container = params.container;
  var chainStartedAt;
  var feedbackId;
  var feedbacksMap = {};
  var hasBeenOpened = false;
  var isFixed = $container.hasClass(`${constants.CLASS_PREFIX}-fixed-container`);

  function init() {
    if(isFixed) {
      $container.addClass(`${constants.CLASS_PREFIX}-hidden`);

      $container
        .on('click', `.${constants.CLASS_PREFIX}-remove`, remove);
    }

    setTimeout(() => {
      if(hasBeenOpened === false) {
        $container.removeClass(`${constants.CLASS_PREFIX}-hidden`);
      }
    }, constants.OPEN_TIMEOUT)

    var userLanguage = window.navigator.userLanguage || window.navigator.language;

    if(userLanguage) {
      userLanguage = userLanguage.substring(0, 2);

      activeTranslation = (utils.find(survey.question_ids[currentQuestionIndex].translations, { language: userLanguage }) || {}).language || survey.question_ids[currentQuestionIndex].translations[0].language;
    } else {
      activeTranslation = survey.question_ids[currentQuestionIndex].translations[0].language;
    }

    $container.html(compiled({ classPrefix: constants.CLASS_PREFIX, dashUrl: window.FEEDBACK_DASHBOARD_URL, isFixed }));

    displayQuestion(survey.question_ids[currentQuestionIndex]);

    pubsubChannel.subscribe(constants.GO_TO_NEXT_QUESTION, function() {
      currentQuestionIndex++;

      if(currentQuestionIndex < survey.question_ids.length) {
        displayQuestion(survey.question_ids[currentQuestionIndex]);
      } else {
        displayEnd();
      }
    });

    pubsubChannel.subscribe(constants.NEW_FBEVENT, saveFbevent);

    pubsubChannel.subscribe(constants.GO_TO_QUESTION, function(target) {
      var targetSearch = utils.find(survey.question_ids, { _id: target }, true);

      if(target === 'end') {
        displayEnd();
      } else if(targetSearch.target !== undefined) {
        displayQuestion(targetSearch.target);
        currentQuestionIndex = targetSearch.index;
      } else {
        pubsub.publish(constants.GO_TO_NEXT_QUESTION);
      }
    })

    pubsubChannel.subscribe(constants.ACTIVE_TRANSLATION_CHANGE, function(translation) {
      activeTranslation = translation;
    });

    $container
      .find(`.${constants.CLASS_PREFIX}-header`)
      .on('click', () => {
        if($container.hasClass(`${constants.CLASS_PREFIX}-hidden`)) {
          hasBeenOpened = true;
        }

        $container
          .toggleClass(`${constants.CLASS_PREFIX}-hidden`);
      });
  }

  function saveFbevent(fbevent) {
    if(window.FEEDBACK_PLUGIN_PREVIEW === true) return;

    var offset = new Date().getTimezoneOffset() * (-60);

    if(chainStartedAt === undefined) {
      chainStartedAt = Math.floor(new Date().getTime() / 1000);
    }

    if(feedbackId === undefined) {
      feedbackId = objectId().toHexString();
    }

    var _id = objectId().toHexString();

    feedbacksMap[fbevent.question._id] = fbevent.data;

    var newFbevent = {
      _id,
	    question_id: fbevent.question._id,
	    question_type: fbevent.question.question_type,
	    device_id: deviceId,
	    survey_id: survey._id,
	    data: fbevent.data,
	    organization_id: survey.organization,
	    feedback_id: feedbackId,
	    created_at_adjusted_ts: Math.floor(new Date().getTime() / 1000) + offset,
      _isFirst: currentQuestionIndex === 0 ? '1' : '0',
      chain_started_at: chainStartedAt,
      feedbacks: feedbacksMap
  	}

    api.createFbevent(newFbevent, function() {});
  }

  function displayEnd() {
    var $endContainer = $(document.createElement('div'));

    var ender = end({ survey });

    ender.setTranslation(activeTranslation);
    ender.init($endContainer)

    $container.find(`.${constants.CLASS_PREFIX}-survey-progress-indicator`).css('width', '100%');

    $container.find(`.${constants.CLASS_PREFIX}-question-container`).html($endContainer);

    //setTimeout(remove, constants.END_TIMEOUT);

    storage.setSurveyAsFinished(udid);
    pubsubChannel.unsubscribeAll();
  }

  function remove() {
    $container.remove();
  }

  function displayQuestion(targetQuestion) {
    var progress = currentQuestionIndex / survey.question_ids.length * 100;

    $container.find(`.${constants.CLASS_PREFIX}-survey-progress-indicator`).css('width', `${progress}%`);

    var $questionContainer = $container.find(`.${constants.CLASS_PREFIX}-question-container`);

    var logic = ((survey.properties || {}).logic || {})[targetQuestion._id.toString()] || {};
    var translation = utils.find(targetQuestion.translations, { language: activeTranslation }) || targetQuestion.translations[0];

    var newQuestion = question({ translation, survey, question: targetQuestion, pubsub: pubsubChannel, logic });

    switch(targetQuestion.question_type) {
      case 'Button':
        newQuestion.setQuestionType(button);
        break;
      case 'Contact':
        newQuestion.setQuestionType(contact);
        break;
      case 'Image':
        newQuestion.setQuestionType(image);
        break;
      case 'NPS':
        newQuestion.setQuestionType(nps);
        break;
      case 'Slider':
        newQuestion.setQuestionType(slider);
        break;
      case 'Text':
        newQuestion.setQuestionType(text);
        break;
      case 'Word':
        newQuestion.setQuestionType(word);
        break;
    }

    newQuestion.init($questionContainer);
  }

  return {
    init
  }
}

module.exports = plugin;
