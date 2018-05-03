import update from 'immutability-helper';
import _ from 'lodash';

const ADD_LANGUAGE = 'ADD_LANGUAGE';
const REMOVE_LANGUAGE = 'REMOVE_LANGUAGE';

const INITITAL_STATE = [ 'en' ];

export default function reducer(state = INITITAL_STATE, action) {
  let index;
  switch (action.type) {
  case ADD_LANGUAGE:
    return state.concat([action.language])
  case REMOVE_LANGUAGE:
    index = _.indexOf(state, action.language);
    return update(state, { $splice: [
        [index, 1],
    ] });
  default:
    return state;
  }

}

export function addLanguage(language) {
  return {
    type: ADD_LANGUAGE,
    language
  };
}
export function removeLanguage(language) {
  return {
    type: REMOVE_LANGUAGE,
    language,
  };
}
