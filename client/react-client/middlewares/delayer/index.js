import { get, delay } from 'lodash';

export const delayer = store => next => (action) => {
  const delayTime = get(action, 'payload.delay');

  if (delayTime !== undefined) {
    delay(() => {
      next(action);
    }, delayTime);
  } else {
    return next(action);
  }
};
