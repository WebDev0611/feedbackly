var api = require('./utils/api');
var constants = require('./constants');
var bootstrap = require('./utils/bootstrap');
var translations = require('./utils/translations');

var $ = require('npm-zepto');

window.FEEDBACK_CLIENT_URL = (window.envConfig || {}).ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://fbly-production-client-62286.onmodulus.net';

window.FEEDBACK_DASHBOARD_URL = (window.envConfig || {}).ENV === 'development'
  ? 'http://localhost:8080'
  : 'https://dash.feedbackly.com';

function onCssLoaded(callback) {
  $('body').append(`<div id="${constants.CLASS_PREFIX}-css-check"></div>`);

  var interval = setInterval(() => {
    var zIndex = $(`#${constants.CLASS_PREFIX}-css-check`).css('z-index');

    if(zIndex === '99') {
      clearInterval(interval);
      $(`#${constants.CLASS_PREFIX}-css-check`).remove();
      callback();
    }
  }, 10);
}

onCssLoaded(() => {
  api.getTranslations(translationData => {
    translations.setTranslations(translationData);

    if(window.FEEDBACK_PLUGIN_PREVIEW === true) {
      api.getPreview(window.FEEDBACK_PLUGIN_PREVIEW_SURVEY_ID, function(survey) {
        bootstrap.initializePlugin({ survey, deviceId: new Date().getTime(), placement: window.FEEDBACK_PLUGIN_PREVIEW_PLACEMENT });
      });
    } else {
      (window.FEEDBACK_PLUGIN_LIST || []).forEach(function(plugin) {
        api.getSurvey(plugin.udid, function(data) {
          bootstrap.initializePlugin({ survey: data.survey, deviceId: data.device._id, placement: plugin.placement, udid: plugin.udid });
        });
      });
    }

  });
});
