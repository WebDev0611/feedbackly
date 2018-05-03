import { get } from 'lodash';

import { QUESTION_TIMEOUT, END_TIMEOUT } from 'constants/surveys';

export const SET_TIMER_VALUE = 'SET_TIMER_VALUE';
export const DECREASE_TIMER_VALUE = 'DECREASE_TIMER_VALUE';
export const SET_TIMER_INTERVAL= 'START_TIMER';

export function startTimer() {
  return (dispatch, getState) => {
    const state = getState();

    if(state.timer.interval === null) {
      let interval = setInterval(() => {
        dispatch(decreaseTimer())
      }, 1000);

      dispatch(setTimerInterval(interval))
    }
  }
}

export function stopTimer() {
  return (dispatch, getState) => {
    const state = getState();

    let interval = state.timer.interval;

    if(interval !== null) {
      clearInterval(interval);

      dispatch(setTimerInterval(null));
    }
  }
}

export function startAndSetTimer(value) {
  return dispatch => {
    dispatch(setTimerValue(value));
    dispatch(startTimer());
  }
}

export function decreaseTimer() {
  return {
    type: DECREASE_TIMER_VALUE
  }
}

export function setTimerValue(value) {
  return {
    type: SET_TIMER_VALUE,
    value
  }
}

export function startAndsetTimerToQuestionTimeout() {
  return (dispatch, getState) => {
    const { survey } = getState();
    const questionTimeout = get(survey, 'properties.question_timeout') || QUESTION_TIMEOUT;
    dispatch(startAndSetTimer(questionTimeout));
  }
}

export function startAndsetTimerToEndTimeout() {
  return (dispatch, getState) => {
    const { survey } = getState();
    const endTimeout = get(survey, 'properties.final_screen_timeout') || END_TIMEOUT;

    dispatch(startAndSetTimer(endTimeout));
  }
}

export function setTimerInterval(interval) {
  return {
    type: SET_TIMER_INTERVAL,
    interval
  }
}
