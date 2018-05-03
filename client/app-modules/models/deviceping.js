// app/models/deviceping.js

var mongoose = require('mongoose');
var moment = require('moment');

// define the schema for our device model
var devicePingSchema = mongoose.Schema({
    device_id: {type: mongoose.Schema.Types.ObjectId, index: true},
    day_start_in_unix: {type: Number, index: true, default: moment.utc().startOf('day').unix()},
    pings: Array
});

// methods ======================


// create the model for devices and expose it to our app

module.exports = mongoose.model('Deviceping', devicePingSchema);
