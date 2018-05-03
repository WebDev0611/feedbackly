var utils = require('../../utils/common');
var translations = require('../../utils/translations');

var constants = require('../../constants');
var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <form>
    <div class="<%= classPrefix %>-form-group">
      <textarea placeholder="<%- (translation.data || [])[0] || '' %>" class="<%= classPrefix %>-text-field"></textarea>
    </div>

    <button type="submit" class="<%= classPrefix %>-submit-button"><%= nextText %></button>
  </form>
`);

function text(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init(container) {
    params.$container.addClass(`${constants.CLASS_PREFIX}-text-container`);
  }

  function onSubmitText(e) {
    var $form = $(this);

    e.preventDefault();

    var value = $form.find('textarea').val();

    if(value != '') {
      params.onFbevent({ data: [value] })
    }

    params.onLogic('submit');
  }

  function render() {
    var translation = state.translation;
    var nextText = translations.getTranslation({ key: 'next', language: translation.language });

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, translation, nextText }));

    params.$container.find('form textarea').focus();

    params.$container.find('form').on('submit', onSubmitText);
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}

module.exports = text;
