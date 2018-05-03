const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash')

function logPageView(channel, sessionId){
  
  mongoose.connection.db.collection("loadcounts2")
  .insertOne({
    type: 'pageview',
    device_id: channel._id,
    date: new Date(),
    sessionId: sessionId
  })
  
}

function logSurveyView(){
  return (req, res, next) => {
    
    if(_.get(req, 'channel._id')){
      mongoose.connection.db.collection("loadcounts2")
      .insertOne({
        type: 'surveyview',
        survey_id: req.survey_id || _.get(req,'survey._id'),
        device_id: req.channel._id,
        date: new Date()
      })
    } 
    next()
  }
}

module.exports = { logPageView, logSurveyView };