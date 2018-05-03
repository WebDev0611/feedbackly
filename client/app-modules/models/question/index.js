// app/models/question.js
'use strict';
var mongoose = require('mongoose');

var translationSchema = mongoose.Schema({
    subtitle: { type: String },
    language: {type: String, required: true},
    heading: {type: String, required: true},
    data: { type: mongoose.Schema.Types.Mixed }
});

var questionSchema = mongoose.Schema({
    question_type     : {type: String, required: true},
    organization_id : {type: mongoose.Schema.Types.ObjectId, required: true},
    created_by: {type: mongoose.Schema.Types.ObjectId, required: true},
    createdAt: {type: Date, default: Date.now()},
    default_language: {type: String, required: true},
    translations: {type: [translationSchema]},
    opts: Object,
    displayProbability: Number,
    choices: Array,
}, {minimize: false});


module.exports = mongoose.model('Question', questionSchema);
