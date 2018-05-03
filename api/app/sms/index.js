// Sms

var mongoose= require('mongoose')
var _ = require('lodash')
const nexmo = require('./nexmo')

async function send(req, res) {
  try{
    var result = await nexmo.send(req.body)
    if(result.success) return res.sendStatus(200).json({success: true})
    else return res.sendStatus(400).json({error: 'error'})
  } catch(e){
    console.log(e)
    return res.sendStatus(500).json({error: 'error'})
  }

}



async function deliveryReceipt(req, res){
  var data = {}
  _.forEach(_.keys(req.query), key => {
    data[key.split("-").join("_")] = req.query[key];
  })

  try{
    await mongoose.connection.db.collection('sms_api_delivery_receipts').insert(data);
  } catch(e){
    console.error(e);
    return res.sendStatus(500)
  }
  return res.sendStatus(200)
}


module.exports = {send, deliveryReceipt}
