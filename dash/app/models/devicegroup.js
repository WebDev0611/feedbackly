// app/models/device.js
'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

// define the schema for our device model
var deviceGroupSchema = mongoose.Schema({
    name: { type: String, required: true, minlength: 1 },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: String, // deprecate soon
    is_base_devicegroup: { type: Boolean, required: true, default: false }, // deprecate soon
    is_all_channels_group: { type: Boolean, required: true, default: false },
    devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
    devicegroups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Devicegroup'}]
});

deviceGroupSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['name']);
}

module.exports = mongoose.model('Devicegroup', deviceGroupSchema);
