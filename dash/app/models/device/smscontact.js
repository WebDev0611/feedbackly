'use strict';

var mongoose = require('mongoose');
var enc = require('../../lib/encryption');
var MiniId = require('../../lib/mini-id');
var _ = require('lodash');
var Promise = require('bluebird');

var smsContactSchema = mongoose.Schema({
    device_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Device' },
    fname: { type: String },
    lname: { type: String },
    phone_number: { type: String, required: true, minlength: 5 },
    is_new: { type: Boolean, default: true },
    shortid: String,
    meta: Object
});
smsContactSchema.index({device_id: 1, phone_number: 1}, {unique: true});

smsContactSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['fname', 'lname', 'phone_number']);
}

smsContactSchema.pre('save', async function(next) {
  if(this.isNew) {
    this.fname = enc.encrypt(this.fname || '');
    this.lname = enc.encrypt(this.lname || '');
    this.phone_number = enc.encrypt(this.phone_number);
  }

  if(this.meta){
    if(!this.contact_id_seed){
      var Device = mongoose.connection.db.collection('devices')
      var device = await Device.findOne({_id: this.device_id})
      this.contact_id_seed = (device.contact_id_seed || 0) + 1;
    }
    this.shortid = MiniId.generate(this.contact_id_seed)
    if(device) await Device.update({_id: this.device_id}, {$inc: {contact_id_seed: 1}})
  }

  next();
});

smsContactSchema.methods.toJSON = function() {
  var contact = this.toObject();

  contact.fname = enc.decrypt(contact.fname || '');
  contact.lname = enc.decrypt(contact.lname || '');
  contact.phone_number = enc.decrypt(contact.phone_number);

  return contact;
}

module.exports = mongoose.model('SmsContact', smsContactSchema);
