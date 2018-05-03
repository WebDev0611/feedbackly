var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;
var emailTemplate = '541433c3-ef06-4633-97fc-0ca5469730a1';
var mailer = require('../../lib/sendgrid');
var DASH_URL = process.env.DASH_URL;
var Tempsignup = require('../../models/tempsignup');
var User = require('../../models/user');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var Device = require('../../models/device');
var intercom = require('../../lib/intercom');
var cache = require('../../lib/cache');
var planTypes = require('../../lib/constants/payment-plan').planTypes;
var destroyOrganization = require('../../models/organization/destroy');
var _ = require('lodash');
var cors = require('cors');
const subdomains = ['www', 'se', 'mx', 'dk', 'fi'];


/* ///////


This file is deprecated.


///// */

module.exports = function (app) {
  app.post('/api/sign-up--', cors(), (req, res) => {
    if (!validateReqBody(req.body.email, req.body.name, req.body.organization)) return res.sendStatus(400);

    var token = jwt.sign(
      {
        email: req.body.email,
        name: req.body.name,
        organization: req.body.organization
      },
      jwtSecret,
      { expiresIn: '3h' }
    );

    var emailData = {
      fromEmail: 'noreply@feedbackly.com',
      fromName: 'Feedbackly',
      subject: 'Please verify your Feedbackly account',
      templateId: emailTemplate
    };

    var substitutions = {
      '{{link}}': `${DASH_URL}/sign-up/verify-email?token=${token}`
    };

    var addresses = [{ email: req.body.email, name: '' }];

    Tempsignup.update({ token }, { $set: { email: req.body.email, token } }, { upsert: true }).exec();

    mailer.sendEmail(emailData, substitutions, addresses).then(() => res.send({ ok: 'true' })).catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
  });

  app.get('/sign-up/verify-email', (req, res) => {
    jwt.verify(req.query.token, jwtSecret, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt expired') {
          // resend email ?
          res.send("Token expired. Please retry registering <a href='https://www.feedbackly.com/sign-up'>here</a>");
        }
        if (err.message === 'invalid token') res.send('invalid token');
        else res.send('error');
      } else {
        User.findOne({ email: decoded.email }).then(user => {
          if (user) res.send('E-mail already exists.');
          else {
            Tempsignup.update(
              { token: req.query.token },
              {
                $set: {
                  email: decoded.email,
                  name: decoded.name,
                  organization: decoded.organization,
                  token: req.query.token
                }
              },
              { upsert: true }
            ).exec();

            res.render('sign-up/continue-signup.ejs', {
              email: decoded.email,
              name: decoded.name,
              organization: decoded.organization,
              token: req.query.token,
              stripePublicKey: process.env.STRIPE_PUBLIC_KEY
            });
          }
        });
      }
    });
  });

  app.post('/api/sign-up-form', (req, res) => {
    var tempbody = req.body;
    tempbody.password = bcrypt.hashSync(tempbody.password, bcrypt.genSaltSync(8), null);
    var details = req.body.details;
    var tsId = Date.now() + shortid.generate();
    var isIpadClient = !!req.query.ipad;

    Tempsignup.update({ token: req.body.token }, { $set: tempbody }, { upsert: true })
      .then(() => {
        if (req.body.stage === 'finished') {
          var organizationAttr = {
            use_case: details.use_case,
            name: details.organization_name,
            billing_country: details.country,
            billing_tax_id: details.vat_id,
            plan: details.plan,
            stripeToken: details.stripeToken // stripeToken
          };
          var userAttr = {
            password: req.body.password,
            email: req.body.email,
            phone: details.phone,
            displayname: details.displayname
          };
          return createUser(userAttr, organizationAttr, isIpadClient, tsId).then(loginToken => {
            res.json(loginToken); // handle iPad stufffff
          });
        } else res.sendStatus(200);
      })
      .catch(err => {
        // should delete everything
        cache.get(tsId).then(orgid => destroyOrganization(orgid.id));
        if (_.get(err, 'errors.email.message') === 'Email already exists')
          res.status(400).json({ err: 'email exists' });
        else res.sendStatus(500);
      });
  });
};

function jwtSign(params, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(params, secret, options, token => {
      resolve(token);
    });
  });
}

function validateReqBody(email, name, organization) {
  const regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regEmail.test(email) && name.length > 2 && organization.length > 2;
}

function createUser(userAttr, organizationAttr, isIpadClient, tsId) {
  var newUser = new User(userAttr);
  var udid = shortid.generate(),
    passcode = Device.generatePasscode(); // if needed
  return newUser
    .bootstrap({
      organizationName: organizationAttr.name,
      use_case: organizationAttr.use_case,
      isIpadClient,
      udid,
      passcode
    })
    .then(() => cache.set(tsId, JSON.stringify({ id: newUser.organization_id[0] })))
    .then(() =>
      jwtSign({ tokenFor: 'loginAsUser', userId: newUser._id, organizationId: newUser.organization_id[0] }, jwtSecret, {
        expiresIn: 60 * 60
      })
    )
    .then(loginToken => {
      var ICParams = { organization: organizationAttr.name, use_case: organizationAttr.use_case };
      if (isIpadClient) {
        ICParams.ipad_client = true;
        ICParams.ipad_start_passcode = passcode;
      }
      intercom.createUser(newUser, ICParams);

      var ipadSettings = isIpadClient ? { udid, passcode } : undefined;

      return { loginToken, ipadSettings };
    });
}
