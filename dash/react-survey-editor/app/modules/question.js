import update from 'immutability-helper';
import _ from 'lodash';
import immutable from 'object-path-immutable';
import { generateId } from '../utils';

const CHANGE_TITLE = 'CHANGE_TITLE';
const CHANGE_SUBTITLE = 'CHANGE_SUBTITLE';
const MOVE_CHOICE = 'MOVE_CHOICE';
const REMOVE_CHOICE = 'REMOVE_CHOICE';
const CHANGE_CHOICE = 'CHANGE_CHOICE';
const ADD_CHOICE = 'ADD_CHOICE';
const SET_OPT = 'SET_OPT';
const SET_PROBABILITY = 'SET_PROBABILITY';
const WORD_CHOICE = 'WORD_CHOICE';

export default function reducer(state, action) {
  let index;
  let targetIndex;
  let extra;
  let newChoice;

  switch (action.type) {
    case CHANGE_TITLE:
      return update(state, {
        heading: {
          [action.language]: {
            $set: action.text,
          },
        },
      });
    case CHANGE_SUBTITLE:
      return update(state, {
        subtitle: {
          [action.language]: {
            $set: action.text,
          },
        },
      });
    case MOVE_CHOICE:
      index = _.findIndex(state.choices, { id: action.dragId });
      targetIndex = _.findIndex(state.choices, { id: action.targetId });
      return {
        ...state,
        choices: update(state.choices, {
          $splice: [[index, 1], [targetIndex, 0, state.choices[index]]],
        }),
      };
    case CHANGE_CHOICE:
      index = _.findIndex(state.choices, { id: action.id });
      return {
        ...state,
        choices: update(state.choices, {
          [index]: {
            text: {
              [action.language]: {
                $set: (action.text || '').toUpperCase(),
              },
            },
          },
        }),
      };
    case ADD_CHOICE:
      extra = action.extra || {};
      newChoice = { id: action.id, text: {}, ...extra };
      if ('index' in action) {
        return {
          ...state,
          choices: update(state.choices, { $splice: [[action.index, 0, newChoice]] }),
        };
      }
      return {
        ...state,
        choices: state.choices.concat([newChoice]),
      };
    case REMOVE_CHOICE:
      index = _.findIndex(state.choices, { id: action.id });
      return {
        ...state,
        choices: update(state.choices, {
          $splice: [[index, 1]],
        }),
      };
    case SET_OPT:
      return immutable.set(state, `opts.${action.name}`, action.value);
    case SET_PROBABILITY: {
      return update(state, {
        displayProbability: {
          $set: action.probability,
        },
      });
    }
    default:
      return state;
  }
}
/* ------- Action-creators Territory ------- */
export function setProbability(questionId, language, probability) {
  return {
    type: SET_PROBABILITY,
    questionId,
    language,
    probability,
  };
}
export function changeSubtitle(questionId, language, text) {
  return {
    type: CHANGE_SUBTITLE,
    questionId,
    language,
    text,
  };
}
export function changeTitle(questionId, language, text) {
  return {
    type: CHANGE_TITLE,
    questionId,
    language,
    text,
  };
}
export function changeChoice(questionId, id, language, text) {
  return {
    type: CHANGE_CHOICE,
    questionId,
    id,
    language,
    text,
  };
}

export function moveChoice(questionId, dragId, targetId) {
  return {
    type: MOVE_CHOICE,
    questionId,
    dragId,
    targetId,
  };
}
export function removeChoice(questionId, id) {
  return {
    type: REMOVE_CHOICE,
    questionId,
    id,
  };
}

export function addChoice(questionId, extra) {
  return {
    type: ADD_CHOICE,
    questionId,
    id: generateId(),
    extra,
  };
}
export function setOpt(questionId, name, value) {
  return {
    type: SET_OPT,
    questionId,
    name,
    value,
  };
}
