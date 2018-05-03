import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { goBackToBeginning } from 'state/active-card';

import Card from 'components/card';

import { getImageSrcFromCache } from 'utils/images';
import { getEndTranslation } from 'utils/translate';

import Translate from 'components/translate';
import { onTap } from 'utils/events';

let EndScreen = ({showEscape, onEscapeSurvey, isIpad }) => {
  let content;

    content = (
      <h1>
        <Translate isIpad={isIpad} getText={language => getEndTranslation(language)}/>
      </h1>
    );


  return (
    <div className="end-wrapper">
      {content}

      <div className="powered-by-feedbackly">
        <h3 style={{"textTransform":"none"}}>Powered by</h3>
        <img src={getImageSrcFromCache('https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-rgb.png')}/>
      </div>
      { showEscape && <button {...onTap(onEscapeSurvey)} className="btn-no-style cursor-pointer demo-survey-toggle">
        Close example survey
      </button>}
    </div>
  );
}

const mapStateToProps = (state, props) => {

  return {
    showEscape: state.survey.ipad_example_survey && !state.view.isPreview,
    isIpad: state.view.decorators.IPAD
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onEscapeSurvey: () => {
      dispatch(goBackToBeginning())
    }
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EndScreen);
