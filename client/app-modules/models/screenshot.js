
var mongoose = require('mongoose');

// define the schema for our feedback model
var screenshotSchema = mongoose.Schema({
    udid: {type: String, required: true},
    base64Image: {type: String, required: true},
    created_at: {type: Date, default: Date.now()}
});

// methods ======================


// create the model for feedbacks and expose it to our app

module.exports = mongoose.model('Screenshot', screenshotSchema);
