// app/models/udidrequest.js

var mongoose = require('mongoose');

// define the schema for our device model
var udidRequestSchema = mongoose.Schema({
	ip: String,
	udid: {type: String, default: ""},
	pings: [Date]
});

// methods ======================


// create the model for devices and expose it to our app

module.exports = mongoose.model('UdidRequest', udidRequestSchema);
