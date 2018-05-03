import { delay } from 'lodash';

import { getQueryParameterByName } from 'utils/url';
import { getLogicKey } from 'utils/logic-keys';
import { addFbevent } from 'state/fbevents';
import { showNextCard, showQuestionById } from 'state/active-card';
import * as questionTypes from 'constants/question-types';

import { cardsSelector } from 'selectors/active-card';

const DELAY_TIME = 1000;

const syncPrefilledSurveyWithStore = (store) => {
  const state = store.getState();

  const questionId = getQueryParameterByName('qid');
  const dataString = getQueryParameterByName('val');

  if (questionId && dataString) {
    let formattedData = decodeURIComponent(dataString);

    if (formattedData.indexOf(']') < 0) {
      formattedData = `["${formattedData}"]`;
    }

    let data = JSON.parse(formattedData);

    const question = cardsSelector(state).find(
      card => card.question_type !== undefined && card._id === questionId,
    );

    if (question !== undefined) {
      if ([questionTypes.BUTTON, questionTypes.NPS].includes(question.question_type)) {
        data = [parseFloat(data[0])];
      }

      store.dispatch(showQuestionById(questionId, { skipTransitionLock: true }));

      delay(() => {
        store.dispatch(addFbevent({ question, data }));
        store.dispatch(showNextCard(data));
      }, DELAY_TIME);
      return true;
    }
  } else return false;
};

export default syncPrefilledSurveyWithStore;
