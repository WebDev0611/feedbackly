// results

var totals = require('./get/aggregation/device').createWeekdayAggregation
var moment = require('moment')

function getByQuestionId(req, res){
  // check user rights to question
    // getUserDevices
    // getRightsToSurvey
  // if true, request question from service


  var options = {
    /* options = {
      dateFrom,
      dateTo,
      organizationId,
      [deviceId],
      questionId,
      plan.maxFbeventCount || undefined,
      totalsTarget: 'organization' || 'device'

      NEW:
      matchOptions: {'data.Button.abcdef': {$in: [0.5, 0.25]}, 'meta.customerId': {$in: ['1234']}
      question_type: 'Button' || 'Word' etc
    }
    */

    dateFrom: moment.utc().subtract(1, 'day').startOf('day'),
    dateTo: moment.utc().add(1, 'day').startOf('day'),
    organizationId: "572305be196d36ea003d0100",
    deviceId: ["586cfc6d8723cd000ef79688"],
    questionId: "572305be196d36ea003d0101",
    totalsTarget: 'device',
    type: 'Button',
    surveyId: ["572305be196d36ea003d0115"]
  }


  res.send(totals(options))

  // res.render(json)
}


function defaultSettings(req, res){
  // get User devices
  // request default survey and devices from service
}


function getPDF(req, res){
  // params: survey, devices, time range
  // get User devices


}


module.exports = { getByQuestionId, defaultSettings, getPDF } 
