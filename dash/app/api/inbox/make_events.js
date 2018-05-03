const _ = require('lodash');
const Question = require('../../models/question');
const Survey = require('../../models/survey');
const Channel = require('../../models/device');
const User = require('../../models/user');
const Organization = require('../../models/organization');
const handleQuestionTypes = require('./handle_question_types').handleQuestionTypes;

async function makeEvents(rawEvents, language){
  
  const feedback = rawEvents.filter(e => e.type == 'feedback');
  const question_ids = _.flatten(feedback.map(o => o.object.data.map(fbe => fbe.question_id)))
  const channel_ids = feedback.map(o => o.object.device_id)
  const survey_ids = feedback.map(o => o.object.survey_id)
  const user_ids = rawEvents.map(e => e.object.created_by).filter(id=> id != undefined)
  const organization_id = _.uniq(feedback.map(f => f.object.organization_id))
  
  
  const [questions, channels, surveys, users, organization] =  await Promise.all([
    Question.find({_id: {$in: question_ids}}), 
    Channel.find({_id: {$in: channel_ids}}, {name: 1}),
    Survey.find({_id: {$in: survey_ids}}, {name: 1}),
    User.find({_id: {$in: user_ids}}, {displayname: 1}),
    Organization.findOne({_id: {$in: organization_id}})
  ])

  const returnable = rawEvents.map(e => {
    const base = {
      _id: e._id,
      type: e.type,
      created_at: e.created_at,
    }

    if(e.type == 'feedback'){
      base.channel = _.find(channels, {_id: e.object.device_id});
      base.survey = _.find(surveys, {_id: e.object.survey_id});
      base.feedback = e.object.data.map(d => handleQuestionTypes(_.find(questions, {_id: d.question_id}), d, language))
      base.metadata = e.object.meta_query;
    }

    if (e.type == 'processing') {
      if(e.object.processed == true) base.type = 'process';
      else base.type = 'unprocess'
      base.created_by = _.find(users, {_id: e.object.created_by})
      base.group_id = _.get(_.find(organization.user_groups, {_id: e.object.group_id}), 'name')
    }

    if(e.type == 'message'){
      base.created_by = _.find(users, {_id: e.object.created_by})
      base.message = {type: e.object.type, message: e.object.crypted ? decrypt(e.object.message) : e.object.message}      
    }

    return base;
  })
  
  return returnable;
}

module.exports = {makeEvents};