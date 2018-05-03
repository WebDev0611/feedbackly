import update from 'immutability-helper';
import _ from 'lodash';
import { generateId } from '../../utils';
import { getClientTranslation } from '../../utils/translate';

function create(languages) {
  let heading = {};
  let email = {};
  let terms = {};
  languages.forEach( l => heading[l] = getClientTranslation(l,'upsell.heading'));
  languages.forEach( l => email[l] = getClientTranslation(l,'upsell.email'));
  languages.forEach( l => terms[l] = getClientTranslation(l,'upsell.terms'));
  return {
    type: 'Upsell',
    heading,
    choices: [ {
      id: 'email',
      type: 'string',
      text: email
    },
    {
      id: 'terms',
      type: 'boolean',
      text: terms
    }

  ],
  };
}

function reducer(state = INITITAL_STATE(), action) {
  if (!action) return state;
  switch (action.type) {
  default:
    return state;
  }
}

export default {
  reducer,
  create,
  question_type: 'Upsell',
  actions: {  },
  action_types: [],
}
