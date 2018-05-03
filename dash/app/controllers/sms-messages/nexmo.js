var https = require('https');
var _ = require('lodash')
var mongoose = require('mongoose')

function send(options){
  return new Promise((resolve, reject) => {

    var smsData = JSON.stringify({
      'api_key': process.env.NEXMO_KEY,
      'api_secret': process.env.NEXMO_SECRET,
      'to': options.contact.phone_number,
      'from': options.sender || 'Feedbackly',
      'text': options.message,
      'client-ref': options.organizationId,
      'callback': process.env.SMS_DELIVERY_RECEIPT_ADDRESS || 'https://dash.feebackly.com',
      'type': options.unicode ? 'unicode' : 'text'
    });

    var request = https.request({
      host: 'rest.nexmo.com',
      path: '/sms/json',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(smsData)
      }
    });

    request.write(smsData);
    request.end();

    var responseData = '';

    request.on('response', res => {
     res.on('data', chunk => {
       responseData += chunk;
     });

     res.on('end', () => {
       var responseJson = responseData !== '' ? JSON.parse(responseData) : {};
       console.log(responseJson)


       if(_.get(responseJson, 'messages[0].status') !== '0') {
         reject();
       } else {

         handleResult(responseJson, options.organizationId, options.message)

         resolve()
       }
     });
    });


  })
}

function handleResult(result, organizationId, message){

  /*
  { 'message-count': '1',
dash_1                  |   messages:
dash_1                  |    [ { to: '358505511581',
dash_1                  |        'message-id': '0B0000004E6B5A15',
dash_1                  |        'client-ref': '572305be196d36ea003d0100',
dash_1                  |        status: '0',
dash_1                  |        'remaining-balance': '79.09220000',
dash_1                  |        'message-price': '0.06610000',
dash_1                  |        network: '24405' } ] }

*/

  result.messages.forEach(msg => {
    var smsbilling = {
      type: 'NEXMO',
      sms_id: msg['message-id'],
      charge: parseFloat(msg['message-price']),
      currency: 'EUR',
      to_number: msg.to,
      message: message,
      status: msg.status,
      billed: false,
      organization_id: mongoose.Types.ObjectId(organizationId),
      sent_at: new Date()
    }

    mongoose.connection.db.collection('smsbillings').insert(smsbilling).then(success => console.log(success))

  })


}

module.exports = { send }
