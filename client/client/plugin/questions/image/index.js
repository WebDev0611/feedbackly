var utils = require('../../utils/common');
var constants = require('../../constants');
var questionTranslations = require('../question-translations');

var template = require('lodash.template');
var $ = require('npm-zepto');

var compiled = template(`
  <% translation.data.forEach(function(image) { %>
    <div class="<%= classPrefix %>-image-display-container" val="<%= image.id %>">
      <div class="<%= classPrefix %>-image-display" style="background-image: url(<%= image.data.url %>)">
        <div class="<%= classPrefix %>-image-display-label">
          <%- image.data.label %>
        </div>
      </div>
    </div>
  <% }) %>
`);

function image(params) {
  var state = {
    translation: params.question.translations[0]
  }

  function init(container) {
    params.$container.addClass(`${constants.CLASS_PREFIX}-image-container`);
  }

  function onImageClick(e) {
    var $image = $(this);
    var value = $image.attr('val');

    params.onFbevent({ data: [value] });
    params.onLogic(value);
  }

  function equalizeHeights() {
    params.$container
      .find(`.${constants.CLASS_PREFIX}-image-display-container`)
      .each(function() {
        var $image = $(this);

        var width = $image.width()

        $image.css('height', `${width}px`);
      });
  }

  function render() {
    var translation = state.translation;

    params.$container.html(compiled({ classPrefix: constants.CLASS_PREFIX, translation }));

    params.$container.find(`.${constants.CLASS_PREFIX}-image-display-container`).on('click', onImageClick);

    equalizeHeights();
  }

  return { render, init, ...questionTranslations({ translations: params.question.translations }, state) }
}


module.exports = image;
