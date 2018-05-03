const Feedback = require('../../models/feedback') 
const _ = require('lodash');
const isValidObjectId = require('../../lib/is_valid_oid').isValidObjectId;
const FEATURES = require('../../lib/constants/features')

async function process(req, res) {
  if((_.get(req, 'userRights.availableFeatures') || []).indexOf(FEATURES.FEEDBACK_INBOX) === -1) return res.status(401).json({error: "No access to Feedback Inbox. Please upgrade your plan."})

  const feedbackId = req.params.id;
  const desiredSate = req.body.processed

  if(!isValidObjectId(feedbackId) || typeof desiredSate !== 'boolean') return res.status(400).send({error: 'Invalid request parameters.'})
  try{
    const feedback = await Feedback.findById(feedbackId);
    const logEvent = {created_at: new Date(), processed: desiredSate, created_by: req.user._id};
    
    if(feedback.processedByGroup){
      const inboxSettings = _.get(req, 'userRights.inbox_settings') || {}
      const inboxMode = inboxSettings.mode || 'all';
      const userGroups = inboxSettings.user_groups;
      if(inboxMode == 'group_assigned' && userGroups){
        feedback.processedByGroup = feedback.processedByGroup.map(pbg => {
          if(userGroups.indexOf(pbg.group_id.toString()) > -1){
            pbg.processed = desiredSate;
            pbg.log.push(logEvent)
          }
          return pbg;
        })
        const allProcessed = Math.max(...feedback.processedByGroup.map(p => p.processed == true ? 1 : 0)) === 1;
        feedback.processed = allProcessed;
      } else {
        feedback.processed = desiredSate;
        feedback.processingLog = [...(feedback.processingLog || []), logEvent]
      }
    } else {
      feedback.processed = desiredSate;
      feedback.processingLog = [...(feedback.processingLog || []), logEvent]
    }

    await Feedback.update({_id: feedback._id}, {$set: {
      processed: feedback.processed, 
      processingLog: feedback.processingLog,
      processedByGroup: feedback.processedByGroup
    }});

    res.send({processed: desiredSate});

  } catch(e){
    console.log(e);
    res.status(500).send({error: 'Something went wrong'})
  }
}

module.exports = {process}