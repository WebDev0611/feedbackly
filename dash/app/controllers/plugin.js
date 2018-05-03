var auth = require('../lib/auth');
var PluginSettings = require('../models/plugin-settings');

module.exports = app => {

  app.get('/api/plugin_settings/:deviceId',
    auth.isLoggedIn(),
    auth.canAccessDevices(req => [req.params.deviceId]),
    (req, res, next) => {
      PluginSettings.findOne({ device_id: req.params.deviceId})
      .then((settings) => res.json(settings))
      .catch(err => next(err))
    }
  )

  app.post('/api/plugin_settings',
    auth.isLoggedIn(),
    auth.canAccessDevices(req => [req.body.device_id]),
    (req, res, next) => {
      PluginSettings.update({ device_id: req.body.device_id}, req.body, { upsert: true })
      .then(() => res.sendStatus(200))
      .catch(err => next(err))
    }
  )
}
