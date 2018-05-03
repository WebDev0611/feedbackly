import React from 'react';

import { onTap, getEventX, getEventY } from 'utils/events';

import { GREY } from 'constants/colors';

import NpsButton from './nps-button';

let NPSQuestion = (props) => {
  const onNpsClick = npsValue => e => {
    const id = props.question._id;
    if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){

      const logicKey = (npsValue * 10).toString()

      props.onFbevent({ data: [npsValue] });
      props.onCircleAnimation({ x: getEventX(e), y: getEventY(e), color: GREY });
      props.onNext([npsValue]);
    }
  }

  const npsButtons = (new Array(11))
    .fill(1)
    .map((value, index) => {
      return (<NpsButton onTap={onNpsClick(index / 10)} key={index} index={index} decorators={props.decorators}>{index}</NpsButton>);
    });

  return (
    <div className="nps-question-wrapper">
      {npsButtons}
    </div>
  );
}

export default NPSQuestion;
