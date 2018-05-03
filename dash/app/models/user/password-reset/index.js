var Promise = require('bluebird');
var _  = require('lodash');
var jwt = require('jsonwebtoken');
var path = require('path');
var emails = require('../../../lib/emails');

function send(options) {
  return generateToken(options)
    .then(token => {
      return emails.sendEmail({
        templatePath: path.join(__dirname, 'templates', 'template.ejs'),
        templateData: { resetUrl: `${process.env.DASH_URL}/v-app/#/login/reset-password/${token}` },
        receiver: options.receiver,
        subject: 'Your Feedbackly account password reset link'
      });
    });
}

function generateToken(options) {
  return new Promise((resolve, reject) => {
    var jwtSecret = process.env.JWT_SECRET;

    var payload = {
      tokenFor: 'passwordReset',
      userId: options.userId
    };

    var tokenOptions = {
      expiresIn: 60 * 60 * 24
    };

    jwt.sign(payload, jwtSecret, tokenOptions, function(token) {
      resolve(token);
    });
  });
}

module.exports = { send };
