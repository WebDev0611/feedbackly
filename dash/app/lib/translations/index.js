var fs = require('fs');
var Promise = require('bluebird');
var Gettext = require('node-gettext');
var path = require('path');
var languageConstants = require('../constants/language.js');

function getTranslations(language) {
  language = (language || '').toLowerCase();

  if(languageConstants.SUPPORTED_TRANSLATIONS.indexOf(language) < 0) {
    language = languageConstants.DEFAULT_TRANSLATION;
  }

  var gt = new Gettext();

  var translationPromise;

  if(language !== languageConstants.DEFAULT_TRANSLATION) {
    var translationFile = path.join(__dirname, '../../../po', `${language}.po`);

    translationPromise = new Promise((resolve, reject) => {
      fs.readFile(translationFile, (error, file) => {
        gt.addTextdomain(language, file);
        gt.textdomain(language);

        resolve(gt);
      });
    });
  } else {
    translationPromise = new Promise((resolve, reject) => {
      gt.textdomain(language);

      resolve(gt);
    });
  }

  return translationPromise;
}

module.exports = { getTranslations };
