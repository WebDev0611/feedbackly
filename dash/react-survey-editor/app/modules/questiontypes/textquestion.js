import update from 'immutability-helper';
import _ from 'lodash';

const SET_PLACEHOLDER = 'SET_PLACEHOLDER';

const INITITAL_STATE = {
  type: 'Text',
  placeholder: {

  },
};


function reducer(state = INITITAL_STATE, action) {
  if (!action) return state;
  switch (action.type) {
  case (SET_PLACEHOLDER):
    return update(state, { placeholder: { [action.language]: { $set: action.text } } });
  default:
    return state;
  }
}

export function setPlaceholder(questionId, language, text) {
  return {
    type: SET_PLACEHOLDER,
    questionId,
    language,
    text,
  }
}


export default {
  reducer,
  question_type: 'Text',
  actions: { setPlaceholder },
  action_types: [SET_PLACEHOLDER],
}
