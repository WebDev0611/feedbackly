var utils = require('../../utils/common');
var constants = require('../../constants');
var translations = require('../../utils/translations');

var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <form>
    <% translation.data.forEach(function(slider) { %>
      <% if(slider.hidden !== true) { %>
        <div class="<%= classPrefix %>-form-group">
          <label>
            <%- slider.data %>
          </label>

          <input type="range" min="0" max="100" value="50" val="<%= slider.id %>">
        </div>
      <% } %>
    <% }) %>

    <button type="submit" class="<%= classPrefix %>-submit-button"><%= nextText %></button>
  </form>
`);

function slider(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init() {
    params.$container.addClass(`${constants.CLASS_PREFIX}-slider-container`);
  }

  function onSliderValueChange() {
    var $slider = $(this);

    $slider.addClass(`${constants.CLASS_PREFIX}-slider-touched`);
  }

  function onSlidersSubmit(e) {
    var $form = $(this);

    e.preventDefault();

    var data = [];

    var hasBeenTouched = $form.find(`.${constants.CLASS_PREFIX}-slider-touched`).length > 0;

    $form.find('input[type="range"]').forEach(function(input) {
      var value = input.value;

      if(hasBeenTouched) {
        data.push({ id: input.getAttribute('val'), data: parseInt(value) / 100 });
      }
    });

    if(data.length > 0) {
      params.onFbevent({ data });
    }

    params.onLogic('submit');
  }

  function render() {
    var translation = state.translation;
    var nextText = translations.getTranslation({ key: 'next', language: translation.language })

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, question: params.question, translation, nextText }));

    params.$container.find(`form`).on('submit', onSlidersSubmit);
    params.$container.find(`input[type="range"]`).on('change', onSliderValueChange);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = slider;
