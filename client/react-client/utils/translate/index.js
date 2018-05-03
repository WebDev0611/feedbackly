import { get } from 'lodash';
import translations from '../../translations/translations.yml';


let getTranslationsFromSurvey = null;

export function setGetTranslations(_getTranslationsFromSurvey) {
  getTranslationsFromSurvey = _getTranslationsFromSurvey;
}

export function getTranslation({ key, language }) {
  const found = get(translations, `${key}.${language}`);
  return found ? found : get(translations, `${key}.en`);
}

export function getNextTranslation(language) {
  return getTranslation({ key: 'next', language });
}

export function getSubmitTranslation(language) {
  return getTranslation({ key: 'next', language });
}

export function getLanguageTranslation(language) {
  return getTranslation({ key: 'language', language });
}

export function getTimerReturningTranslation(language) {
    return getTranslation({ key: 'returnText', language }).split("_")[0];
}

export function getTimerSecondsTranslation(language) {
  var t = getTranslation({ key: 'returnText', language }).split("_");
  return t.length < 2 ? '' : t[1];
}

export function getEndTranslation(language) {
  var t = getTranslationsFromSurvey();
  var found = get(t,`end_screen_text.${language}`);
  return found || get(t,`end_screen_text.en`) || 'Thank you.';
}

export function getPrivacyPolicyTranslation(language) {
  return getTranslation({ key: 'privacyPolicy', language });
}

export function getSliderHelperTranslation(language) {
  return getTranslation({ key: 'sliderHelper', language });
}
