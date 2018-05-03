var quiubas = require('quiubas');
var mongoose = require('mongoose');
var _ = require('lodash')
quiubas.setAuth( process.env.QUIUBAS_API_KEY, process.env.QUIUBAS_API_PRIVATE );


function send(options){
  return new Promise((resolve, reject) => {

      quiubas.sms.send(
       {
         to_number: options.contact.phone_number,
         message: options.message,
         test_mode: true
       },
       function(result) {
         console.log( 'RESULT:', result );
         handleResult(result, options.organizationId)
         resolve()
       },
       function(error) {
      	console.log('ERROR:', error);
        reject(error)
        }
     );

  })
}

function handleResult(result, organizationId){
  var id = _.get(result, 'sms_id')
  if(id){
    mongoose.connection.db.collection('smsbillings').insert(
      {
         type: 'QUIUBAS',
         sms_id: id,
         charge: result.charge,
         currency: result.currency,
         to_number: result.to_number,
         message: result.message,
         billed: false,
         status: result.status,
         organization_id: mongoose.Types.ObjectId(organizationId),
         sent_at: new Date()
      }
    )
    .then(success => console.log(success))
  }
}

module.exports = { send }
