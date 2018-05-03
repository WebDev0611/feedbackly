var Survey = require('../../models/survey')
var Feedback = require('../../models/feedback')
var Promise = require('bluebird')
var oid = require('mongoose').Types.ObjectId
var translate = function(string){return string} // todo
var _ = require('lodash')

function mapChoicesToText(choices, language, idprefix, type, availableLangs, options){
  var prefix = idprefix ? idprefix+"_" : ''

  return _.map(choices, choice => {
    var obj = {
      name: choice.text[language] || choice.text['en'] || choice.text[availableLangs[0]],
      key: prefix + choice.id
   }

   obj = Object.assign({}, obj, options || {})

  if(type) obj.type = type;
  return obj
  })
}

async function createHeaders(opts){
/*
  opts = {
    survey_ids,
    language,
    device_ids,
    date_from,
    date_to
  }
*/

  const survey_ids = (_.get(opts, 'surveys') || []).map(id => oid(id))
  const device_ids = (_.get(opts, 'devices') || []).map(id => oid(id))

  const language = _.get(opts, 'language');
  var headers = [{name: '_id', key: '_id'}, {name: translate('Date'), key: 'Date'}, {name: translate('Time'), key: 'Time'}, {name: translate('Channel'), key: 'Channel'}]

  var surveysPromise = Survey.find({_id: {$in: survey_ids}}).populate("question_ids")
  var findUsedMeta = Feedback.aggregate([
    {$match: {device_id: {$in: device_ids}, survey_id: {$in: survey_ids},created_at_adjusted_ts: {$gte: opts.from, $lte: opts.to}}},
    {$group: {_id:"$meta_query.key"}},
    {$unwind: {path : "$_id"}},
    {$group: {_id: "$_id"}}]);


  var [surveys, usedMeta] = await Promise.all([surveysPromise, findUsedMeta])

  var usedMetaKeys = usedMeta.map(o => o._id).filter(o => o != '__url')
  var questions = surveys.map(s => s.question_ids)
  questions = _.flatten(questions)

  questions.forEach(q => {

      var availableLangs = _.keys(q.heading)
      var heading = q.heading[language] || q.heading['en'] || q.heading[availableLangs[0]]
      var returnable = {name: heading, key: q._id.toString(), type: q.question_type}
    if(['Slider', 'Contact'].indexOf(q.question_type) > -1){
      // create multiple columns
      var columns = mapChoicesToText(q.choices, language, q._id.toString(), q.question_type, availableLangs, {smallScale: _.get(q, 'opts.smallScale')})

    }

    if(['Word', 'Image'].indexOf(q.question_type) > -1){
      var choiceMap = {}
      mapChoicesToText(q.choices, language, null, null, availableLangs).forEach(c => choiceMap[c.key] = c.name)
      q.question_type == 'Image' ? q.choices.map(c => { returnable.urls = Object.assign({}, returnable.urls, {[c.id]: c.url})}) : null
      returnable.choiceMap = choiceMap;
    }
    if(columns) headers = [...headers, ...columns]
    else if(!_.find(headers, {key: q._id.toString()})) headers.push(returnable)

  })

  headers = [...headers, ...usedMetaKeys.map(key => {return {name: key, key: `meta_${key}`}}), {name: translate('Browser'), key: 'Browser'}]

  return headers;

}

module.exports = {createHeaders}
