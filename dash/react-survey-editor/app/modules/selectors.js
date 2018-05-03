import _ from 'lodash';
import memoize from 'memoizee';




function __missingTranslations(questions, properties, languages) {
  let missingLanguages = {};
  let missingQuestions = {};
  const addMissing = (id, lang) => missingLanguages[lang] = missingQuestions[id][lang] = true;

  _.forEach(questions, (question) => {
    missingQuestions[question.questionId] = {};
    let missing = missingTranslationsInQuestion(question, languages);
    _.forEach(missing, (v, lang) => addMissing(question.questionId, lang));
  })

  missingQuestions['end'] = {};
  _.forEach(missingTranslationsInQuestion(properties, languages), (v, lang) => addMissing('end', lang));
  return { languages: missingLanguages, questions: missingQuestions };
}
const _missingTranslations = memoize(__missingTranslations, { max: 20 });


function _missingTranslationsInQuestion(question, languages) {

  let missing = {};
  if ('end_screen_text' in question) {
    _.forEach(languages, (lang) => question.end_screen_text[lang] || (missing[lang] = true));
  } else {
    _.forEach(languages, (lang) => {
      if (!question.heading[lang]) missing[lang] = true;
      if (question.type === 'Button') return;

      //TODO: This issue should be handled separately
      if (['Word', 'Image', 'Slider', 'Contact'].includes(question.type) && question.choices.length === 0) missing[lang] = true;

      (question.choices || []).forEach(o => {
        if ('text' in o && !o.text[lang]) missing[lang] = true;
      })
    });
  }
  return missing;
}
const missingTranslationsInQuestion = memoize(_missingTranslationsInQuestion, { max: 20 });

export function missingTranslations(state) {
  return _missingTranslations(state.questions, state.properties, state.languages);
}
