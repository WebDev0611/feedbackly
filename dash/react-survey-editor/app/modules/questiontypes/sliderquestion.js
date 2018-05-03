import update from 'immutability-helper';
import _ from 'lodash';
import { generateId } from '../../utils';


const INITITAL_STATE = {
  type: 'Slider',
  choices: [ { id: generateId(), text: {} } ],
};

function reducer(state = INITITAL_STATE, action) {
  if (!action) return state;
  switch (action.type) {
  default:
    return state;
  }
}

export default {
  reducer,
  question_type: 'Slider',
  actions: {},
  action_types: [ ],
}
