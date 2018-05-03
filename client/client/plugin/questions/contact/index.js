var utils = require('../../utils/common');
var translations = require('../../utils/translations');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <form>
    <% translation.data.forEach(function(field, index) { %>
      <% if(field.type !== 'CHECKBOX') { %>
        <div class="<%= classPrefix %>-form-group">
          <input type="text" placeholder="<%- field.data %>" class="<%= classPrefix %>-text-field" index="<%= index %>" val="<%= field.id %>">
        </div>
      <% } else { %>
        <div class="<%= classPrefix %>-checkbox">
          <label>
            <input type="checkbox" index="<%= index %>" val="<%= field.id %>">
            <%- field.data %>
          </label>
        </div>
      <% } %>
    <% }) %>

    <button type="submit" class="<%= classPrefix %>-submit-button"><%= nextText %></button>
  </form>
`);

function contact(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init(container) {
    params.$container.addClass(`${constants.CLASS_PREFIX}-contact-container`);
  }

  function onSubmitContact(e) {
    var $form = $(this);

    e.preventDefault();

    var data = [];
    var textValueCount = 0;

    $form.find('input[type="text"], input[type="checkbox"]').forEach(function(input) {
      var value;

      if(input.type === 'checkbox') {
        value = input.checked;
      } else {
        value = input.value;
      }

      if(value !== '') {
        if(input.type === 'text') {
          textValueCount++;
        }

        data.push({ id: input.getAttribute('val'), data: value });
      }
    });

    if(textValueCount > 0) {
      params.onFbevent({ data });
    }

    params.onLogic('submit');
  }

  function render() {
    var translation = state.translation;
    var nextText = translations.getTranslation({ key: 'next', language: translation.language });

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, translation, nextText }));

    params.$container.find(`form input[index="0"]`).focus();

    params.$container.find('form').on('submit', onSubmitContact);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = contact;
