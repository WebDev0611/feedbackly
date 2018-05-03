import { getClientTranslation } from '../../utils/translate';
const INITITAL_STATE = {
  type: 'NPS',
  //choices: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5},{id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10},]
};


function create(languages) {
  let subtitle = {}
  let heading = {}
  languages.forEach( l => heading[l] = getClientTranslation(l,'nps.heading'))
  languages.forEach( l => subtitle[l] = getClientTranslation(l,'nps.subtitle'))
  return {
    type: 'NPS',
    heading,
    subtitle
  }
}


function reducer(state = INITITAL_STATE, action) {
  if (!action) return state;
  switch (action.type) {
  default:
    return state;
  }
}
export default {
  reducer,
  create,
  question_type: 'NPS',
  actions: {},
  action_types: [],
}
