import React from 'react';
import { connect } from 'react-redux';
import { findIndex } from 'lodash';

import { isEndSelector, activeCardIndexSelector, cardsSelector } from 'selectors/active-card';

let SurveyProgress = ({ percentage }) => {
  return (
    <div className="progress-bar" id="survey-progress">
      <div className="progress" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}

const mapStateToProps = state => {
  let percentage;

  if(isEndSelector(state)) {
    percentage = 100;
  } else {
    percentage = Math.round((activeCardIndexSelector(state) / cardsSelector(state).length) * 100);
  }

  return {
    percentage
  }
}

export default connect(
  mapStateToProps
)(SurveyProgress);
