/**
 * @api {get} /feedbacks GET FEEDBACK
 * @apiName GetFeedbacks
 * @apiGroup Feedback
 * @apiVersion 1.0.0
 * @apiDescription Gets feedback objects
 * @apiSuccess {[Feedback]} data Feedback objects
 * @apiSuccess {Number} currentPage Current page of the query
 * @apiSuccess {Number} pages Total number of pages in the query
 * @apiParam {[String]} [channel_id] Specify channel id(s) to query feedback from, comma-separated
 * @apiParam {[String]} [survey_id] Specify survey id(s) to query feedback from, comma-separated
 * @apiParam {String} [meta] Fetch feedback with this metadata [meta=key:val;key2:val2]
 * @apiParam {Number} [date_from] Fetch feedback starting from this UNIX timestamp
 * @apiParam {Number} [date_to] Fetch feedback before this UNIX timestamp
 * @apiParam {[String]} [language] Fetch feedback in a specified language code [en|es|fr|de etc.]
 * @apiParam {[String]} [question_id] Fetch feedback that contains an answer for the specified question.
 * @apiParam {[String]} [question_type] Fetch feedback that contains an answer to the specified question type.
 * @apiParam {[String]} [value] Fetch feedback that has this value as one of its answers.
 * @apiParam {Boolean} [omit_others] Omit other feedback in chain that doesn't match criteria (value, question type, question id)
 * @apiParam {Boolean} [hidden_feedback] Include hidden feedback
 * @apiParam {Integer} [page] Page number 
 */

const OUTPUT_FIELDS = {id: '$_id', _id: 0, survey_id: 1, channel_id: '$device_id', created_at: 1, meta_browser: 1, metadata: '$meta_query', language: 1, data: 1}

var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId
var mOid = require('../../lib/utils').mapObjectId;
var _ = require('lodash');
var encryption = require("../../lib/encryption");
const moment = require('moment');

async function getFeedback(req, res, mode){
  // mode == single | array
  const arrayMode = mode === 'array';
  try{
    const Feedback = mongoose.connection.db.collection('feedbacks');
    const {survey_id, date_from, date_to, meta, language, question_id, question_type, value, page, omit_others} = req.query;

    const omitOthers = omit_others == 'true';
    const OBJECTS_PER_PAGE = 500;    
    // single
    const id = req.params.id;
    
    // single + array
    const includeHiddenFeedback = _.get(req, 'query.hidden_feedback') == 'true';

    var devices = _.map(_.get(req, 'rights.device_ids') || [], d => d.toString());
    var queryDevices = arrayMode && req.query.channel_id ? req.query.channel_id.split(",") : devices;
    if(queryDevices.length == 0) queryDevices = devices;

    var query = {
      device_id: {$in: mOid(_.intersection(devices, queryDevices))},
      organization_id: _.get(req, 'rights.organization_id')
    }
    if(query.device_id.$in.length === 0) return res.status(401).json({error: 'No access to any channels.'});

    if(arrayMode){
   
      if(survey_id) {
        try{
          query.survey_id = {$in: mOid(survey_id.split(","))}
        }  catch(e) { return res.status(400).json({error: 'invalid survey id'}) }
      }
  
      if(date_from && date_to && (date_from >= date_to)) return res.status(400).json({error: 'date_from cannot be larger or equal to date_to'})
      if(date_from || date_to) query.created_at = {}
      if(date_from) query.created_at.$gte= moment(parseInt(date_from)*1000).toDate()
      if(date_to) query.created_at.$lte= moment(parseInt(date_to)*1000).toDate()

      if(meta){
        var keyVals = meta.split(";");
        var metas = keyVals.map(kv => {return {key: kv.split(":")[0], val: kv.split(":")[1]}})
        if(metas.length > 0){  
          query.meta_query = {$in: []}       
          metas.forEach(meta => query.meta_query.$in.push(meta));
        } else return res.status(400).json({error: 'meta parameter is not in the correct format. Use meta=key;value'})
      }

      if(language) query.language = {$in: language.split(",") }
      if(question_id) try{ query["data.question_id"] = {$in: mOid(question_id.split(","))} } catch(e){ res.status(400).json({error: 'question_id is not valid'}) }
      if(question_type) query["data.question_type"] = {$in: question_type.split(",") }

      if(value) {
        var unencryptedValues = value.split(",");
        var encryptedValues = _.map(unencryptedValues, v => encryption.encrypt(v));
        var floats = _.map(unencryptedValues, v => parseFloat(v)).filter(v => v != undefined && v!= null)
        var nps = floats.map(v => v > 1 ? v/10 : v)
        query["data.value"] = {$in: [...unencryptedValues, ...encryptedValues, ...floats, ...nps].filter(v => !_.isNaN(v)) }
      }

      var count = await Feedback.count(query);
      var pageCount = Math.ceil(count/OBJECTS_PER_PAGE);

      if(page && parseInt(page) > pageCount) return res.status(400).json({error: 'Page count exceeds the amount of pages which is ' + pageCount})
      var currentPage = parseInt(page) || 1
      var skip = OBJECTS_PER_PAGE * (currentPage-1);

      const pipeline = [
        {$match: query},
        {$limit: skip + OBJECTS_PER_PAGE},
        {$skip: skip },
        {$project: OUTPUT_FIELDS}
      ];
  
      var feedback = await Feedback.aggregate(pipeline).toArray()
    
    } else {
      try{ query._id = oid(id); }catch(e){ return res.status(400).json({error: 'Invalid feedback id'})}
      const pipeline = [
        {$match: query},
        {$project: OUTPUT_FIELDS}
      ];
  
      var feedback = await Feedback.aggregate(pipeline).toArray()
      if(!feedback[0]) return res.status(404).json({error: 'Specified feedback not found.'})
    }

    
    const decrypted = feedback.map(fb => {
      return encryption.decryptFeedback(fb)
    })

    // additional formatting

    const returnable = decrypted.map(fb => {
      return Object.assign({}, fb, {
        data: fb.data.map(data => {
          if(data.question_type == 'Upsell') return;
          if(data.hidden && !includeHiddenFeedback) return;
          if(data.question_type == 'NPS') data.value = data.value * 10;
          if(arrayMode && omitOthers){
            if(question_type && data.question_type != question_type) return;
            if(question_id && data.question_id != question_id) return;
            if(value && data.value != value) return;            
          }   
          return _.omit(data, ['crypted', 'filtered', 'hidden', 'created_at', '_id'])
        }).filter(el => el !== undefined)
      })
    }).filter(fb => (_.get(fb, 'data') || []).length > 0)

    const response = 
    arrayMode ? 
    {currentPage, pages: pageCount == 0 ? 0 : pageCount, data: returnable } :
    returnable[0];

    return res.json(response)
 } catch(e) { console.log(e); res.sendStatus(500)}
}


function getById(req, res){
  getFeedback(req, res, 'single')
}

function get(req, res){
  getFeedback(req, res, 'array')
}


module.exports = {get, getById}
