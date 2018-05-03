import React from 'react';

import { onTap } from 'utils/events';

import NextButton from 'components/next-button';
import SliderWidget from './slider-widget';

let SliderQuestion = (props) => {
  const onSubmit = () => {
    const id = props.question._id;
    if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){

      const slidersWithData = Object.keys(sliderValues);

      if(slidersWithData.length > 0) {
        props.onFbevent({ data: slidersWithData.map(slider => { return { id: slider, data: sliderValues[slider] } }) });
      }

      props.onNext();
    }
  }

  let sliderValues = {};
  const smallScale = (props.question.opts || {}).smallScale;

  const onSliderChange = id => value => {
    props.onInteract();
    var scale = smallScale ? 5 : 10;
    // scale value to 0,10,20,.. or 0,20,40,..
    value = Math.round(value / (100/scale)) * (100/scale);

    sliderValues[id] = value/100;
  }

  const sliders = props.question.choices
    .map((slider, index) => {
      if(slider.hidden === true) return;
      return (<SliderWidget showHelper={index === 0} smallScale={smallScale} label={slider.text[props.language]} id={slider.id} onValueChange={onSliderChange(slider.id)} key={slider.id}/>);
    });

  return (
    <div className="slider-question-wrapper">
      <div className="slider-widgets-wrapper">
        {sliders}
      </div>

      <NextButton {...onTap(onSubmit)}/>
    </div>
  );
}

export default SliderQuestion;
