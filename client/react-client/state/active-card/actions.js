import findIndex from 'lodash/findIndex';
import get from 'lodash/get';

import {
  startAndsetTimerToQuestionTimeout,
  startAndsetTimerToEndTimeout,
  stopTimer,
  setTimerValue,
} from '../timer';
import { clearFbeventData } from '../fbevents';
import * as kioskClient from '../../utils/kiosk-client';
import { getLogicKey } from '../../utils/logic-keys';
import { setViewBackground, scrollToTopWithDelay } from '../view';
import { hidePrivacyPolicy } from '../privacy-policy';
import { setLanguage } from '../language';
import { TRANSITION_DELAY } from '../../constants/cards';
import { showIpadSignup } from '../ipad-signup';

export const SHOW_QUESTION_BY_ID = 'SHOW_QUESTION_BY_ID';
export const SHOW_NEXT_QUESTION = 'SHOW_NEXT_QUESTION';
export const SHOW_END = 'SHOW_END';
export const SET_TRANSITIONING_STATUS = 'SET_TRANSITIONING_STATUS';
export const SHOW_CARD_AT_INDEX = 'SHOW_CARD_AT_INDEX';

export function showCardAtIndex(index, payload = {}) {
  return {
    type: SHOW_CARD_AT_INDEX,
    index,
    payload,
  };
}

export function showCardAtIndexWithDelay(index) {
  return dispatch => dispatch(showCardAtIndex(index, { delay: TRANSITION_DELAY }));
}

export function showEnd(payload = {}) {
  return (dispatch, getState) => {
    const { activeCard } = getState();

    dispatch(showCardAtIndex(activeCard.cards.length - 1, payload));
    dispatch(startAndsetTimerToEndTimeout());
    dispatch(setViewBackground(undefined));

    const message = { action: 'surveyFinished' };

    kioskClient.postMessage(message);
  };
}

export function showEndWithDelay() {
  return dispatch => dispatch(showEnd({ delay: TRANSITION_DELAY }));
}
export function getNextCardIndex(cards, cardIndex) {
  const nextCardWithMaxProbability = cards
    .map((card, index) => {
      if (card.displayProbability === undefined) return index;
      if (card.displayProbability >= Math.random()) return index;
    })
    .filter(index => index !== undefined && index >= cardIndex);
  let nextCardIndex = nextCardWithMaxProbability ? nextCardWithMaxProbability[0] : cards.length - 1;
  if (cardIndex === 0 && cards.length > 1 && cards.length - 1 === nextCardIndex) {
    nextCardIndex = cards.length - 2;
    return nextCardIndex;
  }
  return nextCardIndex;
}
export function goBackToBeginning() {
  return (dispatch, getState) => {
    const { defaultLanguage, activeCard } = getState();

    dispatch(stopTimer());
    dispatch(setTimerValue(0));
    dispatch(clearFbeventData());
    dispatch(setLanguage(defaultLanguage));
    dispatch(showCardAtIndex(getNextCardIndex(activeCard.cards, 0)));
    dispatch(setViewBackground(undefined));
    dispatch(hidePrivacyPolicy());
    dispatch(showIpadSignup());
  };
}

export function setTransitioningStatus(status) {
  return {
    type: SET_TRANSITIONING_STATUS,
    status,
  };
}

export function showQuestionById(questionId, payload = {}) {
  return (dispatch, getState) => {
    const { activeCard } = getState();

    const questionIndex =
      findIndex(
        activeCard.cards,
        card => card.question_type !== undefined && card._id === questionId,
      ) || 0;

    return dispatch(showCardAtIndex(questionIndex), payload);
  };
}

export function showNextCard(data) {
  return (dispatch, getState) => {
    const state = getState();
    const { survey, activeCard } = state;

    if (activeCard.activeIndex === activeCard.cards.length - 1) {
      return;
    }

    dispatch(scrollToTopWithDelay(TRANSITION_DELAY));
    dispatch(hidePrivacyPolicy());
    dispatch(startAndsetTimerToQuestionTimeout());

    const currentCard = activeCard.cards[activeCard.activeIndex];
    const currentCardIsQuestion = currentCard.question_type !== undefined;

    if (currentCardIsQuestion) {
      const logic = get(survey, `properties.logic.${currentCard._id}`) || {};

      const logicKey = getLogicKey(currentCard, data);

      if (logicKey !== undefined && logic[logicKey] === 'end') dispatch(showEndWithDelay());

      const hasLogic =
        logicKey !== undefined &&
        logic[logicKey] !== undefined &&
        logic[logicKey] !== 'next' &&
        logic[logicKey] !== '';

      dispatch(setViewBackground(undefined));

      let nextCardIndex = hasLogic
        ? findIndex(
          activeCard.cards,
          card => card.question_type !== undefined && card._id === logic[logicKey],
        ) || activeCard.activeIndex + 1
        : activeCard.activeIndex + 1;

      nextCardIndex = getNextCardIndex(activeCard.cards, nextCardIndex);
      const nextCard = activeCard.cards[nextCardIndex];
      if (nextCard.end) dispatch(showEndWithDelay());
      dispatch(showCardAtIndexWithDelay(nextCardIndex));
    }

    dispatch(showCardAtIndexWithDelay(activeCard.activeIndex + 1));
  };
}
