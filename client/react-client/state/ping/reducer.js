import { createReducer } from 'redux-create-reducer';

import { SAVE_PING_SUCCESS } from './actions';

const initialState = {
  latestPing: null,
  refreshRequired: false
}

const reducer = createReducer(initialState, {
  [SAVE_PING_SUCCESS](state, action) {
    return Object.assign({}, state, { latestPing: Math.floor(new Date().getTime() / 1000), refreshRequired: (action.payload.data || {}).refresh || false });
  }
});

export default reducer;