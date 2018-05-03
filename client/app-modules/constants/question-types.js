var mirror = require('keymirror');

var questionTypes = mirror({ Button: null, Image: null, Contact: null, Text: null, Slider: null, NPS: null, Word: null, Upsell: null })

module.exports = questionTypes;
