import React from 'react';
import { connect } from 'react-redux';
import { shape, string, func, bool } from 'prop-types';
import { addFbevent } from '../../state/fbevents';
import { showNextCard, goBackToBeginning } from '../../state/active-card';
import { interactWithQuestion, wordSelected } from '../../state/questions';
import { createCircleAnimation } from '../../state/circle-animation';
import { addInteraction } from '../../state/view';

import {
  BUTTON,
  NPS,
  CONTACT,
  IMAGE,
  SLIDER,
  TEXT,
  WORD,
  UPSELL,
} from '../../constants/question-types';

import ButtonQuestion from '../question-types/button';
import NPSQuestion from '../question-types/nps';
import ContactQuestion from '../question-types/contact';
import ImageQuestion from '../question-types/image';
import SliderQuestion from '../question-types/slider';
import WordQuestion from '../question-types/word';
import TextQuestion from '../question-types/text';
import UpsellQuestion from '../question-types/upsell';

import TextFill from '../text-fill';
import PrivacyPolicyToggle from '../privacy-policy-toggle';

import { onTap } from '../../utils/events';

const mapQuestionTypeToComponent = {
  [BUTTON]: ButtonQuestion,
  [NPS]: NPSQuestion,
  [CONTACT]: ContactQuestion,
  [IMAGE]: ImageQuestion,
  [SLIDER]: SliderQuestion,
  [WORD]: WordQuestion,
  [TEXT]: TextQuestion,
  [UPSELL]: UpsellQuestion
};

const mapStateToProps = (state, props) => ({
  showPrivacyPolicy: true,
  language: state.language || state.survey.languages[0],
  decorators: state.view.decorators,
  feedbacksMap: state.fbevents.feedbacksMap,
  udid: state.channel.udid,
  showEscape: state.survey.ipad_example_survey && !state.view.isPreview,
  wordSelected: state.wordSelected,
});

const mapDispatchToProps = (dispatch, props) => ({
  onFbevent: ({ data }) => {
    dispatch(addFbevent({ question: props.question, data }));
  },
  onNext: (data) => {
    dispatch(addInteraction());
    dispatch(interactWithQuestion(props.question));
    dispatch(showNextCard(data));
  },
  onInteract: () => {
    dispatch(addInteraction());
    dispatch(interactWithQuestion(props.question));
  },
  onCircleAnimation: ({ x, y, color }) => {
    dispatch(createCircleAnimation({ x, y, color }));
  },

  onEscapeSurvey: () => {
    dispatch(goBackToBeginning());
  },

  onWordSelection: id => {
    dispatch(wordSelected(id));
  },
});

const Question = ({
  question,
  language,
  onFbevent,
  onNext,
  onInteract,
  onWordSelection,
  onCircleAnimation,
  showPrivacyPolicy,
  feedbacksMap,
  decorators,
  udid,
  showEscape,
  onEscapeSurvey,
  wordSelected
}) => {
  const maxLabelSize = decorators.PLUGIN || decorators.MOBILE ? 15 : 1000;
  const maxSubtitleSize = decorators.PLUGIN || decorators.MOBILE ? 12 : 15;

  const heading = (
    <h1>
      <TextFill options={{ maxFontPixels: maxLabelSize }}>
        {question.heading[language]}
      </TextFill>
    </h1>
  );
    
  const subtitle =
    question.subtitle !== undefined ?
      <h3>
        <TextFill options={{ maxFontPixels: maxSubtitleSize }}>
          {question.subtitle[language]}
        </TextFill>
      </h3> :
      null;

  const ContentComponent = mapQuestionTypeToComponent[question.question_type]

  const footer =
    <div className="question-footer">
      <PrivacyPolicyToggle decorators={decorators} />
    </div>;


  const questionType = (question.question_type || '').toLowerCase();

  return (
    <div className={`question-wrapper question-type-${questionType}`}>
      <div className="question-header">
        {heading}
        <div className="heading-divider" />
        {subtitle}
      </div>
      <div className="question-content">
        <ContentComponent
          question={question}
          feedbacksMap={feedbacksMap}
          decorators={decorators}
          language={language}
          onCircleAnimation={onCircleAnimation}
          onFbevent={onFbevent}
          onNext={onNext}
          onInteract={onInteract}
          udid={udid}
          onWordSelection={onWordSelection}
          wordSelected={wordSelected} />
        {showPrivacyPolicy && footer}
        {showEscape &&
          <button
            {...onTap(onEscapeSurvey)}
            className="btn-no-style cursor-pointer demo-survey-toggle"
          >
            Close example survey
          </button>}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Question);

