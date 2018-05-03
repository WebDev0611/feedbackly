import reducer from '../../app/modules/reducer';
import { moveQuestions } from '../../app/modules/questions';
import _ from 'lodash';
jest.autoMockOff();

describe('logic', () => {
  const questions = ['a','b','c','d','e'].map(l => ({ questionId: l}));
  var state;
  var logic;
  beforeEach(() => {

    logic = {
      'a': {
        '1': 'b'
      },
      'b': {
        '2': 'd',
        '3': 'c'
      },
      'c': {
        '4': 'e',
      },
      'd': {
        '5': 'end'
      }
    }
    state = { logic, questions };
  }),
  it('should not remove unrelated logics', () => {
    var newLogic = reducer(state,moveQuestions(['a','b','c','e','d'])).logic;
    expect(newLogic).toEqual(logic);
  }),
  it('should not remove logic when a followup stays behind the question', () => {
    var newLogic = reducer(state,moveQuestions(['a','b','d','c','e'])).logic;
    expect(newLogic).toEqual(logic);

  }),
  it('should remove logic when a followup is moved in front of the question', () => {
    var newLogic = reducer(state,moveQuestions(['d','a','b','c','e'])).logic;
    expect(newLogic.b).toEqual({'3': 'c'});
  }),


  it('should remove logic when question is moved behind its followup', () => {
    var newLogic = reducer(state,moveQuestions(['b','a','c','d','e'])).logic;
    expect(newLogic.a).toEqual({});
  }),

  it('should not remove logic when question is moved but stays in front of its followup', () => {
    var newLogic = reducer(state,moveQuestions(['a','b','d','c','e'])).logic;
    expect(newLogic.c).toEqual({'4': 'e'});
  })


})
