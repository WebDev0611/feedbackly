import update from 'immutability-helper';
import _ from 'lodash';
import { ui as initialState } from '../store/initialStates';
import { missingTranslations } from './selectors';

const SELECT_QUESTION = 'SELECT_QUESTION';
const FOCUS_INPUT = 'FOCUS_INPUT';
const UNFOCUS_INPUT = 'UNFOCUS_INPUT';
const SELECT_LANGUAGE = 'SELECT_LANGUAGE';
const SELECT_LOGIC = 'SELECT_LOGIC';
const CLEAR = 'CLEAR';
const OPEN_SURVEY_OPTIONS = 'OPEN_SURVEY_OPTIONS';
const CLOSE_SURVEY_OPTIONS = 'CLOSE_SURVEY_OPTIONS';
const OPEN_LANGUAGE_DIALOG = 'OPEN_LANGUAGE_DIALOG';
const CLOSE_LANGUAGE_DIALOG = 'CLOSE_LANGUAGE_DIALOG';
const SHOW_IMAGE_DIALOG = 'SHOW_IMAGE_DIALOG';
const CLOSE_IMAGE_DIALOG = 'CLOSE_IMAGE_DIALOG';

const SAVE = 'SAVE';
const SAVE_SUCCESS = 'SAVE_SUCCESS';
const SAVE_FAIL = 'SAVE_FAIL';

export default function reducer(state = initialState, action = {}) {
  let newState;
  if (!action.type.startsWith('@') && !action.silent) {
    state = {
      ...state,
      modified: true,
    };
  }
  switch (action.type) {
    case SELECT_QUESTION:
      return {
        ...state,
        selectedQuestion: action.questionId,
        selectedLogic: null,
      };
    case FOCUS_INPUT:
      return {
        ...state,
        focusedInput: action.input,
      };
    case UNFOCUS_INPUT:
      if (state.focusedInput === action.input) {
        return {
          ...state,
          focusedInput: '',
        };
      }
      return state;

    case SELECT_LANGUAGE:
      return {
        ...state,
        activeLanguage: action.language,
      };

    case SELECT_LOGIC:
      return {
        ...state,

        selectedLogic: state.selectedLogic !== action.id ? action.id : null,
      };
    case CLEAR:
      newState = { ...state, selectedLogic: null, selectedInput: null, imageDialog: false };
      if (action.level === 'ALL') newState.selectedQuestion = null;
      return newState;

    case OPEN_SURVEY_OPTIONS:
      return {
        ...state,
        propertiesOpen: true,
      };
    case CLOSE_SURVEY_OPTIONS:
      return {
        ...state,
        propertiesOpen: false,
      };

    case OPEN_LANGUAGE_DIALOG:
      return {
        ...state,
        languageDialog: action.language,
      };
    case CLOSE_LANGUAGE_DIALOG:
      return {
        ...state,
        languageDialog: null,
      };
    case SHOW_IMAGE_DIALOG:
      return {
        ...state,
        imageDialog: true,
      };
    case CLOSE_IMAGE_DIALOG:
      return {
        ...state,
        imageDialog: false,
      };

    case SAVE:
      return {
        ...state,
        saving: true,
        modified: false,
      };

    case SAVE_SUCCESS:
      return {
        ...state,
        saving: false,
      };
    case SAVE_FAIL:
      return {
        ...state,
        saving: false,
        modified: true,
      };

    case 'ADD_WORD':
      return {
        ...state,
        focusedInput: action.questionId + action.id,
      };
    case 'ADD_SLIDER':
      return {
        ...state,
        focusedInput: action.questionId + action.id,
      };
    case 'CREATE_QUESTION':
      return {
        ...state,
        selectedQuestion: action.questionId,
        focusedInput: '',
      };
    case 'ADD_LANGUAGE':
      return {
        ...state,
        activeLanguage: action.language,
      };

    default:
      return state;
  }
}

export function selectQuestion(questionId) {
  return {
    type: SELECT_QUESTION,
    questionId,
    silent: true,
  };
}
export function focusInput(input) {
  return {
    type: FOCUS_INPUT,
    input,
    silent: true,
  };
}
export function unfocusInput(input) {
  return {
    type: UNFOCUS_INPUT,
    input,
    silent: true,
  };
}
export function selectLanguage(language) {
  return {
    type: SELECT_LANGUAGE,
    language,
    silent: true,
  };
}

export function selectLogic(optionId) {
  return {
    type: SELECT_LOGIC,
    id: optionId,
    silent: true,
  };
}
export function clear(level) {
  return {
    type: CLEAR,
    level,
    silent: true,
  };
}

export const openProperties = () => ({ type: OPEN_SURVEY_OPTIONS, silent: true });
export const closeProperties = () => ({ type: CLOSE_SURVEY_OPTIONS, silent: true });

export function openLanguageDialog(language) {
  return {
    type: OPEN_LANGUAGE_DIALOG,
    language,
    silent: true,
  };
}
export const closeLanguageDialog = () => ({ type: CLOSE_LANGUAGE_DIALOG, silent: true });
export const showImageDialog = () => ({ type: SHOW_IMAGE_DIALOG, silent: true });
export const closeImageDialog = () => ({ type: CLOSE_IMAGE_DIALOG, silent: true });
export const save = () => ({ type: SAVE, silent: true });
export const saveSuccess = () => ({ type: SAVE_SUCCESS, silent: true });
export const saveFail = () => ({ type: SAVE_FAIL, silent: true });

export function showMissing() {
  return (dispatch, getState) => {
    const state = getState();
    const missing = missingTranslations(state);
    let lang;
    if (state.ui.activeLanguage in missing.languages) {
      lang = state.ui.activeLanguage;
    } else {
      lang = _.findKey(missing.languages);
      dispatch(selectLanguage(lang));
    }

    const ids = _.concat(state.questions.map(q => q.questionId), ['end']);
    const missingId = _.find(ids, id => lang in missing.questions[id]);
    dispatch(selectQuestion(missingId));
  };
}
