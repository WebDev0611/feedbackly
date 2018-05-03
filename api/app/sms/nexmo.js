var request = require('request-promise');
var _ = require('lodash')
async function send(options){
  var smsData = {
    'api_key': process.env.NEXMO_KEY,
    'api_secret': process.env.NEXMO_SECRET,
    'to': options.number,
    'from': options.sender || 'Feedbackly',
    'text': options.message,
    'client-ref': options.organizationId,
    'callback': process.env.SMS_DELIVERY_RECEIPT_ADDRESS || 'https://dash.feebackly.com',
    'type': options.unicode ? 'unicode' : 'text'
  };

  var options = {
    method: 'POST',
    uri: 'https://rest.nexmo.com/sms/json',
    body: smsData,
    json: true
  };

  var result = await request(options);
  console.log(result)
  if(_.get(result, 'messages[0].status') !== '0'){
    return {error: _.get(result, 'messages[0].error-text')}
  }

  // check result

  return {success: true}

}

module.exports = {send}
