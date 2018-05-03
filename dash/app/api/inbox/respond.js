const helper = require('sendgrid').mail
const sms = require('../sms')
const smsGetBalance = require('../sms/top-up')._getBalance
const Organization = require('../../models/organization')

const FEATURES = require('../../lib/constants/features')

async function sendSMS(params){

  const {number, message, user, organization_id} = params
  
  try{
    const balance = await smsGetBalance(organization_id);
    if(balance.balance < 0.1) return "NO_BALANCE";
    const organization = await Organization.findById(organization_id);
    const rights = await organization.getFeatures();
    if(rights.availableFeatures.indexOf(FEATURES.SMS_MESSAGES) === -1) return 401
    await sms.sendSingleMessageWithLog({number, message, fromName: organization.name }, {user_id: user._id})
  }catch(e){
    console.log(e)
    return 500;
  } 
  return 200;

  // process -- > see if user has enough credits.

  // send and charge from users standing account
}

async function sendEmail(params){
  const {address, message, subject, user, organization_id} = params;

  var mail = new helper.Mail();  
  var email = new helper.Email("noreply@feedbackly.com", user.displayname)
  mail.setFrom(email)
  mail.setSubject(subject);
  var content = new helper.Content('text/plain', message);
  mail.addContent(content)
  var personalization = new helper.Personalization();
  personalization.addTo(new helper.Email(address))
  mail.addPersonalization(personalization);
  

  var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });
   
  return new Promise((resolve, reject) => {
    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
        reject(error)
      } else resolve(200)
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  })



  // send plaintext email from sendgrid, reply-to being users email address
}

module.exports = { sendSMS, sendEmail }