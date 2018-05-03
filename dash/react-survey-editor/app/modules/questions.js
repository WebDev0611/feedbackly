import update from 'immutability-helper';
import _ from 'lodash';
import questionTypes from './questiontypes/';
import questionReducer from './question';
import { generateId } from '../utils';

const CREATE_QUESTION = 'CREATE_QUESTION';
const MOVE_QUESTIONS = 'MOVE_QUESTIONS';
const DELETE_QUESTION = 'DELETE_QUESTION';

const INITITAL_STATE = [];

function initializeQuestion(action) {
  const q = _.find(questionTypes, { question_type: action.questionType });
  const obj = 'create' in q ? q.create(action.languages) : q.reducer();
  return _.merge(
    {},
    {
      questionId: action.questionId,
      heading: {},
      subtitle: {},
      displayProbability: 1,
    },
    obj,
  );
}

function questionTypeReducer(state, action) {
  _.each(questionTypes, (v) => {
    if (v.action_types.includes(action.type)) {
      state = v.reducer(state, action);
    }
  });
  return questionReducer(state, action);
}

export default function reducer(state = INITITAL_STATE, action = {}) {
  if (action.questionId && action.type !== CREATE_QUESTION) {
    const index = _.findIndex(state, { questionId: action.questionId });
    if (index >= 0) {
      state = update(state, {
        $splice: [[index, 1, questionTypeReducer(state[index], action)]],
      });
    }
  }
  let q;
  let questionIndex;
  switch (action.type) {
    case CREATE_QUESTION:
      q = initializeQuestion(action);
      return state.concat([q]);
    case MOVE_QUESTIONS:
      return action.order.map(id => _.find(state, { questionId: id }));
    case DELETE_QUESTION:
      questionIndex = _.findIndex(state, { questionId: action.questionId });
      return update(state, {
        $splice: [[questionIndex, 1]],
      });

    default:
      return state;
  }
}

export function createQuestion(questionType, languages) {
  return {
    type: CREATE_QUESTION,
    languages,
    questionType,
    questionId: generateId(),
  };
}

export function moveQuestions(order) {
  return {
    type: MOVE_QUESTIONS,
    order,
  };
}

export function deleteQuestion(questionId, targetIndex) {
  return {
    type: DELETE_QUESTION,
    questionId,
  };
}
