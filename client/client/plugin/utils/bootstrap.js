var constants = require('../constants');
var storage = require('./storage');
var plugin = require('../plugin');

var $ = require('npm-zepto');

function initializePlugin({ survey, deviceId, placement, udid }) {
  if(udid !== undefined && storage.surveyIsFinished(udid)) {
    return false;
  }

  var body = document.getElementsByTagName('body')[0];
  var $containers = $(`.${constants.CLASS_PREFIX}-container-${udid}`);

  if($containers.length === 0) {
    if($(`${constants.CLASS_PREFIX}-fixed-feedback-container`).length !== 0) throw new Error('Feedback container is missing and fixed feedback container already exists!');

    var feedbackContainer = document.createElement('div');
    feedbackContainer.className = `${constants.CLASS_PREFIX}-fixed-container ${constants.CLASS_PREFIX}-fixed-container-${placement || 'bottom-right'} ${constants.CLASS_PREFIX}-container`;

    body.appendChild(feedbackContainer);

    plugin({ survey, deviceId, container: $(feedbackContainer), udid }).init();
  } else {
    $containers.forEach(function(container) {
      var $container = $(container);

      $container.addClass(`${constants.CLASS_PREFIX}-container ${constants.CLASS_PREFIX}-freely-placed-container`);

      $container.css('height', ($container.width() - 40) * (2/3));

      plugin({ survey, deviceId, container: $container, udid }).init();
    });
  }

  return true;
}

module.exports = { initializePlugin };
