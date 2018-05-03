const utils = require('./utils');
const Feedback = require('../../models/feedback');
const respond = require('./respond');
const makeEvents = require('./make_events').makeEvents;
const Message = require('../../models/message');
const _ = require('lodash')
const FEATURES = require('../../lib/constants/features')

async function postMessage(req, res) {
  if((_.get(req, 'userRights.availableFeatures') || []).indexOf(FEATURES.FEEDBACK_INBOX) === -1) return res.status(401).json({error: "No access to Feedback Inbox. Please upgrade your plan."})

  const availableTypes = ['sms', 'email', 'note']
  let feedback, rightsTodevices
  const body = req.body;
  const feedback_id = req.params.id;
  const user = req.user;

  try{
    if(!feedback_id || availableTypes.indexOf(body.type) == -1 || !body.data || body.data.length < 1) return res.status(400).json({error: 'Invalid request parameters.'});

    feedback = await Feedback.findOne({_id: feedback_id});
    rightsTodevices = (_.get(req, 'userRights.devices') || []).map(id => id.toString())
    if(rightsTodevices.indexOf(feedback.device_id.toString()) === -1) return res.status(404).json({error: 'Feedback not found'});
  } catch(e){ console.log(e); return res.status(400).json({error: 'Invalid request parameters.'})}

  let contactToSend, sendStatus = 200;

  try{
  if(body.type === 'sms' || body.type === 'email') {
    const allContactInfo = await utils.getAllContactInfo(feedback.contact, rightsTodevices);
    const key = body.type === 'sms' ? 'phone' : 'email';
    contactToSend = allContactInfo.map(c => c[key]).filter(c => c != undefined)[0];
    if(contactToSend == undefined) return res.status(400).json({error: "Can't find contact info for this message type."});
    if(body.type === 'sms') sendStatus = await respond.sendSMS({number: contactToSend, message: body.data, user: user, organization_id: req.user.activeOrganizationId()});
    else if(body.type === 'email') sendStatus = await respond.sendEmail({address: contactToSend, message: body.data, subject: body.subject, user: user, organization_id: req.user.activeOrganizationId()});
  }

  if(sendStatus == 200){
    const rights = await req.user.rightsInOrganization(req.user.activeOrganizationId())
    const groups = _.get(rights, 'inbox_settings.user_groups');
    let group = null;
    if(groups){
      if(rights.inbox_settings.mode == 'group_assigned'){
        group = _.intersection(groups.map(g => g.toString(), (feedback.processedByGroup || []).map(g => g.group_id.toString())))[0]
      }
    }
    const message = await Message.create({
      contact: contactToSend, 
      type: body.type, 
      created_by: req.user._id, 
      message: body.data,
      feedback_id: feedback_id,
      group_id: group
    });
    return res.json(message);
  } else {
    let returnMessage = {text:'Something went wrong with sending the message. Check input.', status: 500}
    if(sendStatus === 'NO_BALANCE') returnMessage = {text: 'No balance on SMS account. Ask your admin to top-up.', status: 401}
    if(sendStatus === 401) returnMessage = {text: "Your organization is not authorized to send sms.", status: 401}
    return res.status(returnMessage.status).json({error: returnMessage.text})
  }
} catch(e){ console.log(e); res.status(500).json({error: 'Something went wrong'})}

}

module.exports = { postMessage }