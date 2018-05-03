var utils = require('../../utils/common');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <% translation.data.forEach(function(word) { %>
    <% if(word.hidden !== true) { %>
      <div class="<%= classPrefix %>-word-button" val="<%= word.id %>">
        <%- word.data %>
      </div>
    <% } %>
  <% }) %>
`);

function word(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init() {
    params.$container.addClass(`${constants.CLASS_PREFIX}-word-container`);
  }

  function onWordClick(e) {
    var $word = $(this);

    params.onFbevent({ data: [$word.attr('val')] });
    params.onLogic($word.attr('val'));
  }

  function render() {
    var translation = state.translation;

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, question: params.question, translation }));

    params.$container.find(`.${constants.CLASS_PREFIX}-word-button`).on('click', onWordClick);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = word;
