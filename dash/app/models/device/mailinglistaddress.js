'use strict';

var mongoose = require('mongoose');

var enc = require('../../lib/encryption');
var _ = require('lodash');
var Promise = require('bluebird');

var mailingListAddressSchema = mongoose.Schema({
    mailinglist_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Device' },
    fname: { type: String },
    lname: { type: String },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /.+@.+/.test(value)
      }
    },
    is_new: { type: Boolean, default: true },
    unsubscribed: { type: Boolean, default: false },
    shortid: String,
    meta: Object,
    contact_id_seed: Number
});
mailingListAddressSchema.index({mailinglist_id: 1, email: 1}, {unique: true});

mailingListAddressSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['fname', 'lname', 'email']);
}

mailingListAddressSchema.pre('save', function(next) {

  if(this.isNew) {
    this.fname = enc.encrypt(this.fname || '');
    this.lname = enc.encrypt(this.lname || '');
    this.email = enc.encrypt(this.email);
  }

  next();
});

mailingListAddressSchema.methods.toJSON = function() {
  var address = this.toObject();

  address.fname = enc.decrypt(address.fname || '');
  address.lname = enc.decrypt(address.lname || '');
  address.email = enc.decrypt(address.email);

  return address;
}

module.exports = mongoose.model('MailinglistAddress', mailingListAddressSchema);
