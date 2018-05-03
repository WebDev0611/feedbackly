import _ from 'lodash';
import update from 'immutability-helper';
import { moveQuestions } from './questions';


const PENDING_QUESTION_MOVE = 'PENDING_QUESTION_MOVE';
const PENDING_QUESTION_MOVE_REMOVE = 'PENDING_QUESTION_MOVE_REMOVE';
const PENDING_QUESTION_MOVE_CONFIRM = 'PENDING_QUESTION_MOVE_CONFIRM';
const PENDING_QUESTION_MOVE_CONFIRMED = 'PENDING_QUESTION_MOVE_CONFIRMED';


export default function (state, action) {
  let order, index, targetIndex;
  switch (action.type) {
  case (PENDING_QUESTION_MOVE):
    order = state.ui.pendingQuestionOrder  || state.questions.map(q => q.questionId);
    index = order.indexOf(action.move.id);
    targetIndex = order.indexOf(action.move.to);
    order = update(order, {
      $splice: [
          [index, 1],
          [targetIndex, 0, order[index]],
      ],
    });
    return {
      ...state,
      ui: {
        ...(state.ui),
        pendingQuestionOrder: order,
        pendingQuestionMoveConfirm: false,
      },
    }
  case (PENDING_QUESTION_MOVE_REMOVE):
    return {
      ...state,
      ui: {
        ...(state.ui),
        pendingQuestionOrder: null,
        pendingQuestionMoveConfirm: false,
      },
    }
  case (PENDING_QUESTION_MOVE_CONFIRM):
    return {
      ...state,
      ui: {
        ...(state.ui),
        pendingQuestionMoveConfirm: true,
      },
    }
  default:
    return state;
  }
}

export function pendingQuestionMove(id, to) {
  return {
    type: PENDING_QUESTION_MOVE,
    move: { id, to },
    silent: true
  }
}

export function removePendingQuestionMove() {
  return {
    type: PENDING_QUESTION_MOVE_REMOVE,
    silent: true
  }
}


export function pendingQuestionMoveDrop() {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.ui.pendingQuestionOrder) return;
    let order = state.ui.pendingQuestionOrder;
    let conflict = _.reduce(state.logic,
      (result, obj, qId) => {
        let index = order.indexOf(qId);
        return result || _.reduce(obj, (result2, logic) => {
          let oIndex = order.indexOf(logic);
          if (index > oIndex && oIndex >= 0) console.log(`Conflict between ${qId} -> ${logic}`);
          return result2 || (index > oIndex && oIndex >= 0);
        }, false)
      }, false);
    if (conflict)
      dispatch({
        type: PENDING_QUESTION_MOVE_CONFIRM,
        silent : true
      })
    else {
      dispatch(removePendingQuestionMove());
      dispatch(moveQuestions(state.ui.pendingQuestionOrder));
    }

  }
}

export function pendingQuestionMoveConfirmed() {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(moveQuestions(state.ui.pendingQuestionOrder));

    dispatch(removePendingQuestionMove());
  }
}
