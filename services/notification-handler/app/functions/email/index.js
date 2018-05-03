var Promise = require('bluebird');
var mongoose = require('mongoose')
var _ = require('lodash')
var moment = require('moment')
var fs = require('fs');
const path = require('path');
const templateString = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'UTF-8')

var oid = mongoose.Types.ObjectId
var mailerSend = require('./mailer')
var questionBlocks = require('./question_blocks')
var dbOperations = require('../db_operations')
var API_URL = process.env.API_URL || 'https://api.feedbackly.com'

function getSurvey(_id){
  return mongoose.connection.db.collection('surveys').findOne({_id: oid(_id)})
}

function getDevice(_id){
  return mongoose.connection.db.collection('devices').findOne({_id: oid(_id)})
}

function getQuestions(ids){
  var oids = ids.map(id => oid(id))
  return mongoose.connection.db.collection('questions').find({_id: {$in: oids}}).toArray()
}

function buildData(survey, device, questions, content, feedback){

  var surveyTitle = survey.name;
  var deviceName = device.name;
  var feedback_id = _.get(content, 'feedback_id');
  var contentBlocks = questions.map(q => questionBlocks.build(q, _.find(content.data, {question_id: q._id})))
  
  const metadata = _.get(feedback, 'meta_query');
  if(metadata && metadata.length > 0){
    contentBlocks.push(`
    <div style="text-align: center;">
    <span style="font-family:tahoma,geneva,sans-serif; font-style:italic;"><span style="font-size: 13px;">
  `)

  metadata.forEach(data => {
    contentBlocks.push(`${data.key}: ${data.val} <br />`)
  })

  contentBlocks.push(`
      </span></span>
      </div>
  `)
  }
  
  var emailContent = contentBlocks.join("")
  const from = {name: "Feedbackly notifications", email: "notifications@feedbackly.com"}
  const subject = `Notification from your survey ${surveyTitle}`

  const mailObjects = [];

  content.receivers.forEach(rec => {
    const to = rec.text;

    var html = templateString.replace(/{{device_name}}/g, deviceName);
    html = html.replace(/{{created_at}}/g, moment.utc(content.created_at_adjusted_ts*1000).format('DD.MM.YYYY HH:mm'));
    html = html.replace(/{{created_at}}/g, moment.utc(content.created_at_adjusted_ts*1000).format('DD.MM.YYYY HH:mm'));
    html = html.replace(/{{survey_name}}/g, surveyTitle);
    html = html.replace(/{{content}}/g, emailContent);
    html = html.replace(/{{handle_feedback_link}}/g, `${API_URL}/feedbacks/${feedback_id}/handle`)
    html = html.replace(/{{unsubscribe_link}}/g, `${API_URL}/notifications/${content.notificationRuleId}/unsubscribe?email=${rec.text}`);
    mailObjects.push({from, subject, html, to, metadata});
  })
  return mailObjects;

}

function send(content){
    const Feedback = mongoose.connection.db.collection("feedbacks")

    return Promise.all([
      getSurvey(content.survey_id),
      getDevice(content.device_id),
      getQuestions(content.data.map(fbe => fbe.question_id)),
      Feedback.findOne({_id: oid(content.feedback_id)})
    ])
    .spread((survey, device, questions, feedback) =>  buildData(survey, device, questions, content, feedback))
    .then(mails => mailerSend(mails))
    .then(() => dbOperations.updateAsSent(content.feedback_id, content.notificationRuleId))
    .then(() => true)
}

module.exports = {send}
