var translations = {};

function setTranslations(newTranslations) {
  translations = newTranslations;
}

function getTranslation(options) {
  return translations[options.key][options.language] || translations[options.key]['en'];
}

function getTranslations(language) {
  return translations;
}

module.exports = { setTranslations, getTranslations, getTranslation };
