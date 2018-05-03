import React from 'react';
import className from 'classnames';
import { get, filter } from 'lodash';

import { onTap } from 'utils/events';
import { getImageSrcFromCache } from 'utils/images';
import { getTextFillId } from 'utils/text-fill-utils';

import TextFill from 'components/text-fill';
import FlexGrid from 'components/flex-grid';

let ImageQuestion = (props) => {
  const onImageClick = imageId => () => {
    const id = props.question._id;
    if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){

      props.onFbevent({ data: [imageId] });
      props.onNext([imageId]);
    }
  }

  let imagesInTrans = props.question.choices;
  var data = filter(imagesInTrans, i => { if(!i.hidden) return i; })
  data = data.slice(0,9);
  const numberOfImages = data.length;

  let columns = 10;

  if(numberOfImages < 6) {
    columns = numberOfImages;
  } else if(numberOfImages >= 6 && numberOfImages <= 12) {
    columns = 6;
  } else if(numberOfImages > 12) {
    columns = 8;
  }

  let maxLabelSize = props.decorators.PLUGIN || props.decorators.MOBILE ? 12 : 20;

  let textFillOptions = { maxFontPixels: maxLabelSize };

  const containerClasses = className('image-question-wrapper')

  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth;

  let maxImageWidth = (x - x / 10) < 370 ? (x-x/10) : 370;
  props.decorators.PLUGIN && props.decorators.POPUP ? maxImageWidth = 160 : ''

  const images = data
    .map((image, index) => {
      let label = get(props, 'question.opts.show_labels') === true
        ? (
          <div className="image-label">
              {image.text[props.language]}
          </div>
        )
        : null;

      return (
        <div style={{ maxWidth: maxImageWidth + 'px' }} className="image-wrapper cursor-pointer" {...onTap(onImageClick(image.id), { applyActiveClass: true }) } key={image.id}>
          <img src={getImageSrcFromCache(image.url)} className={`fade-in scale-on-active tapable stagger stagger-${index < 6 ? index : 6}`} />
          {label}
        </div>
      );
    });

    return (
      <div className={containerClasses + ` images-${images.length}`}>
          {images}
      </div>
    );
  
}

export default ImageQuestion;
