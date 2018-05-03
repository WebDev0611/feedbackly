var request = require('request');
var _ = require('lodash')
var mongoose = require('mongoose')
var shortid = require('shortid')
const API_KEY = process.env.CM_TELECOM_API_KEY;
const API_URL = "https://gw.cmtelecom.com/v1.0/message"


/*
{
    "messages": {
        "authentication": {
            "producttoken": "00000000-0000-0000-0000-000000000000"
        },
        "msg": [ {
                "from": "SenderName",
                "to": [{
                    "number": "00447911123456"
                }],
                "body": {
                    "content": "Test message"
                }
            }
        ]
    }
}
*/

function send(options){
  return new Promise((resolve, reject) => {

    var number = options.contact.phone_number;
    if(number.indexOf("00") !== 0 && number.indexOf('+') !== 0){
      number = "00" + number
    }

    var ref = options.organizationId +","+shortid.generate()

    var smsData = JSON.stringify(
      {
          "messages": {
              "authentication": {
                  "producttoken": API_KEY
              },
              "msg": [ {
                      "from": options.sender || 'Feedbackly',
                      "to": [{
                          "number": number
                      }],
                      "body": {
                          "content": options.message
                      },
                      "reference": ref
                  }
              ]
          }
      });

      request({
        url: API_URL,
        method: 'POST',
        body: smsData,
        json:true
      }, (err, status, response) => {
        if(err) {
          console.log('notification handler error:')
          console.log(err);
          reject(err)
        }
        if(status && status.statusCode === 200){
          console.log('notification handle success')
          resolve()
          handleResult(response, options.organizationId, options.message)
        }

      })


  })
}

function handleResult(result, organizationId, message){

  result.messages.forEach(msg => {
    var smsbilling = {
      type: 'CM',
      sms_id: result.messages[0].reference,
      charge: 0.025,
      currency: 'EUR',
      to_number: result.messages[0].to,
      message: message,
      status: result.details,
      billed: false,
      organization_id: mongoose.Types.ObjectId(organizationId),
      sent_at: new Date()
    }

    mongoose.connection.db.collection('smsbillings').insert(smsbilling).then(success => console.log(success))

  })


}


module.exports = { send }
