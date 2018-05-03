import { createReducer } from 'redux-create-reducer';

import { SHOW_PRIVACY_POLICY, HIDE_PRIVACY_POLICY, TOGGLE_PRIVACY_POLICY } from './actions';

const initialState = {
  isOpen: false
}

const reducer = createReducer(initialState, {
  [SHOW_PRIVACY_POLICY](state, action) {
    return Object.assign({}, state, { isOpen: true });
  },
  [HIDE_PRIVACY_POLICY](state, action) {
    return Object.assign({}, state, { isOpen: false });
  },
  [TOGGLE_PRIVACY_POLICY](state, action) {
    return Object.assign({}, state, { isOpen: !state.isOpen });
  }
});

export default reducer;
