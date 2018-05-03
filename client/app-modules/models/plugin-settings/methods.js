var pluginDefaultSettings = require('app-modules/constants/plugin-default-settings');

module.exports = schema => {

  schema.statics.getSettingsForChannel = function(channelId) {
    return this.findOne({ device_id: channelId })
      .then(settings => {
        if(settings) {
          return {
            display: settings.display || pluginDefaultSettings.display,
            placement: settings.placement || pluginDefaultSettings.placement,
            showAfterSecondsOnPage: settings.show_after_seconds_on_page || pluginDefaultSettings.showAfterSecondsOnPage,
            showAfterSecondsOnSite: settings.show_after_seconds_on_site || pluginDefaultSettings.showAfterSecondsOnSite,
            hiddenAfterClosedForHours: settings.hidden_after_closed_for_hours || pluginDefaultSettings.hiddenAfterClosedForHours,
            hiddenAfterFeedbackForHours: settings.hidden_after_feedback_for_hours || pluginDefaultSettings.hiddenAfterFeedbackForHours,
            urlPatterns: settings.url_patterns || pluginDefaultSettings.urlPatterns
          }
        } else {
          return Object.assign({}, pluginDefaultSettings);
        }
      });
  }

}
