import { createReducer } from 'redux-create-reducer';

import {
  SET_TIMER_VALUE,
  DECREASE_TIMER_VALUE,
  SET_TIMER_INTERVAL,
} from './actions';

const initialState = {
  value: 0,
  isDrained: false,
  interval: null
}

const reducer = createReducer(initialState, {
  [SET_TIMER_VALUE](state, action) {
    return Object.assign({}, state, { value: action.value, isDrained: false });
  },
  [DECREASE_TIMER_VALUE](state, action) {
    let oldValue = state.value;
    let value = Math.max(oldValue - (action.amount || 1), 0);
    let isDrained = value === 0;

    return Object.assign({}, state, { value, isDrained });
  },
  [SET_TIMER_INTERVAL](state, action) {
    return Object.assign({}, state, { interval: action.interval });
  },
});

export default reducer;
