import update from 'immutability-helper';
import _ from 'lodash';
import { generateId } from '../../utils';
import { getClientTranslation } from '../../utils/translate';

function reducer(state, action) {
  if (!action) return state;
  switch (action.type) {
    default:
      return state;
  }
}

function create(languages) {
  const texts = {};
  ['terrible', 'bad', 'ok', 'good', 'amazing'].forEach((k) => {
    if (!(k in texts)) texts[k] = {};
    languages.forEach((l) => {
      texts[k][l] = getClientTranslation(l, `buttons.${k}`);
    });
  });
  return {
    type: 'Button',
    choices: [
      { id: '0', text: texts.terrible },
      { id: '1', text: texts.bad },
      { id: '2', text: texts.ok },
      { id: '3', text: texts.good },
      { id: '4', text: texts.amazing },
    ],
  };
}

export function setButtonCount(questionId, count) {
  return (dispatch, getState) => {
    const state = getState();
    const q = _.find(state.questions, { questionId });
    if (q.choices.length === count) return;
    if (count === 5) {
      dispatch({
        type: 'ADD_CHOICE',
        questionId,
        id: '2',
        index: 2,
      });
    } else {
      dispatch({
        type: 'REMOVE_CHOICE',
        questionId,
        id: q.choices[2].id,
      });
    }
  };
}

export default {
  reducer,
  create,
  question_type: 'Button',
  actions: { setButtonCount },
  action_types: [],
};
