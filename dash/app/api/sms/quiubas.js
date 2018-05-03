const request = require('request')
const mongoose = require("mongoose");
const createSmsTransaction = require('./create-sms-transaction').createSmsTransaction


async function sendQuiubas(props, isUnicode){

  console.log('sending quiubas')  

  const options = {
    to_number: props.number,
    message: props.message,
    encode: isUnicode ? 1 : 0
  }

  if(options.to_number.indexOf('+') === -1) options.to_number = "+" + options.to_number

  const result = await new Promise((resolve, reject) => request.post({
    uri: `https://${process.env.QUIUBAS_API_KEY}:${process.env.QUIUBAS_API_PRIVATE}@rest.quiubas.com/1.0/sms`,
    body: options,
    json: true
  }, (error, response, body) => {
    if(error) reject(error)
    else if (body.error && body.error.message) reject(body.error.message)
    else resolve(body)
  }))

  //const result = await new Promise((resolve) => quiubas.sms.send(options, result => resolve(result)))
  console.log(result)
  return {result, ids: [result.id], operator: "QUIUBAS"}
}


async function updateMessageStatus(messageId){

  const result = await new Promise((resolve, reject) => request.get({
    json: true,
    uri: `https://${process.env.QUIUBAS_API_KEY}:${process.env.QUIUBAS_API_PRIVATE}@rest.quiubas.com/1.0/sms/${messageId}`
  }, (error, response, body) => {
    if(error) reject(error)
    else if (body.error && body.error.message) reject(body.error.message)
    else resolve(body)
  }))

  console.log(result)

  const {status, charge, error } = result;

  const message = await mongoose.connection.db.collection('smslogs').findOne({"response.ids": messageId});
  let billed = message.billed || false;
  let billedId = undefined;
  let billedIds = message.billedIds || []
  
  if(billedIds.indexOf(messageId) === -1){
    if(parseFloat(charge) > 0) await createSmsTransaction({charge: parseFloat(charge), messageId, organization_id: message.payload.organizationId, currency: "MXN"})
    billed = true;
    billedId = messageId
  }
  
  let pending = true;
  if([2].indexOf(status) > -1) pending = false; // need more status codes

  const modifier = {$set: {...result, billed, pending}}
  if(billedId) modifier.$push = {billedIds: billedId }
  await mongoose.connection.db.collection('smslogs').update({"response.ids": messageId}, modifier)
  
}


module.exports = {sendQuiubas, updateMessageStatus}
