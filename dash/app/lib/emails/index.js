var ejs = require('ejs');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var helper = require('sendgrid').mail;

function renderWithBaseTemplate(content) {
  var baseTemplatePath = path.join(__dirname, 'templates', 'feedbackly-template.ejs');

  return fs.readFileAsync(baseTemplatePath, { encoding: 'utf-8' })
    .then(baseContent => {
      return ejs.compile(baseContent, { cache: true, filename: baseTemplatePath })({ content, dashUrl: process.env.DASH_URL });
    });
}

function renderTemplate(options) {
  options = _.defaults(options, { extendBaseTemplate: true, templateData: {} });

  var templatePromise;

  if(options.template !== undefined) {
    templatePromise = new Promise((resolve, reject) => resolve(options.template));
  } else if(options.templatePath !== undefined) {
    templatePromise = fs.readFileAsync(options.templatePath, { encoding: 'utf-8'})
      .then(content => {
        return ejs.compile(content, { cache: true, filename: options.templatePath })(options.templateData);
      });
  } else {
    templatePromise = new Promise((resolve, reject) => resolve(''));
  }

  if(options.extendBaseTemplate === true) {
    return templatePromise
      .then(content => renderWithBaseTemplate(content));
  } else {
    return templatePromise;
  }
}

function send(options) {
    var email = new helper.Mail()
    email.setFrom(new helper.Email(options.sender || "noreply@feedbackly.com>", "Feedbackly"));
    email.setSubject(options.subject);
    var content = new helper.Content("text/html", options.template);
    email.addContent(content)
    personalization = new helper.Personalization()
    personalization.addTo(new helper.Email(options.receiver));
    email.addPersonalization(personalization)
    var requestBody = email.toJSON()
    var emptyRequest = require('sendgrid-rest').request
    var requestPost = JSON.parse(JSON.stringify(emptyRequest))
    requestPost.method = 'POST'
    requestPost.path = '/v3/mail/send'
    requestPost.body = requestBody

    return new Promise((resolve, reject) => {
      sendgrid.API(requestPost, function (error, response) {
        if(!error) resolve()
        else reject(error)
      })
    });
}

function sendEmail(options) {
  return renderTemplate(options)
    .then(template => send(_.assign({}, options, { template })));
}

module.exports = { sendEmail };
