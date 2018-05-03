var $ = require('npm-zepto');

var utils = require('../../utils/common');
var translations = require('../../utils/translations');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');

function end(params) {
  var survey = params.survey;
  var endTranslations = (((survey.properties || {}).thankYou || {}).translations || []);

  var state = {
    translation: endTranslations[0] || {}
  }

  var $container;

  function init(container) {
    $container = container;

    $container.addClass(`${constants.CLASS_PREFIX}-survey-end-container`);

    render();
  }

  function render() {
    var endText = translations.getTranslation({ key: 'end', language: state.translation.language });

    $container.html(`<h1 class="${constants.CLASS_PREFIX}-end-title">${state.translation.data || endText}</h1>`);

    $container.css('line-height', $(`.${constants.CLASS_PREFIX}-question-container`).css('height'));
  }

  return { render, init, ...questionTranslations({ translations: endTranslations }, state) }
}

module.exports = end;
