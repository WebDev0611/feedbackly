import { createReducer } from 'redux-create-reducer';

import { SET_LANGUAGE } from './actions';

const reducer = createReducer('', {
  [SET_LANGUAGE](state, action) {
    return action.language;
  }
});

export default reducer;
