import { delay } from 'lodash';
import zepto from 'npm-zepto';

import * as kioskClient from 'utils/kiosk-client';

export const SET_VIEW_RESOLUTION = 'SET_VIEW_RESOLUTION';
export const SET_VIEW_BACKGROUND = 'SET_VIEW_BACKGROUND';
export const ADD_INTERACTION = 'ADD_INTERACTION';
export const SET_NEXT_BUTTON_DISABLED_STATUS = 'SET_NEXT_BUTTON_DISABLED_STATUS';
export const ADD_DECORATOR = 'ADD_DECORATOR';
export const REMOVE_DECORATOR = 'REMOVE_DECORATOR';
export const SET_TEXT_FILL_ENABLED = 'SET_TEXT_FILL_ENABLED';

export function setViewResolution({ isLandscape }) {
  return {
    type: SET_VIEW_RESOLUTION,
    isLandscape
  }
}

export function addDecorator(decorator) {
  return {
    type: ADD_DECORATOR,
    decorator
  }
}

export function removeDecorator(decorator) {
  return {
    type: REMOVE_DECORATOR,
    decorator
  }
}

export function setTextFillEnabled(enabled){
  return {
    type: SET_TEXT_FILL_ENABLED,
    enabled
  }
}

export function setViewBackground(color) {
  return {
    type: SET_VIEW_BACKGROUND,
    color
  }
}

export function setNextButtonDisabledStatus(status) {
  return {
    type: SET_NEXT_BUTTON_DISABLED_STATUS,
    status
  }
}

export function scrollToTopWithDelay(delayTime) {
  return dispatch => delay(() => dispatch(scrollToTop()), delayTime);
}

export function scrollToTop() {
  return () => {
    zepto(window).scrollTop(0);
    zepto("#root").scrollTop(0);
  }
}

export function addInteraction() {
  return (dispatch, getState) => {
    const { view } = getState();

    const now = Math.floor(+(new Date()) / 1000);

    if(now - view.latestInteraction >= 60 * 5) {
      kioskClient.postMessage({ action: 'interaction' });
    }

    dispatch(setInteraction());
  }
}

export function setInteraction() {
  return {
    type: ADD_INTERACTION,
    latestInteraction: Math.floor(+(new Date()) / 1000)
  }
}
