const _ = require('lodash');
const moment = require('moment');
const Feedback = require('../../models/feedback');
const utils = require('./utils')
const oid = require('mongoose').Types.ObjectId;
const Survey = require('../../models/survey')
const Channel = require('../../models/device')
const FEATURES = require('../../lib/constants/features')

async function get(req, res) {
  try{
  if((_.get(req, 'userRights.availableFeatures') || []).indexOf(FEATURES.FEEDBACK_INBOX) === -1) return res.status(401).json({error: "No access to Feedback Inbox. Please upgrade your plan."})
    
  const PAGE_SIZE = 100;
  const params = req.query;
  
  const inboxSettings = _.get(req, 'userRights.inbox_settings') || {}
  const inboxMode = inboxSettings.mode || 'all';
  const userGroups = inboxSettings.user_groups;
  
  const devices = _.get(req, 'userRights.devices')
  
  const query = {device_id: {$in: devices.map(id => oid(id))}}
  if(params.created_from) query.created_at = {$gte: moment(parseInt(params.created_from)*1000).toDate()};
  if(params.created_to) _.set(query, 'created_at.$lte', moment(parseInt(params.created_to)*1000).toDate())
  
  if(inboxMode == 'group_assigned' && userGroups){
    query.processedByGroup = {$elemMatch: {group_id: {$in: userGroups.map(g => oid(g))}}}
    if(params.processed) {
      query.processedByGroup.$elemMatch.processed = params.processed === "true" 
    }
  } else {
    if(params.processed !== "true") _.set(query, 'processed.$ne',true);
  }
  
  const feedback = await Feedback.find(query).sort({created_at: -1}).skip((params.page || 0) * PAGE_SIZE).limit(PAGE_SIZE)
  const surveyIds = feedback.map(fb => fb.survey_id);
  const channelIds = feedback.map(fb => fb.device_id);
  
  const [surveys, channels] = await Promise.all([ Survey.find({_id: {$in: surveyIds}}, {name: 1}), Channel.find({_id: {$in: channelIds}}, {name: 1, type: 1})]);
  
  const returnables = feedback.map(fb => {
    return {
      id: fb._id,
      created_at: fb.created_at,
      contact: utils.decryptContact(fb.contact) || null, 
      survey_name: _.get(_.find(surveys, {_id: fb.survey_id}), 'name') || '',
      channel_name: _.get(_.find(channels, {_id: fb.device_id}), 'name') || '',
      processed: utils.getProcessedState(fb, inboxSettings),
      notified: (fb.notified || []).length > 0
    }
  })
  
  res.send(returnables)
  } catch(e){
    console.log(e);
    res.status(500).send({error: 'Something went wrong'});
  }
  
  /*
  
  [
    {
      id: String,
      created_at: Date,
      contact: String,
      survey_name: String,
      channel_name: String,
      processed: Boolean
    }  
  ]
  */
  }

  module.exports = { get };