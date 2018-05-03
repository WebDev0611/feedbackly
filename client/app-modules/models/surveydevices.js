var mongoose = require('mongoose');

// used to record what survey has feedback from what devices
// (used in rights control)

var surveyDevicesSchema = mongoose.Schema({
    device_id: {type: mongoose.Schema.Types.ObjectId, index: true},
    survey_id: {type: mongoose.Schema.Types.ObjectId, index: true}
})



  module.exports = mongoose.model('Surveydevice', surveyDevicesSchema);
