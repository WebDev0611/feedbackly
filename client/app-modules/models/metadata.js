// /models/metadata.js

var mongoose = require('mongoose');

var metaDataSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    organization_id:  mongoose.Schema.Types.ObjectId,
    feedback_id: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Metadata', metaDataSchema);
