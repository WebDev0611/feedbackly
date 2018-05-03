import { createReducer } from 'redux-create-reducer';

import { SHOW_LANGUAGE_MENU, HIDE_LANGUAGE_MENU, TOGGLE_LANGUAGE_MENU } from './actions';

const initialState = {
  isOpen: false
}

const reducer = createReducer(initialState, {
  [SHOW_LANGUAGE_MENU](state, action) {
    return Object.assign({}, state, { isOpen: true });
  },
  [HIDE_LANGUAGE_MENU](state, action) {
    return Object.assign({}, state, { isOpen: false });
  },
  [TOGGLE_LANGUAGE_MENU](state, action) {
    return Object.assign({}, state, { isOpen: !state.isOpen });
  }
});

export default reducer;
