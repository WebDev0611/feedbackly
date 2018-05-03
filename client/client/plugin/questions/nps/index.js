var utils = require('../../utils/common');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <% values.forEach(function(button) { %>
    <div class="<%= classPrefix %>-nps-button" val="<%= button %>">
      <%= parseFloat(button) * 10 %>
    </div>
  <% }) %>
`);

function nps(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init() {
    params.$container.addClass(`${constants.CLASS_PREFIX}-nps-container`);
  }

  function onNpsClick(e) {
    var $nps = $(this);

    var logicId = parseFloat($nps.attr('val')) * 100;

    params.onFbevent({ data: [parseFloat($nps.attr('val'))] });
    params.onLogic(logicId.toString());
  }

  function render() {
    var values = ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
    var translation = state.translation;

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, values, question: params.question, translation }));

    params.$container.find(`.${constants.CLASS_PREFIX}-nps-button`).on('click', onNpsClick);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = nps;
