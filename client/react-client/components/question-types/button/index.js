import React from 'react';
import { get, repeat } from 'lodash';

import { onTap, getEventX, getEventY } from 'utils/events';

import ButtonIcon from './button-icon';

import { DEFAULT_BUTTON_COUNT } from 'constants/surveys';
import { TURQUOISE, GREEN, YELLOW, RED, ORANGE } from 'constants/colors';
import { StaggeredMotion, spring } from 'react-motion';

const mapButtonValueToColor = value => {
  const map = {
    '0': RED,
    '0.25': ORANGE,
    '0.33': ORANGE,
    '0.5': YELLOW,
    '0.66': GREEN,
    '0.75': GREEN,
    '1': TURQUOISE
  };

  return map[value.toString()];
}

let ButtonQuestion = (props) => {
  const { question, language } = props;
  const onButtonClick = buttonValue => e => {
    const id = props.question._id;
    if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){
      props.onFbevent({ data: [buttonValue] });
      props.onCircleAnimation({ x: getEventX(e), y: getEventY(e), color: mapButtonValueToColor(buttonValue) });
      props.onNext([buttonValue]);
    }
  }

  const buttonCount = (props.question.choices||[]).length || DEFAULT_BUTTON_COUNT;
  const buttonStyle = get(props.question, 'opts.buttonStyle') || {plain: false, animated: false}
  const buttonValues = buttonCount === 5
    ? [1, 0.75, 0.5, 0.25, 0]
    : [1, 0.66, 0.33, 0];

  const buttons = buttonValues
    .map((value, index) => {
      return (
        <ButtonIcon onTap={onButtonClick(value)} buttonStyle={buttonStyle} value={value} index={index} label={question.choices[buttonCount-index-1].text[language]} decorators={props.decorators} key={value}/>
      );
    });

  return (
    <div className={`button-question-wrapper ${buttonCount === 5 ? 'five' : 'four'}-buttons`}>
      {buttons}
    </div>
  );
}

export default ButtonQuestion;
