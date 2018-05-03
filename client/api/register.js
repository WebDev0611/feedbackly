var Device = require('app-modules/models/device');
var Survey = require('app-modules/models/survey');
var Organization = require('app-modules/models/organization');
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('lodash');
module.exports = function(app){

  app.get('/register-thx/:passcode', (req, res) => {
    res.render('./../client/registration/thanks.ejs', {passcode: req.params.passcode, channel: {}})
  })

  app.get('/ipad-settings', (req, res) => {
    res.render('./../client/registration/setup.ejs', {channel: {}})
  })

  app.get('/api/ipad-signup-stage', async (req, res) => {
    var udid = req.query.udid;
    var device = await Device.findOne({udid});
    if(!device) return res.send(400);
    var [survey, org] = await Promise.all([
      Survey.findOne({_id: ObjectId(device.active_survey)}),
      Organization.findOne({_id: ObjectId(device.organization_id)})
    ]);
    if(!survey || !org) return res.send(400);
    if(org.pending_ipad_signup) return res.send({stage: 'PENDING_SIGNUP'});
    if(survey.ipad_example_survey) return res.send({stage: 'PENDING_SURVEY'});
    return res.send({stage: 'DONE'});
  })
}
