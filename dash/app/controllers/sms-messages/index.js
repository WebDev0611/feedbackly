const MXN_CURRENCY_RATIO = parseFloat(process.env.MXN_CURRENCY_RATIO);
const SMS_MARGIN = parseFloat(process.env.SMS_MARGIN); // euros

var _ = require('lodash');
var Promise = require('bluebird');
var https = require('https');

var paymentConstants = require('../../lib/constants/payment-plan');
var Device = require('../../models/device');
var Survey = require('../../models/survey');

var SmsContact = require('../../models/device/smscontact');
var SmsCounter = require('../../models/organization/smscounter');

var nexmo = require('./nexmo.js')
var quiubas = require('./quiubas.js')
var MiniId = require('../../lib/mini-id');
var mongoose = require('mongoose');

async function getOrCreateMiniIdLink (surveyId, device){
  try{
    let surveyMiniId = _.get((await mongoose.connection.db.collection('survey-mini-ids').findOne({survey_id: surveyId, device_id: device })), 'mini_id')
    if(!surveyMiniId){
      let seed = ((await mongoose.connection.db.collection('survey-mini-id-seed').findOne({})) || {seed: 0}).seed++;
      surveyMiniId = MiniId.generate(seed)
      await mongoose.connection.db.collection('survey-mini-id-seed').update({}, {$inc: {seed: 1}}, {upsert:true})
      await mongoose.connection.db.collection('survey-mini-ids').update({survey_id: surveyId, device_id: device }, {$set: {mini_id: surveyMiniId}}, {upsert: true})
    }

  var link = smsLinkCreate(surveyMiniId)
  }catch(e){
    console.error(e)
  }
  return link;
}

function smsLinkCreate(miniId){
  const host = process.env.SMS_TINY_LINK_HOST;
  return `${host}/${miniId}`
}

function createLink(message, link, contact){

  var sendLink = link;
  if(contact && contact.shortid){
    sendLink+= "/"+contact.shortid
  }

  if(message.indexOf('(link)') > -1){
    var messageWithLink = message.replace('(link)', sendLink);
  } else var messageWithLink = message + " " + sendLink;
  return messageWithLink
}

async function sendSurveyAsSms(smsSettings, options){
  var organizationId = options.hasApiKey === true
    ? smsSettings.organizationId
    : options.organization_id;

  var isTest = smsSettings.isTest;
  var message = smsSettings.textBody;
  var promises = [];

  for(device of smsSettings.devices){
    const link = await getOrCreateMiniIdLink(device);

    if(isTest) {
      if(smsSettings.phoneNumber === undefined) {
        return {error: 'Phone number undefined'};
      }

        promises.push(sendSmsMessage({
            contact: { phone_number: smsSettings.phoneNumber },
            sender: smsSettings.fromName,
            organizationId,
            message: message,
            link,
            isSingle: true,
            unicode: smsSettings.unicode
          }))

    } else {
        promises.push(sendToSmsChannel({
          channelId: device,
          organizationId,
          sender: smsSettings.fromName,
          message: message,
          link,
          unicode: smsSettings.unicode
        }))
    }
  }

  return Promise.all(promises)
}

function sendToSmsChannel(options) {
  var organizationId = options.organizationId;
  var channelId = options.channelId;
  var sender = options.sender;

  var stream = SmsContact.find({ device_id: channelId }).stream();

  return new Promise((resolve, reject) => {
    var sentCount = 0;

    var status = {
      failed: []
    };

    stream.on('data', contact => {
      var toObject = contact.toJSON();

      stream.pause();

      setTimeout(() => {

        sendSmsMessage({ contact: toObject, message: options.message, organizationId, sender, unicode: options.unicode, link: options.link })
          .then(contact => {
            sentCount++;
            stream.resume()// throttle 500 ms
          })
          .catch(contact => {
            if(contact && contact.phone_number) {
              status.failed.push(contact);
            }

            stream.resume() // throttle 500 ms
          });

      }, 50) // throttle


    });

    stream.on('error', () => {
      SmsCounter.increase(organizationId, sentCount)
        .then(() => reject(status))
        .catch(err => reject());
    });

    stream.on('end', () => {
      SmsCounter.increase(organizationId, sentCount)
        .then(() => resolve(status))
        .catch(err => reject());
    });
  });
}

function sendProduction(options) {
    if(_.get(options.contact, 'phone_number') == undefined || _.isString(options.message) === false) {
      return Promise.reject();
    }

    var p;
  /*  if(options.contact.phone_number.indexOf('52') === 0) options.contact.phone_number = "+" + options.contact.phone_number
    if(options.contact.phone_number.indexOf('+52') === 0) p = quiubas.send(options)
    else  */ p = nexmo.send(options)

    return p;
}

function sendDevelopment(options) {
  return new Promise((resolve, reject) => {
    if(_.get(options.contact, 'phone_number') !== undefined && _.isString(options.message)) {
      console.log(`Sending SMS message "${options.message}" to ${options.contact.phone_number} from ${options.sender}`);
      resolve(options.contact);
    } else {
      reject(options.contact);
    }
  });
}

function sendSmsMessage(options) {
  var promise;

  options.message = createLink(options.message, options.link, options.isSingle ? null : options.contact)

  if(process.env.NODE_ENV === 'production') {
    promise = sendProduction(options);
  } else {
    promise = sendDevelopment(options);
  }

  return promise
    .then(() => {
      if(options.isSingle === true) {
        return SmsCounter.increase(options.organizationId, 1);
      } else {
        return promise;
      }
    });
}


module.exports = { sendSurveyAsSms, getOrCreateMiniIdLink };
