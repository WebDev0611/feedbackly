const Channel = require('../app-modules/models/device')
const Survey = require('../app-modules/models/survey')
const _ = require('lodash')
module.exports = function (app) {
  app.get('/privacy-policy/:id', async (req, res) => {
    try {
      const channelId = req.params.id;
      const channel = await Channel.findById(channelId);
      const survey = await Survey.findById(channel.active_survey);
      const privacyPolicy = _.get(survey, "properties.custom_privacy_policy") || "";
      res.send({ privacyPolicy })
    } catch (e) {
      console.log(e);
      res.status(400).send({ error: 'Error. Check your input' })
    }

  })
}