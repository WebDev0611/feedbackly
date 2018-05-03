const INITITAL_STATE = {
  type: 'Image',
  choices: [],
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
  question_type: 'Image',
  actions: {},
  action_types: [],
}
