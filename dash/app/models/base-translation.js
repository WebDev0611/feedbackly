var mongoose = require('mongoose');

var baseTranslationSchema = mongoose.Schema({
  language: {type: String, required: true},
  organization_id: {type: mongoose.Schema.Types.ObjectId, required: true},
  translations: Object,
  admin_translation: Boolean
});

module.exports = mongoose.model('Basetranslation', baseTranslationSchema);
