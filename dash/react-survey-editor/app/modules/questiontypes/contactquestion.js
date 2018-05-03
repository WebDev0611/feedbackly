import update from 'immutability-helper';
import _ from 'lodash';
import { generateId } from '../../utils';
const INITITAL_STATE = () => ({
  type: 'Contact',
  choices: [ ],
});

function reducer(state = INITITAL_STATE(), action) {
  if (!action) return state;
  switch (action.type) {
  default:
    return state;
  }
}


export function addTextQuestion(questionId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_CHOICE',
      questionId,
      id: generateId(),
      extra: { type: 'string' },
    })
  }

}


export function addPhoneQuestion(questionId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_CHOICE',
      questionId,
      id: generateId(),
      extra: { type: 'string', subtype: "tel" },
    })
  }

}

export function addEmailQuestion(questionId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_CHOICE',
      questionId,
      id: generateId(),
      extra: { type: 'string', subtype: "email" },
    })
  }

}
export function addBooleanQuestion(questionId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_CHOICE',
      questionId,
      id: generateId(),
      extra: { type: 'boolean' },
    })
  }
}
export default {
  reducer,
  question_type: 'Contact',
  actions: { addTextQuestion, addBooleanQuestion, addEmailQuestion, addPhoneQuestion },
  action_types: [],
}
