import { get, delay } from 'lodash';

import { setTransitioningStatus, SHOW_CARD_AT_INDEX } from 'state/active-card';
import { ADD_FBEVENT } from 'state/fbevents';
import { TRANSITION_TIME } from 'constants/cards';

export const transitionLock = store => next => action => {
  const { activeCard } = store.getState();

  if(get(action, 'payload.skipTransitionLock') === true) {
    return next(action);
  }

  if(SHOW_CARD_AT_INDEX === action.type && activeCard.transitioning === false) {
    store.dispatch(setTransitioningStatus(true));

    const time = TRANSITION_TIME + get(action, 'payload.delay') === undefined ? 0 : get(action, 'payload.delay');

    next(action);

    delay(() => {
      store.dispatch(setTransitioningStatus(false));
    }, time);

  } else if([SHOW_CARD_AT_INDEX, ADD_FBEVENT].indexOf(action.type) < 0 || activeCard.transitioning === false) {
    return next(action)
  }
}
