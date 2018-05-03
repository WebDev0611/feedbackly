const Promise = require('bluebird')
const mongoose = require('mongoose')
const User = mongoose.connection.db.collection("users")
const Question = mongoose.connection.db.collection("questions")
const Survey = mongoose.connection.db.collection("surveys");
const Device = mongoose.connection.db.collection("devices");
const oid = mongoose.Types.ObjectId

function getOrganizationAdminId(organization_id){

  return User.findOne({organization_admin: oid(organization_id)})
  .then(user => user._id)
}

function copyQuestion(question_id, organization_id){
  return Question.findOne({_id: question_id})
  .then(question => {
    var newQ = Object.assign({}, question, {organization_id: oid(organization_id), createdAt: new Date(), from_question: oid(question_id)})
    delete newQ._id;
    return Question.insertOne(newQ)
    .then(o => o.insertedId)
  })
}

function deepCopySurvey(_id, createdBy, organization_id){

  return Survey.findOne({_id: oid(_id)})
  .then(survey => {
    var question_ids = survey.question_ids;
    var promises = question_ids.map(questionId => copyQuestion(questionId, organization_id));
    return Promise.all([Promise.resolve(survey), Promise.all(promises)])
    .spread((survey, question_ids) => {
      var newSurvey = Object.assign({},survey, {_id: oid(), question_ids, createdBy, organization: organization_id, from_template: _id})
      delete newSurvey.template
      return Survey.insertOne(newSurvey)
    })
  })
  .then(res => res.insertedId)

}

function copySurvey(id, organization_id){

  return Survey.findOne({organization: oid(organization_id), from_template: oid(id)})
  .then(result => {
    if(result){
      return result;
    } else {
      return getOrganizationAdminId(organization_id)
      .then(createdBy => deepCopySurvey(id, createdBy, organization_id))
    }
  })
}

function activateSurvey(device_id, survey_id){
  return Device.update({_id: device_id}, {$set: {active_survey: oid(survey_id), latest_activation: Date.now()/1000}})
}

module.exports = {copySurvey, activateSurvey}
