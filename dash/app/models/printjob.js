// app/models/device.js
'use strict';

var mongoose = require('mongoose');

// define the schema for our device model
var pjSchema = mongoose.Schema({
    payload: Object,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    created_at: {type: Date, default: Date.now}
});

// methods ======================


// create the model for devices and expose it to our app

module.exports = mongoose.model('PrintJob', pjSchema);
