var PluginSettings = require('app-modules/models/plugin-settings');

function getSettingsForChannel(getChannelId) {
  return (req, res, next) => {
    var channelId = getChannelId(req);

    PluginSettings.getSettingsForChannel(channelId)
      .then(settings => {
        req.pluginSettings = settings;

        return next();
      })
      .catch(err => next(err));
  }
}

module.exports = { getSettingsForChannel };
