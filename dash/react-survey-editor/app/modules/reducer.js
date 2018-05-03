import { combineReducers } from 'redux';

import questions from './questions';
import ui from './ui';
import languages from './languages';
import logic from './logic';
import questionorder from './questionorder';
import properties from './properties';
import reduceReducers from 'reduce-reducers';
import misc from './misc';

let baseReducer = combineReducers({
  questions,
  languages,
  ui,
  properties,
  logic: (state = {}) => state,
  user: (state = {}) => state,
});


let complexReducers = (state, action) => {
  return {
    ...state,
    logic: logic(state.logic, action, state.questions),
  }
}

export default reduceReducers(
  baseReducer,
  complexReducers,
  questionorder,
  misc
);
