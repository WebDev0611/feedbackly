import { repeat } from 'lodash';

import * as questionTypes from 'constants/question-types';

const buttonIndex = (value,choices) => {
  if(value==0) return choices[0].id;
  if(value==0.25 || value==0.33) return choices[1].id;
  if(value==0.5 || value==0.66) return choices[2].id;
  if(value==0.75) return choices[3].id;
  return choices[choices.length-1].id;
}

const getters = {
  [questionTypes.BUTTON](data, question) {
    return buttonIndex(data[0], question.choices)
  },
  [questionTypes.NPS](data) {
    return (data[0] * 10).toString();
  },
  [questionTypes.IMAGE](data) {
    return data[0].toString();
  },
  [questionTypes.WORD](data) {
    const el = data[0]
    if(data[0]) return data[0].toString()
    else return 'submit'
  }
}

export function getLogicKey(question, data) {
  return (getters[question.question_type] || (() => 'submit'))(data, question);
}
