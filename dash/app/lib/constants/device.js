var mirror = require('keymirror');

var constants = {
  deviceTypes: mirror({ EMAIL: null, SMS: null, DEVICE: null, PLUGIN: null, QR: null, LINK: null })
};

module.exports = constants;
