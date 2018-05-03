// app/models/deviceping.js

var mongoose = require('mongoose');

// define the schema for our device model
var devicePingSchema = mongoose.Schema({
    device_id: mongoose.Schema.Types.ObjectId,
    day_start_in_unix: {type: Number, index: true},
    pings: Array
});

// methods ======================


// create the model for devices and expose it to our app

module.exports = mongoose.model('Deviceping', devicePingSchema);

