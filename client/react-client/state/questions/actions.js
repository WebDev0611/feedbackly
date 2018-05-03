import { startAndsetTimerToQuestionTimeout } from 'state/timer';

export const WORD_SELECTED = 'WORD_SELECTED';
export function interactWithQuestion(question) {
  return (dispatch, getState) => {
    const { timer } = getState();

    if (timer.interval !== null) {
      dispatch(startAndsetTimerToQuestionTimeout());
    }
  };
}

export function wordSelected(id) {
  return {
    type: WORD_SELECTED,
    id,
  };
}
