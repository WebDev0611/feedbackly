var mongoose = require('mongoose');

var userSchema = require('./schema');
var User = require('./')

require('./methods')(userSchema);

module.exports = mongoose.model('User', userSchema);
