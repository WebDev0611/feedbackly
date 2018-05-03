import * as initialStates from './initialStates';
import _ from 'lodash';
import { getClientTranslation } from '../utils/translate';

import { missingTranslations } from '../modules/selectors';
import Toaster from '../utils/Toaster';

function questionToState(question) {
  const attr = {};
  switch (question.question_type) {
    case 'Text':
      attr.placeholder = question.placeholder || {};
  }
  return {
    ...attr,
    questionId: question._id,
    displayProbability: question.displayProbability,
    choices: question.choices || [],
    type: question.question_type,
    has_feedback: question.has_feedback,
    heading: question.heading || {},
    subtitle: question.subtitle || {},
    opts: question.opts || {},
    placeholder: question.placeholder || {}
  }
}

function propsToState(survey) {
  const props = survey.properties || {};
  return {
    redirect_url: (props.redirect_url || '').replace(/^https?:\/\//, ''),
    redirectHttps: !(props.redirect_url || '').match(/^http:/),
    custom_privacy_policy: props.custom_privacy_policy || '',
    end_screen_text: props.end_screen_text || {},
    next_button: props.next_button || {},
    return_text: props.return_text || {},
    question_timeout: props.question_timeout,
    final_screen_timeout: props.final_screen_timeout,
  };
}
function stateToProps(state) {
  const props = state.properties;
  return {
    redirect_url: props.redirect_url
      ? (props.redirectHttps ? 'https://' : 'http://') + props.redirect_url
      : '',
    custom_privacy_policy: props.custom_privacy_policy || '',
    end_screen_text: props.end_screen_text || {},
    next_button: props.next_button || {},
    return_text: props.return_text || {},
    question_timeout: props.question_timeout,
    final_screen_timeout: props.final_screen_timeout,
    logic: state.logic,
  };
}

function stateToQuestions(q) {
  return {
    _id: q.questionId,
    displayProbability: q.displayProbability,
    question_type: q.type,
    heading: q.heading,
    subtitle: q.subtitle,
    opts: q.opts,
    choices: (q.choices || []).map(c => ({
      id: c.id,
      text: c.text,
      url: c.url,
      type: c.type,
      subtype: c.subtype
    })),
    placeholder: q.placeholder || {},
  }
}

export function surveyToState(survey, rights) {
  const logic = _.get(survey, 'properties.logic') || {};
  const newSurvey = {
    languages: survey.languages.length ? survey.languages : ['en'],
    logic,
    properties: propsToState(survey),
    questions: survey.question_ids.map(questionToState),
    ui: _.merge({}, initialStates.ui, { activeLanguage: survey.languages[0] }),
    user: rights
  };

  if (!('end_screen_text' in newSurvey.properties) || _.isEmpty(newSurvey.properties.end_screen_text)  ) {
    newSurvey.properties.end_screen_text = {};
    _.forEach(newSurvey.languages, (lang) => {
      newSurvey.properties.end_screen_text[lang] = getClientTranslation(lang, 'end_screen_text');
    });
  }

  return newSurvey;
}

export function stateToSurvey(state) {
  const missing = _.keys(missingTranslations(state).languages);
  if (missing.length > 0 && !_.find(missing, state.languages[0])) {
    Toaster().danger('Some texts are missing');
    return { error: true, id:'MISSING_TEXTS' };
  }
  else if (missing.length > 0) {
    Toaster().danger('Some translations are missing');
    return { error: true, id:'MISSING_TRANSLATIONS' };
  }

  const survey = {
    languages: state.languages,
    properties: stateToProps(state),
    question_ids: state.questions.map(stateToQuestions),
  };
  return survey;
}
