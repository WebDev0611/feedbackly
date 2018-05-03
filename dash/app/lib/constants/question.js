var mirror = require('keymirror');

var constants = {
  questionTypes: mirror({ Image: null, Slider: null, Word: null, Text: null, Contact: null, Button: null, NPS: null, Upsell: null })
}

module.exports = constants;
