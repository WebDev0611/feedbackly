import reducer, * as actions from '../../app/modules/questionorder';
import _ from 'lodash';
import initStore from 'redux-test-belt';
jest.unmock('redux-mock-store');
jest.unmock('redux-thunk');
import thunk from 'redux-thunk'

const middlewares = [ thunk ];
const mockStore = initStore(middlewares);


describe('logic', () => {
  const questions = ['a','b','c','d','e'].map(l => ({ questionId: l}));
  const ui = {
    pendingQuestionOrder: ['b','a','c','d','e'],
    pendingQuestionMoveConfirm: false
  };
  const logic = {
    'a': {
      'B': 'b', 'C': 'c'
    },
    'b': {
      'C': 'c'
    },
    'e': {
      'E': 'end'
    }
  };
  var storeWithPendingOrder= (order) => mockStore({logic, ui: { ...ui, pendingQuestionOrder: order}, questions}
  ,reducer);


  it('should require confirmation when breaking logic', ()=> {
      var order = ['b','a','c','d','e'];
      var store = storeWithPendingOrder(order);
      store.dispatch(actions.pendingQuestionMoveDrop());
      expect(store.getState().ui.pendingQuestionMoveConfirm).toEqual(true);
      expect(store.getState().ui.pendingQuestionOrder).toEqual(order);
}),
  it('should not require confirmation when not breaking logic', ()=> {
      var order = ['a','b','e','d','c']
      var store = storeWithPendingOrder(order);
      store.dispatch(actions.pendingQuestionMoveDrop());
      expect(store.getState().ui.pendingQuestionMoveConfirm).toEqual(false);
      expect(store.getState().ui.pendingQuestionOrder).toEqual(null);
      expect(store.getActions()).toContainEqual({type: 'MOVE_QUESTIONS',order});
  })

  it('should update order only after confirmation', () => {
      var order = ['b','a','c','d','e'];
      var store = storeWithPendingOrder(order);

      store.dispatch(actions.pendingQuestionMoveDrop());

      expect(store.getActions()).not.toContainEqual({type: 'MOVE_QUESTIONS',order});

      store.dispatch(actions.pendingQuestionMoveConfirmed());
      expect(store.getActions()).toContainEqual({type: 'MOVE_QUESTIONS',order});

  })
})
