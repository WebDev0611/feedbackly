import React from 'react';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { onTap } from 'utils/events';
import { startAndsetTimerToQuestionTimeout } from 'state/timer';

import { isEndSelector, activeCardIndexSelector } from 'selectors/active-card';

import { getTimerReturningTranslation, getTimerSecondsTranslation } from 'utils/translate';
import Translate from 'components/translate';

let TimerWarning = ({ show, timeLeft, onActivate }) => {
  const content = show === true
    ? (
      <div id="timer-warning" {...onTap(onActivate)}>
        <div className="timer-warning-content">
          <i className="material-icons">&#xE913;</i>
          <div className="timer-warning-seconds-left">
            <Translate getText={language => getTimerReturningTranslation(language)}/>

            <span className="text-red">
              {timeLeft}
            </span>

            <Translate getText={language => getTimerSecondsTranslation(language)}/>
          </div>
        </div>
      </div>
    )
    : null;

  return (
    <ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
      {content}
    </ReactCSSTransitionGroup>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    onActivate: () => dispatch(startAndsetTimerToQuestionTimeout())
  }
}

const mapStateToProps = state => {
  const timeLeft = state.timer.value;

  return {
    timeLeft,
    show: activeCardIndexSelector(state) !== 0 && timeLeft < 5 && state.timer.interval !== null && state.view.decorators.IPAD && !isEndSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimerWarning);
