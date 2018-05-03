var Nexmo = require('nexmo');
const mongoose = require('mongoose')
const createSmsTransaction = require('./create-sms-transaction').createSmsTransaction

var nexmo = new Nexmo({
   apiKey: process.env.NEXMO_KEY,
   apiSecret: process.env.NEXMO_SECRET,
 }, {debug: true})

function send(props, isUnicode){
  const sender = props.fromName.replace(" ","").substring(0,9) || "Feedbackly"
  const recipient = props.number
  const message = props.message;

  const options = {
    type: isUnicode ? 'unicode' : 'text',
    callback: process.env.SMS_DELIVERY_RECEIPT_ADDRESS
  }

  console.log('Sending via nexmo')
  
  return new Promise((resolve, reject) => {
    nexmo.message.sendSms(sender, recipient, message, options, (err, result) => {
        if (err) return reject(err)
        console.log(result)
        resolve(
         {result, ids: result.messages.map(m => m['message-id']), operator: 'NEXMO'}          
        )
    });    
  })
  
}

async function handleNexmoReceipt(query){
  try{
    const {messageId, status, price} = query;
    const errorCode = query["err-code"];

    const message = await mongoose.connection.db.collection('smslogs').findOne({"response.ids": messageId});
    let billed = message.billed || false;
    let billedIds = message.billedIds || []
    let billedId = undefined;
    if(billedIds.indexOf(messageId) === -1){
      if(parseFloat(price) > 0) await createSmsTransaction({charge: parseFloat(price), messageId, organization_id: message.payload.organizationId})
      billed = true;
      billedId = messageId
    }

    let pending = true;
    if(["failed", "delivered", "expired", "rejected"].indexOf(status) > -1) pending = false;
    const modifier = {$set: {...query, billed, pending}}
    if(billedId) modifier.$push = {billedIds: billedId }
    await mongoose.connection.db.collection('smslogs').update({"response.ids": messageId}, modifier)
    return true

  } catch(e){
    console.log(e);
    return false
  }
}

module.exports = {send, handleNexmoReceipt}