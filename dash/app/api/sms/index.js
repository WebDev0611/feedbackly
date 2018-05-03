const mongoose = require('mongoose')
const _ = require('lodash')
const MiniId = require('../../lib/mini-id');
const SmsContact = require('../../models/device/smscontact');
const isGSM7 = require('./gsm_chars').isGSM7;
const sendPlivo = require('./plivo').sendPlivo;
const updateMessageStatusPlivo = require('./plivo').updateMessageStatus;
const updateMessageStatusQuiubas = require('./quiubas').updateMessageStatus;
const sendQuiubas = require('./quiubas').sendQuiubas;
const sendNexmo = require('./nexmo').send
const handleNexmoReceipt = require('./nexmo').handleNexmoReceipt;
const PLIVO = 'PLIVO'
const QUIUBAS = 'QUIUBAS'
const NEXMO = 'NEXMO'


async function getMiniId(settings){
  var surveyMiniId;

  try{
    surveyMiniId = _.get((await mongoose.connection.db.collection('survey-mini-ids').findOne({survey_id: settings.surveyId, device_id: settings.deviceId })), 'mini_id')
    if(!surveyMiniId){
      let seed = ((await mongoose.connection.db.collection('survey-mini-id-seed').findOne({})) || {seed: 0}).seed++;
      surveyMiniId = MiniId.generate(seed)
      await mongoose.connection.db.collection('survey-mini-id-seed').update({}, {$inc: {seed: 1}}, {upsert:true})
      await mongoose.connection.db.collection('survey-mini-ids').update({survey_id: settings.surveyId, device_id: settings.deviceId }, {$set: {mini_id: surveyMiniId}}, {upsert: true})
    }

    }catch(e){
      console.error(e)
    }

    return surveyMiniId || '';
}

function smsLinkCreate(miniId){
  const host = process.env.SMS_TINY_LINK_HOST;
  return `${host}/${miniId}`
}

function createMessage(message, link, shortid){

  var sendLink = link;
  if(shortid){
    sendLink+= "/"+shortid
  }

  if(message.indexOf('(link)') > -1){
    var messageWithLink = message.replace('(link)', sendLink);
  } else var messageWithLink = message + " " + sendLink;
  return messageWithLink
}


async function send(settings) {
  if(settings.isTest){
    const deviceId = settings.devices[0];
    const link = smsLinkCreate((await getMiniId({deviceId, surveyId: settings.surveyId})));
    const payload = {message: createMessage(settings.textBody, link), fromName: settings.fromName, number: settings.phoneNumber}
    const response = await sendSingleMessage(payload)
    createLog(response,settings, payload)

  
  } else {

    for(deviceId of settings.devices){
      const link = smsLinkCreate((await getMiniId({deviceId, surveyId: settings.surveyId})));
      const contacts = await SmsContact.find({device_id: deviceId});
      for(contact of contacts){
        const contactObject = contact.toJSON()
        const message = createMessage(settings.textBody, link, contact.shortid)
        const payload = {message, number: contactObject.phone_number, fromName: settings.fromName}
        const response = await sendSingleMessage(payload)
        createLog(response,settings, payload)
      }
    }
  }

  return ''
}

function formatNumber(number){
  if(number.indexOf('00') == 0) number = number.replace('00', '');
  if(number.indexOf('+') > -1) number = number.replace('+', '');
  return number
}

function pickOperator(message, number, isUnicode){
  // DETERMINE WHETHER TO USE QUIUBAS FOR MEXICO
  let operator = NEXMO;

  let isMexico = number.indexOf('52') == 0;
  if(isMexico) operator = PLIVO   // quiubas sucks so much
  /*
  let isUnderFourMessages = Math.ceil(message.length/70) < 4;
  if((isMexico && !isUnicode) || (isMexico && isUnicode && isUnderFourMessages)) operator = PLIVO;
  */
  

  return operator;
}


async function sendSingleMessage(payload){
  const isUnicode = !isGSM7(payload.message);
  const formattedNumber = formatNumber(payload.number);
  const operator = pickOperator(payload.message, payload.number, isUnicode)

  const opts = {message: payload.message, number: formattedNumber, fromName: payload.fromName}
  const sendFunctions = {
    [PLIVO]: async () => await sendPlivo(opts, isUnicode),
    [QUIUBAS]: async () => await sendQuiubas(opts, isUnicode),
    [NEXMO]: async () => await sendNexmo(opts, isUnicode)
  }
  const response = await sendFunctions[operator]();
  return response;
}

async function sendSingleMessageWithLog(payload, settings){
  const response = await sendSingleMessage(payload);
  createLog(response, settings, payload)
  return response
}

function createLog(response, settings, payload){
  const log = {
    status: response.status,
    response,
    payload: settings,
    created_at: new Date(),
    billed: false,
    pending: true,
    created_by: settings.user_id,
    messageCount: !isGSM7(payload.message) ? Math.ceil(payload.message.length / 70) : Math.ceil(payload.message.length / 160)
  }
  mongoose.connection.db.collection('smslogs').insert(log)
}

async function webhook(req, res){
  console.log(req.query)
  let handled;
  if(req.query.messageId) handled = await handleNexmoReceipt(req.query)
  if(handled) res.sendStatus(200)
  else { 
    res.sendStatus(500)
    console.log("Something went wrong")
  }
}

async function checkPlivoStatuses(req, res){

  try{
    const messages = await mongoose.connection.db.collection("smslogs").find({"response.operator": PLIVO, $or: [{pending: true}, {billed: false}]}).toArray();
    console.log(messages)
    for(msg of messages){
      const id = _.get(msg, 'response.ids[0]');
      if(id) await updateMessageStatusPlivo(id); 
    }
    res.status(200).send({})
  }catch(e){
    console.log(e)
    res.status(500).send({error: e})
 }
}

module.exports = {send, sendSingleMessage, webhook, checkPlivoStatuses, sendSingleMessageWithLog}
