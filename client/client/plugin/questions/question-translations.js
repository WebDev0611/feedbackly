var utils = require('../utils/common');

function questionTranslations(params, state, render) {
  var translations = params.translations;

  function setTranslation(language) {
    var newTranslation = utils.find(translations, { language });

    state.translation = newTranslation || translations[0];
  }

  function getTranslation() {
    return state.translation;
  }

  return {
    setTranslation,
    getTranslation
  }
}

module.exports = questionTranslations;
