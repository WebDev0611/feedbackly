var utils = require('../../utils/common');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');
var translations = require('../../utils/translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <% buttonValues.forEach(function(value) { %>
    <div class="<%= countClass %>">
      <img src="<%= buttonImage(value) %>" val="<%= value %>" class="<%= classPrefix %>-button-image">
      <div class="<%= classPrefix %>-button-label <%= buttonClass(value) %>"><%= buttonLabel(value) %></div>
    </div>
  <% }) %>
`);

function button(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init(container) {
    params.$container.addClass(`${constants.CLASS_PREFIX}-button-container`);
  }

  function onButtonClick() {
    var $button = $(this);

    var replaced = $button.attr('val').replace('.', '');

    params.onFbevent({ data: [parseFloat($button.attr('val'))] })
    params.onLogic(replaced);
  }

  function render() {
    var translation = state.translation;

    var mapper = {
      '100': '100',
      '75': '075',
      '66': '075',
      '50': '050',
      '33': '025',
      '25': '025',
      '0': '000'
    };

    var buttonLabel = function(value) {
      var replaced = value.replace('.', '');

      var valueToLabel = {
        '000': translations.getTranslations().buttons.terrible[translation.language],
        '025': translations.getTranslations().buttons.bad[translation.language],
        '033': translations.getTranslations().buttons.bad[translation.language],
        '050': translations.getTranslations().buttons.ok[translation.language],
        '066': translations.getTranslations().buttons.good[translation.language],
        '075': translations.getTranslations().buttons.good[translation.language],
        '100': translations.getTranslations().buttons.amazing[translation.language]
      }

      return (translation.data || {})[replaced] || valueToLabel[replaced];
    }

    var buttonClass = function(value) {
      var replaced = value.replace('.', '');

      var valueToClass = {
        '000': `${constants.CLASS_PREFIX}-red-text`,
        '025': `${constants.CLASS_PREFIX}-orange-text`,
        '033': `${constants.CLASS_PREFIX}-orange-text`,
        '050': `${constants.CLASS_PREFIX}-yellow-text`,
        '066': `${constants.CLASS_PREFIX}-green-text`,
        '075': `${constants.CLASS_PREFIX}-green-text`,
        '100': `${constants.CLASS_PREFIX}-turquoise-text`
      }

      return valueToClass[replaced];
    }

    var buttonImage = function(value) {
      var toString = (parseFloat(value) * 100).toString().substring(0, 3);

      return `${window.FEEDBACK_DASHBOARD_URL}/images/faces-svg/face${mapper[toString]}.svg`;
    }

    var buttonCount = (params.question.opts || {}).buttonCount || 5;

    var countClass = buttonCount == 4 ? `${constants.CLASS_PREFIX}-4-buttons` : `${constants.CLASS_PREFIX}-5-buttons`
    var buttonValues = buttonCount == 4 ? ['1.00', '0.66', '0.33', '0.00'] : ['1.00', '0.75', '0.50', '0.25', '0.00'];

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, countClass, buttonClass, buttonImage, buttonLabel, question: params.question, buttonValues, translation }));

    params.$container.find(`.${constants.CLASS_PREFIX}-button-image`).on('click', onButtonClick);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = button;
