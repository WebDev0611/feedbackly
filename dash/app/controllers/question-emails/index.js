var q = require('q');
var _ = require('lodash');
var Promise = require('bluebird');
var translations = require('../../lib/translations');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var clientLink = require('../../lib/client-link');

var surveyTemplates = require('./survey-templates')
var mailCreator = require('./mail-creator');
var Mailinglistaddress = require('../../models/device/mailinglistaddress');
// req.body.textBody = emailSettingstextBody.replace(/\r?\n/g, '<br />')

var Device = require('../../models/device');
var ObjectId = require('mongoose').Types.ObjectId;

function sendSurveyAsEmail(emailSettings, listIds){
  emailSettings = Object.assign({ },emailSettings, {textBody: emailSettings.textBody.replace(/\r?\n/g, '<br/>')})
  var isTest = emailSettings.isTest === true ? true : false;
  var options = _.assign({ mailingListIds: listIds }, emailSettings);
  var usersEmail = options.testEmail;
  
  const emailBody = async (listId)=>{
    const device = await Device.findOne({_id: ObjectId(listId)});
    options.logo = device.logo || emailSettings.organizationLogoUrl || ''
    var link = clientLink.createLink({ surveyId: emailSettings.surveyId, deviceId: listId });
    if(isTest) return await postToEmail(usersEmail, _.assign({}, options, { linkToSurvey: link }))
    else return await postToMailingList(_.assign({mailingListId: listId}, options, { linkToSurvey: link }))
  }
  _.forEach(listIds, listId => {
    emailBody(listId)
  })

}


function sendFromGrid(toSend){
  var requestBody = toSend
  var emptyRequest = require('sendgrid-rest').request
  var requestPost = JSON.parse(JSON.stringify(emptyRequest))

  requestPost.method = 'POST'
  requestPost.path = '/v3/mail/send'
  requestPost.body = requestBody

  return sendgrid.API(requestPost);
}

function getDefaults(options) {
  return _.assign({ allowUnsubscribe: false, textBody: undefined, logo: "" }, options);
}

function postToEmail(targetEmail, options) {
  var data = getDefaults(options);

  return surveyTemplates.getQuestionData(data)
    .then(substitutions => {
      var jsonMail = mailCreator.createMail(data, substitutions, [{email: targetEmail, fname: '', lname: ''}])
      return sendFromGrid(jsonMail);
    })
}

function postToMailingList(options){

  var data = getDefaults(options);
  var query = { mailinglist_id: options.mailingListId, unsubscribed: false };

  return surveyTemplates.getQuestionData(data)
  .then(substitutions => {
    return Mailinglistaddress.count(query)
    .then(count => {
      return Math.floor(count/1000);
    })
    .then(pages => {
      var promises = [];
      for(var i = 0; i <= pages; i++){
        var p = Mailinglistaddress.find(query).skip(i*1000).limit(1000)
        promises.push(p);
      }
      return promises;
    })
    .each(addresses => {
      var jsonMail = mailCreator.createMail(data, substitutions, addresses);
      return sendFromGrid(jsonMail);
    });
  });
}

module.exports = { sendSurveyAsEmail };
