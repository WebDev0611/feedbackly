// app/models/deviceping.js
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

// define the schema for our device model
var TempSignupSchema = mongoose.Schema({
    email: String,
    password: String,
    token: String,
    details: Object,
    created_at: {type: Date, default: Date.now},
    stage: {type: String, default: "Not finished"}
});

// methods ======================



module.exports = mongoose.model('Tempsignup', TempSignupSchema);
