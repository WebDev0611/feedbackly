/*  ?msisdn=66837000111&to=12150000025
  &network-code=52099&messageId=000000FFFB0356D2
  &price=0.02000000&status=delivered
  &scts=1208121359&err-code=0&message-timestamp=2012-08-12+13%3A59%3A37 */

var mongoose = require('mongoose');

var smsDeliveryReceiptSchema = mongoose.Schema({
  msisdn: Number,
  to: String,
  network_code: String,
  messageId: String,
  price: String,
  status: String,
  scts: Number,
  err_code: Number,
  message_timestamp: String,
  client_ref: String,
  billed: {type: Boolean, default: false}
})



  module.exports = mongoose.model('SmsDeliveryReceipt', smsDeliveryReceiptSchema);
