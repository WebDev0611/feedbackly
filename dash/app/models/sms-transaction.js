const mongoose = require('mongoose');

const schema = mongoose.Schema({
  organization_id: {type: mongoose.SchemaTypes.ObjectId},
  created_at: {type: Date, default: Date.now},
  created_by: mongoose.SchemaTypes.ObjectId,
  charge: {type: Number, required: true},
  currency: {type: String, default: "EUR"},
  details: {
    transactionType: String,
    meta: Object
  }
})



module.exports = mongoose.model('SmsTransaction', schema);
