var User = require('../models/user');
var Organization = require('../models/organization');
var Device = require('../models/device');
var jwt = require('jsonwebtoken')
var jwtSecret = process.env.JWT_SECRET;
var ObjectId = require('mongoose').Types.ObjectId;
var shortid = require('shortid');
var segmentConstants = require('../lib/constants/organization').segment;
var sendgrid = require('../lib/sendgrid');
var intercom = require('../lib/intercom');
const Billing = require('../lib/billing')
const paymentConstants = require('../lib/billing/plan-settings').constants

function jwtSign(params, secret, options){
  return new Promise((resolve, reject) => {
    jwt.sign(params, secret, options, token => {
      resolve(token)
    })
  })
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function post(req, res) {
  var email = req.body.email;
  if (!validateEmail(email)) return res.status(400).json({error: 'Invalid e-mail.'})
  try {
    var userAlready = await User.findOne({email: email.toLowerCase()});
    if(userAlready) return res.status(400).json({error: 'User already exists.'})
    var ipadSignupToken = shortid.generate() + shortid.generate();

    var newUser = new User({
      email,
      password: shortid.generate(),
      displayname: email.split('@')[0],
      ipadSignupToken,
      ipad_user: true

    });
    newUser.save()
    var udid = shortid.generate(),
      passcode = Device.generatePasscode();


    var user = await newUser.bootstrap({
      organizationName: 'Ipad Signup Pending - ' + email,
      segment: segmentConstants.SELF_SIGNUP,
      isIpadClient: true,
      udid,
      passcode,
    })

    
    res.send({
      udid,
      passcode
    });
    
    await sendSignupEmail(email, process.env.DASH_URL + '/ipad-signup?token=' + ipadSignupToken);
    if(user.organization_id) await Billing.createSubscription(user.organization_id, paymentConstants.FREE_PLAN)

  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }

}

async function sendSignupEmail(email, signupUrl) {
  return await sendgrid.sendEmail({
    fromEmail: "info@feedbackly.com",
    fromName: "Feedbackly",
    templateId: 'c014022a-49f2-4d71-918c-4880449d898f',

  }, {
    '---signup_url---': signupUrl
  }, [{
    email
  }]);
};

async function signupForm(req, res) {
  try {
    var token = req.query.token;
    var user = await User.findOne({
      ipadSignupToken: token,
      // TODO: date limit?
    });
    res.render('sign-up/ipad-continue-signup.ejs', {
      email: user.email,
      token
    });

  } catch (e) {
    console.log(JSON.stringify(e))
    res.sendStatus(400)
  }
}
async function signupDetails(req, res) {
  try {
    var token = req.body.token;
    var orgName = req.body.organizationName;
    var password = req.body.password;

    if(!orgName || !token || !password) return res.sendStatus(400);
    if(orgName.length < 2 || password.length < 8 || token.length < 8) return res.sendStatus(400);
    console.log('fields are valid')
    var user = await User.findOne({
      ipadSignupToken: token,
    });
    console.log(user);

    if (!user) {
      return res.sendStatus(400);
    }
    user.password = user.generateHash(password);
    user.ipadSignupToken = null;

    await user.save();
    await Organization.update({_id: ObjectId(user.organization_id[0])}, {name: orgName, pending_ipad_signup: false});
    var passCode = (await Device.findOne({organization_id: ObjectId(user.organization_id[0])})).passcode

    var loginToken = await jwtSign(
      { tokenFor: 'loginAsUser',
        userId: user._id,
        organizationId: user.organization_id[0]
      },
      jwtSecret, { expiresIn: 60 * 60 });

    var ICParams = {
      organization: orgName,
      segment: segmentConstants.SELF_SIGNUP,
      ipad_client: true,
      ipad_start_passcode: passCode
    }
    intercom.createUser(user, ICParams);
    res.send({loginToken});
  } catch (e) {
    console.log('fail')
    console.log(e)
    res.sendStatus(400)

  }
}

module.exports = {
  signUp: post,
  signupForm,
  signupDetails
}
