import _ from 'lodash';
import update from 'immutability-helper';
import immutable from 'object-path-immutable';

const SET_LOGIC = 'SET_LOGIC';
const DELETED_QUESTION_POINTER_IN_LOGIC = 'DELETED_QUESTION_POINTER_IN_LOGIC'



export default function(state = {}, action, questions) {
  switch (action.type) {
  case SET_LOGIC:
    if(action.value === null) {
      return immutable.del(state,`${action.questionId}.${action.optionId}`);
    } else return _.merge({}, state, {
      [action.questionId]: {
        [action.optionId] : action.value,
      },
    }
    );
    
  case DELETED_QUESTION_POINTER_IN_LOGIC:
    const modifiedState = { ...state }
    _.forEach(modifiedState, (val, key) => {
      _.forEach(val, (nestedVal, nestedKey) => {
        if (nestedVal === action.questionId) delete val[nestedKey]
      })
    })
    return modifiedState

  case 'MOVE_QUESTIONS': {
    return _.mapValues(state,
        (l, id) => {
          let index = action.order.indexOf(id);
          return _.pickBy(l, q => {
            let oIndex = action.order.indexOf(q);
            return oIndex === -1 || oIndex > index;
          });
        }
      );
  }

  default:
    return state;
  }

}


export function setLogic(questionId, optionId, value) {
  return {
    type: SET_LOGIC,
    questionId,
    optionId,
    value,
  }

}

export function deleteQuestionPointerInLogic(questionId){
  return {
    type: DELETED_QUESTION_POINTER_IN_LOGIC,
    questionId
  }
}
