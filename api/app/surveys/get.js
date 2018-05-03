/**
 * @api {get} /surveys GET SURVEYS
 * @apiName GetSurveys
 * @apiGroup Survey
 * @apiDescription Gets survey objects with embedded question data
 * @apiSuccess {[Survey]} data Survey objects
 * @apiSuccess {Number} currentPage Current page of the query
 * @apiSuccess {Number} pages Total number of pages in the query
 * @apiParam {Integer} [page] Page number
 * @apiParam {String} [name] Query by survey name. Currently supports exact matches only.

 * @apiParam {[String]} [question_id]  Query by containing question id, separate by comma
 * @apiParam {Boolean} [archived] Query by archived-state. Default: false
 */

const _ = require('lodash')
const mongoose = require('mongoose')
const oid = mongoose.Types.ObjectId;
const mOid = require('../../lib/utils').mapObjectId;
const OUTPUT_FIELDS = {id: "$_id", _id: 0, name: 1, organization_id: "$organization_id", properties: 1, languages: 1, question_ids: 1, archived: 1, created_at: 1}
const questionFunctions = require('../questions/get_by_id');
const QUESTION_OUTPUT_FIELDS = questionFunctions.OUTPUT_FIELDS;
const trimQuestion = questionFunctions.trimQuestion;
const moment = require('moment')
async function get(req, res){
  try{
    await getSurveys(req, res, 'array');
  } catch(e){
    console.log(e)
    res.status(500).json({error: 'Something went wrong'})
  }
}

async function getById(req, res){
  try{
    await getSurveys(req, res, 'single');
  } catch(e){
    console.log(e)    
    res.status(500).json({error: 'Something went wrong'})
  }}


async function getSurveys(req, res, mode){
  const PAGE_SIZE = 15;
  const isArrayMode = mode == 'array';
  const organization_id = _.get(req, 'rights.organization_id');
  const Survey = mongoose.connection.db.collection("surveys");
  const Question = mongoose.connection.db.collection("questions");
  
  if(!organization_id) return res.status(400).json({error: 'Invalid request. No organization id found.'});
  const query = {organization: oid(organization_id)}
  const {page, name, created_from, created_to, question_id, archived} = (_.get(req, 'query') || {});
  let pages, surveys;  
  
  if(isArrayMode){
    name ? query.name = name : ''
    created_from ? _.set(query, 'created_at.$gte',new Date(parseInt(created_from)*1000)) : ''
    created_to ? _.set(query, 'created_at.$lte',moment(parseInt(created_to))) : ''
    if(created_from && created_to && created_from > created_to) return res.status(400).json({error: 'Created to must be larger than created from'})
    try{ question_id ? query.question_ids = {$in: mOid(question_id.split(","))} : '' } catch(e){ res.status(400).json({error: 'Invalid question id.'})}
    archived != undefined ? query.archived = archived == 'true' : ''

    const count = await Survey.count(query);
    pages = Math.ceil(count/PAGE_SIZE);
    if(page && pages < page-1) return res.status(400).json({error: 'Specified page number exceeds the amount of available pages of ' + pages});
    console.log(query)
    surveys = await Survey.aggregate([{$match: query}, {$limit: PAGE_SIZE}, {$skip: (page ? (page-1) : 0)*PAGE_SIZE }, {$project: OUTPUT_FIELDS}]).toArray();
  } else {
    const id = req.params.id;
    if(!id) return res.status(400).json({error: 'Id parameter is missing'});
    try{ query._id = oid(id) } catch(e){ return res.status(400).json({error: 'Invalid survey id'})}
    surveys = await Survey.aggregate([{$match: query}, {$project: OUTPUT_FIELDS}]).toArray()
    if(!surveys[0]) return res.status(404).json({error: 'Survey not found.'});
  }

  // populate questions
  const question_ids = _.flatten(surveys.map(s => s.question_ids));
  const questions = await Question.aggregate([{$match: {_id: {$in: question_ids}, organization_id}}, {$project: QUESTION_OUTPUT_FIELDS}]).toArray();
  const surveysWithQuestions = surveys.map(survey => {
    const questionObjects = survey.question_ids.map(id => _.find(questions, {id: id}));
    const filteredQuestions = questionObjects.map(q => {
      return trimQuestion(q)
    })
    return Object.assign({}, survey, {questions: questionObjects})
  })

  if(isArrayMode){
    res.send({pages, currentPage: page ? page : 1, data: surveysWithQuestions})
  } else {
    res.send(surveysWithQuestions[0]);
  }
  
}

 module.exports = { get, getById }
