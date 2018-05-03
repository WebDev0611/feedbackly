var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId;
var _ = require('lodash')

const getters = require('./get');

function put() {}
function post() {}
function activate() {}

async function copy(req, res){
  var id = req.params.id;
  var createdBy = req.query.user_id;
  var organizationId = req.query.organization_id;

  if(!id || !createdBy || !organizationId) return res.sendStatus(400);

  try{
  var survey = await mongoose.connection.db.collection("surveys").findOne({_id: oid(id)});
  var questionIdMap = {}
  var questions = await mongoose.connection.db.collection('questions').find({_id: {$in: survey.question_ids}}).toArray()
  var newQuestions = []
  for(q of questions){
    if(q.hidden) return true;
    var newQ = JSON.parse(JSON.stringify(q));
    newQ.created_by = oid(createdBy);
    newQ.organization_id = oid(organizationId);
    newQ.createdAt = new Date();
    newQ.copy_from = q._id;
    delete newQ._id;
    var id = (await mongoose.connection.db.collection("questions").insert(newQ)).ops[0]._id;
    questionIdMap[q._id.toString()] = id.toString();
    newQuestions.push(id);
  }
  var newSurvey = JSON.parse(JSON.stringify(survey));
  newSurvey.question_ids = newQuestions;
  newSurvey.created_by = oid(createdBy);
  newSurvey.organization = oid(organizationId);
  newSurvey.createdAt = new Date();

  var logic = _.get(newSurvey, 'properties.logic')
  if(logic){
    var newLogic = {}
    _.forEach(logic, (val,oldQId) => {
      var newVal = {}
      _.forEach(val, (oldTargetId,optionKey) => {
        var newTarget = oldTargetId == 'end' ? 'end' : questionIdMap[oldTargetId]
        newVal[optionKey] = newTarget;
      })
      newLogic[questionIdMap[oldQId]] = newVal;
    })
    newSurvey.properties.logic = newLogic;
  }
  newSurvey.copy_from = survey._id;
  delete newSurvey._id;
  var result = await mongoose.connection.db.collection('surveys').insertOne(newSurvey);
  res.send(result.ops[0])
  }catch(e){
    console.log(e)
    res.send(e)
  }
}

module.exports = {  get: getters.get, getById: getters.getById, put, post, activate, copy }
