const objectId = require('bson-objectid'),
  _ = require('lodash');

export function generateId() {
  return objectId().toHexString();
}

export function getFallbackText(textObject, languages) {
  const f = (lang) => `[${lang}]: ${textObject[lang]}`;

  if (languages[0] in textObject && textObject[languages[0]]) return f(languages[0]);
  if ('en' in textObject && textObject.en) return f('en');
  for (let i = 1;i < languages.length;i++) {
    if (languages[i] in textObject && textObject[languages[i]]) return f(languages[i]);
  }
  

  return '';
}