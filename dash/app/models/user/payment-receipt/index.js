var Promise = require('bluebird');
var _  = require('lodash');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var helper = require('sendgrid').mail;

function send(options) {

  var email = new helper.Mail()
  email.setFrom(new helper.Email("noreply@feedbackly.com>", "Feedbackly"));
  email.setSubject("Payment receipt to Feedbackly");
  var content = new helper.Content("text/html", "Payment receipt");
  email.addContent(content)
  personalization = new helper.Personalization()
  personalization.addTo(new helper.Email(options.user.email));

  email.setTemplateId('3538c518-865c-48e4-945e-fea34819b83b')

  personalization.addSubstitution(new helper.Substitution('{{cardOwner}}', options.cardOwner || ''));
  personalization.addSubstitution(new helper.Substitution('{{payerAddress}}', options.payerAddress || ''));
  personalization.addSubstitution(new helper.Substitution('{{payerCity}}', options.payerCity || ''));
  personalization.addSubstitution(new helper.Substitution('{{payerPostal}}', options.payerPostal || ''));
  personalization.addSubstitution(new helper.Substitution('{{payerCountry}}', options.payerCountry || ''));
  personalization.addSubstitution(new helper.Substitution('{{payerTaxId}}', options.payerTaxId || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeDate}}', options.chargeDate || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeDescription}}', options.chargeDescription || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeSubtotal}}', options.chargeSubtotal || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeTotal}}', options.chargeTotal || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeTaxPercent}}', options.chargeTaxPercent || ''));
  personalization.addSubstitution(new helper.Substitution('{{chargeId}}', options.chargeId || ''));

  email.addPersonalization(personalization)

  var requestBody = email.toJSON()
  var emptyRequest = require('sendgrid-rest').request
  var requestPost = JSON.parse(JSON.stringify(emptyRequest))
  requestPost.method = 'POST'
  requestPost.path = '/v3/mail/send'
  requestPost.body = requestBody

  return new Promise((resolve, reject) => {
    sendgrid.API(requestPost, function (error, response) {
      console.log(response)
      if(!error) resolve()
      else reject(error)
    })
  });
}

module.exports = { send };
