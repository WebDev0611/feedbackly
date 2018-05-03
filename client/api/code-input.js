var Alerts = require('./code-setup/alerts')
var Surveys = require('./code-setup/surveys')
var Upsells = require('./code-setup/upsells')
var mongoose = require('mongoose')
var CLIENT_URL = process.env.CLIENT_URL;
var Promise = require('bluebird')

module.exports = app => {
  app.get('/', (req, res) => {


    res.render('code-input/code-input', {})

  })

  app.post('/code/validate', (req, res) => {
    const code = req.body.code
    const Device = mongoose.connection.db.collection("devices")
    Device.findOne({udid: code})
    .then(device => {
      if(device !== null){
      if(!device.setupDone){
        res.json({setupNeeded: true})
      } else {
        res.json({redirect_url: process.env.CLIENT_URL + '/surveys/' + code})
      }} else res.status(404).json({error: 'Not found'})
    })
  })

  app.post('/pin/validate', (req, res) => {

    const Survey = mongoose.connection.db.collection("surveys")
    const Device = mongoose.connection.db.collection("devices")
    const Upsell = mongoose.connection.db.collection("upsells")
    const {code, pin} = req.body
    var upsells, organization_id;
    Device.findOne({udid: code, passcode: pin})
    .then(device => device.organization_id)
    .then(orgid => {
      organization_id = orgid;
      return Upsell.find({organization_id: orgid}).toArray()
    })
    .then(upsellz => {
      upsells = upsellz
      return Survey.find({$or: [{template: true}, {organization: organization_id}]}).toArray()
    })
    .then(surveys => {
      res.send({validPin: true, surveys, upsells})
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(404)
    })

  })

  app.post('/code/setup', (req, res) => {
    const Device = mongoose.connection.db.collection("devices")
    const {upsells, code, pin, alerts, survey_id, name} = req.body
    // validate input

    Device.findOne({udid: code, passcode: pin})
    .then(device => {

      return Promise.all([
        Upsells.assignUpsellsForEngagePoint(device._id, upsells),
        Surveys.copySurvey(survey_id, device.organization_id)
        .then(newSurveyId => Promise.all([
          Alerts.createAlertsForSurvey(alerts, survey_id, newSurveyId, device._id, device.organization_id),
          Surveys.activateSurvey(device._id, newSurveyId),
          Device.update({_id: device._id}, {$set: {setupDone: true, name: name}})
        ]))
      ])
    })
    .then(() => {
      res.send({redirect_url: `${CLIENT_URL}/surveys/${code}`})
    })
    .catch(err => {
      console.log(err)
    })
  })
}
