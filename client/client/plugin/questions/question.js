var template = require('lodash.template');
var $ = require('npm-zepto');

var constants = require('../constants');

var compiled = template(`
  <h1 class="<%= classPrefix %>-question-title"><%- translation.heading %></h1>
  <div class="<%= classPrefix %>-question-subtitle-divider"></div>
  <h2 class="<%= classPrefix %>-question-subtitle"><%- translation.subtitle %></h2>
  <div class="<%= classPrefix %>-question-content"></div>
`);

function question(params) {
  var pubsub = params.pubsub;
  var survey = params.survey;
  var question = params.question;
  var translation = params.translation;
  var logic = params.logic;
  var questionTypeParams = {};
  var questionType;
  var questionTypeFactory;
  var $container;

  function init(container) {
    $container = container;

    $container.html(compiled({ classPrefix: constants.CLASS_PREFIX, translation }));

    var $questionContent = $container.find(`.${constants.CLASS_PREFIX}-question-content`);

    var events = {
      onFbevent,
      onLogic,
      onNextQuestion
    };

    questionType = questionTypeFactory({ $container: $questionContent, logic, question, ...events, });

    questionType.init();
    questionType.render();

    questionType.setTranslation(translation.language);
  }

  function onFbevent(fbevent) {
    pubsub.publish(constants.NEW_FBEVENT, { data: fbevent.data, question });
  }

  function onNextQuestion() {
    pubsub.publish(constants.GO_TO_NEXT_QUESTION);
  }

  function onLogic(logicId) {
    if(logic[logicId]) {
      pubsub.publish(constants.GO_TO_QUESTION, logic[logicId]);
    } else {
      pubsub.publish(constants.GO_TO_NEXT_QUESTION);
    }
  }

  function setQuestionType(newQuestionType, questionTypeParams) {
    questionTypeFactory = newQuestionType;
    questionTypeParams = questionTypeParams;
  }

  return {
    init,
    setQuestionType
  }
}

module.exports = question;
