import { createReducer } from 'redux-create-reducer';

import { SET_TRANSITIONING_STATUS, SHOW_CARD_AT_INDEX } from './actions';

const reducer = createReducer({}, {
  [SHOW_CARD_AT_INDEX](state, action) {
    const { index } = action;
    
    return Object.assign({}, state, { activeIndex: index });
  },
  [SET_TRANSITIONING_STATUS](state, action) {
    return Object.assign({}, state, { transitioning: action.status });
  }
});

export default reducer;
