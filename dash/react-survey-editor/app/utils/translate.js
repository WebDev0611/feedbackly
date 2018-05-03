import _ from 'lodash';
import clientTranslations from '../../translations/translations.yml';

let translate;
export function setTranslate(t) {
  translate = t;
}
export default function(str) {
  if (translate) return translate(str);
  return str;
}


export function getClientTranslation(language, key) {
  return _.get(clientTranslations,`${key}.${language}`) || '';
}
