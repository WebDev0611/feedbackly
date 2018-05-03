const Device = require('../models/device');
const Survey = require('../models/survey');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs')

function scriptSource(udid){
  return `<script src='https://survey.feedbackly.com/plugin/${udid}/script.js'></script>`;
}


function get(req, res){
  // Get based on api key
  if(req.query.api_key != "$2a$10$iRx81j8z.gtb3pd6.ABfXO5nT8Z6YMQfhtRWmPiR5qbvHLympgg1y") return res.sendStatus(401);

  Device.find({ type: "PLUGIN", organization_id: '583579fc4d6c72a469034c19'})
  .then(devices => {
    var activeSurveyIds = _.map(devices, 'active_survey');
    Survey.find({_id: {$in: activeSurveyIds}}).then(surveys => {
      var returnables = [];
      devices.forEach(d => {
        var surveyName = _.get(_.find(surveys, {_id: d.active_survey}), 'name') || "";

        returnables.push({
          name: d.name,
          active_survey_id: d.active_survey || '',
          active_survey_name: surveyName,
          script: scriptSource(d._id)
        })
      })
      res.json(returnables);
    })

  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500);
  })

}

module.exports = {get}
