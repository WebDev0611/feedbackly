var q = require('q');
var _  = require('lodash');
var jwt = require('jsonwebtoken');
var emails = require('../../../lib/emails');
var path = require('path');

function send(options) {
  return generateToken(options)
    .then(token => {
      return emails.sendEmail({
        templatePath: path.join(__dirname, 'templates', 'template.ejs'),
        templateData: { confirmUrl: `${process.env.DASH_URL}/api/users/confirm_email/${token}` },
        receiver: options.receiver,
        subject: 'Your Feedbackly account email address confirmation link'
      });
    });
}

function generateToken(options) {
  var deferred = q.defer();

  var jwtSecret = process.env.JWT_SECRET;

  var payload = {
    tokenFor: 'emailConfirmation',
    userId: options.userId
  };

  var tokenOptions = {
    expiresIn: 60 * 60 * 24
  };

  jwt.sign(payload, jwtSecret, tokenOptions, function(token) {
    deferred.resolve(token);
  });

  return deferred.promise;
}

module.exports = { send };
