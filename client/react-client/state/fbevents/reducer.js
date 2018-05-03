import { createReducer } from 'redux-create-reducer';

import {
  SET_FBEVENT_BUFFER_SIZE,
  SET_FBEVENT_BUFFER_SAVING_STATUS,
  SET_FEEDBACK_ID,
  SET_FEEDBACK_CHAIN_STARTED_AT,
  SET_FEEDBACKS_MAP
} from './actions';

const initialState = {
  bufferSize: 0,
  savingBuffer: false,
  feedbacksMap: {}
}

const reducer = createReducer(initialState, {
  [SET_FBEVENT_BUFFER_SIZE](state, action) {
    return Object.assign({}, state, { bufferSize: action.size });
  },
  [SET_FBEVENT_BUFFER_SAVING_STATUS](state, action) {
    return Object.assign({}, state, { savingBuffer: action.status });
  },
  [SET_FEEDBACK_ID](state, action) {
    return Object.assign({}, state, { feedbackId: action.id });
  },
  [SET_FEEDBACK_CHAIN_STARTED_AT](state, action) {
    return Object.assign({}, state, { chainStartedAt: action.unix });
  },
  [SET_FEEDBACKS_MAP](state, action) {
    return Object.assign({}, state, { feedbacksMap: action.map });
  }
});

export default reducer;
