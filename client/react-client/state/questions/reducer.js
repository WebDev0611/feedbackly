import { createReducer } from 'redux-create-reducer';
import { WORD_SELECTED } from './actions';
import { without } from 'lodash';

const initialState = [];
const reducer = createReducer(initialState, {
  [WORD_SELECTED](state, action) {
    if (state.indexOf(action.id) === -1) return [...state, action.id];
    return without(state, action.id);
  },
});

export default reducer;
