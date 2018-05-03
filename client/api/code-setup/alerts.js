const mongoose = require('mongoose')
const Survey = mongoose.connection.db.collection("surveys");
const Device = mongoose.connection.db.collection("devices");
const Notification = mongoose.connection.db.collection("notifications");
const Question = mongoose.connection.db.collection("questions");
const oid = mongoose.Types.ObjectId
const _ = require('lodash')

function createNotificationBasedOnSurvey(emails, originalSurveyId, newSurveyId, deviceId, organization_id){
  return Notification.findOne({for_template: oid(originalSurveyId)})
  .then(notification => {

    var originalQids = _.map(notification.conditionSet, c => oid(c.question_id))
    Survey.findOne({_id: oid(newSurveyId)})
    .then(survey => Question.find({_id: {$in: survey.question_ids}}).toArray())
    .then(newQuestions => {

      var qidMap = {}
      newQuestions.forEach(q => qidMap[q.from_question.toString()] = q._id)

      var newNotification = Object.assign({}, notification,
        { device_id: [oid(deviceId)],
          organization_id,
          survey_id: oid(newSurveyId),
          messageContentFromQuestionIds: notification.messageContentFromQuestionIds.map(oldId => qidMap[oldId.toString()]),
          receivers: emails.map(e => { return {type: 'email', to: e}})
        })
      delete newNotification._id
      delete newNotification.for_template

      newNotification.conditionSet.forEach(c => {
        c.question_id = qidMap[c.question_id.toString()]
      })

      return Notification.insertOne(newNotification)
    })


  })
}

function createAlertsForSurvey(emails, originalSurveyId, newSurveyId, deviceId, organization_id){
  var emailsArr = emails.map(e => e.split(" ").join(""))


  Notification.findOne({"receivers.to": {$in: emailsArr}, survey_id: oid(newSurveyId)})
  .then(notification => {
    if(notification){
      // add channel to this notification
      return Notification.update({_id: oid(notification._id)}, {$push: {device_id: oid(deviceId)}})
    } else {
      return createNotificationBasedOnSurvey(emails, originalSurveyId, newSurveyId, deviceId, organization_id)
    }
  })



}

module.exports = {createAlertsForSurvey}
