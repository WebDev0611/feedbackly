import { createReducer } from 'redux-create-reducer';

import { SET_VIEW_RESOLUTION, SET_VIEW_BACKGROUND, ADD_INTERACTION, SET_NEXT_BUTTON_DISABLED_STATUS, ADD_DECORATOR, REMOVE_DECORATOR, SET_TEXT_FILL_ENABLED } from './actions';

const reducer = createReducer({}, {
  [SET_VIEW_RESOLUTION](state, action) {
    const { isLandscape } = action;

    return Object.assign({}, state, { isLandscape });
  },
  [SET_VIEW_BACKGROUND](state, action) {
    const { color } = action;

    return Object.assign({}, state, { color });
  },
  [ADD_INTERACTION](state, action) {
    const { latestInteraction } = action;

    return Object.assign({}, state, { latestInteraction });
  },
  [SET_NEXT_BUTTON_DISABLED_STATUS](state, action) {
    const { status } = action;

    return Object.assign({}, state, { nextButtonIsDisabled: status });
  },
  [ADD_DECORATOR](state, action) {
    const { decorator } = action;

    return Object.assign({}, state, { decorators: Object.assign({}, state.decorators, { [decorator.toUpperCase()]: true }) });
  },
  [REMOVE_DECORATOR](state, action) {
    const { decorator } = action;

    let newDecorators = Object.assign({}, state.decorators);
    delete newDecorators[decorator.toUpperCase()];

    return Object.assign({}, state, { decorators: newDecorators });
  },
  [SET_TEXT_FILL_ENABLED](state, action){
    const { enabled } = action;
    return Object.assign({}, state, {textFillEnabled: enabled })
  }
});

export default reducer;
