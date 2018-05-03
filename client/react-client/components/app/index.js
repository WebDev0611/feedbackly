import React from 'react';
import { connect } from 'react-redux';
import className from 'classnames';

import { TURQUOISE_VIEW, GREEN_VIEW, YELLOW_VIEW, ORANGE_VIEW, RED_VIEW } from 'constants/views';

import ActiveCard from 'components/active-card';
import SurveyProgress from 'components/survey-progress';
import TimerWarning from 'components/timer-warning';
import SurveyHeader from 'components/survey-header';
import LanguageMenu from 'components/language-menu';
import PrivacyPolicyModal from 'components/privacy-policy-modal';
import CircleAnimation from 'components/circle-animation';
import IpadSignup from 'components/ipad-signup';

const mapViewColorToClasses = {
  [TURQUOISE_VIEW]: 'turquoise-view colored-view',
  [GREEN_VIEW]: 'green-view colored-view',
  [YELLOW_VIEW]: 'yellow-view colored-view',
  [ORANGE_VIEW]: 'orange-view colored-view',
  [RED_VIEW]: 'red-view colored-view',
};

const App = ({ isLandscape, type, color, decorators, showHeader, ipadExampleSurvey }) => {
  const decoratorClasses = Object.keys(decorators).map(
    decorator => `${(decorator || '').toLowerCase()}-decorator`,
  );

  const classes = className(
    'no-scroll',
    { landscape: isLandscape, portrait: !isLandscape },
    ...decoratorClasses,
    'ready',
    color !== undefined ? mapViewColorToClasses[color] : undefined,

  );
  const signupScreen = ipadExampleSurvey ? <IpadSignup /> : null;
  const noFlex = window.Modernizr.flexboxlegacy === false;

  return (
    <div className={classes} >
      <div id="survey" className={noFlex ? 'no-flex' : ''}>
        <SurveyProgress />
        {showHeader && <SurveyHeader />}
        <ActiveCard />
      </div>
      <PrivacyPolicyModal />
      <LanguageMenu />
      <TimerWarning />
      <CircleAnimation />
      {signupScreen}
    </div>
  );
};

const mapStateToProps = (state) => {
  const { view, survey } = state;
  return {
    isLandscape: view.isLandscape,
    type: view.type,
    color: view.color,
    decorators: view.decorators,
    showHeader: !view.decorators.PLUGIN,
    ipadExampleSurvey: !!survey.ipad_example_survey, // && !view.isPreview
  };
};

export default connect(mapStateToProps)(App);
