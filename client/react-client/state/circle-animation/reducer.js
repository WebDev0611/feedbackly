import { createReducer } from 'redux-create-reducer';

import { SHOW_CIRCLE_ANIMATION, HIDE_CIRCLE_ANIMATION } from './actions';

const initialState = {
  show: false
}

const reducer = createReducer(initialState, {
  [SHOW_CIRCLE_ANIMATION](state, action) {
    const { x, y, color } = action;

    return Object.assign({}, state, { x, y, color, show: true });
  },
  [HIDE_CIRCLE_ANIMATION](state, action) {
    return Object.assign({}, state, { show: false });
  }
});

export default reducer;
