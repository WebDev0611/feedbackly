const mongoose = require('mongoose')
const plivo = require('plivo');
const createSmsTransaction = require('./create-sms-transaction').createSmsTransaction

const AUTH_ID = process.env.PLIVO_AUTH_ID;
const TOKEN = process.env.PLIVO_AUTH_TOKEN;
var p = plivo.RestAPI({
  authId: AUTH_ID,
  authToken: TOKEN
});


async function sendPlivo(props){

var params = {
    'src': '358442244420', // Sender's phone number with country code
    'dst' : props.number,
    'text' : props.message
};

const [status, response] = await new Promise((resolve, reject) => {

  // if(process.env.DOCKER_ENV == 'production'){
     console.log('sending sms via Plivo to ' + params.dst)
     p.send_message(params, function (status, response) {
      resolve([status, response]);
    });
 /* } else {
    console.log(`TEST: would send ${params.text} to ${params.dst}`)
    resolve([202, {response: 202, ids: [""+Date.now()]}])
  } */
})

  const resp = {status, ids: response.message_uuid, operator: 'PLIVO'}

  return resp
}

async function updateMessageStatus(record_id){
  const response = await new Promise((resolve, reject) => p.get_message({record_id}, (status, response) => {
    const {message_state, total_amount, total_rate, units} = response;
    resolve({message_state, total_amount, total_rate, units})
  }))

  const message = await mongoose.connection.db.collection('smslogs').findOne({"response.ids": record_id});
  let billed = message.billed || false;
  let billedId = undefined;  
  if(billed == false && response.total_amount) {
    if(parseFloat(response.total_amount) > 0) await createSmsTransaction({charge: parseFloat(response.total_amount), messageId: message._id, organization_id: message.payload.organizationId})
    billed = true;
    billedId = record_id
  }
  
  let pending = true;
  if(["failed", "delivered", "undelivered", "rejected", "sent"].indexOf(response.message_state) > -1) pending = false;
  const modifier = {$set: {...response, billed, pending}}
  if(billedId) modifier.$push = {billedIds: billedId }
  await mongoose.connection.db.collection('smslogs').update({"response.ids": record_id}, modifier)
  
}



module.exports = {sendPlivo, updateMessageStatus}
