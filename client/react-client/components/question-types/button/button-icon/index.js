/* eslint-disable */

import React from 'react';
import zepto from 'npm-zepto';
import className from 'classnames';
import { repeat, get } from 'lodash';

import { onTap } from 'utils/events';
import { getImageSrcFromCache } from 'utils/images';
import { getTextFillId } from 'utils/text-fill-utils';

import CachedImage from 'components/cached-image';
import TextFill from 'components/text-fill';
import CircleAnimation from 'components/circle-animation';

const mapButtonValueToClass = value => {
  const map = {
    '0': 'b5 text-red button-label',
    '0.25': 'b4 text-orange button-label',
    '0.33': 'b4 text-orange button-label',
    '0.5': 'b3 text-yellow button-label',
    '0.66': 'b2 text-green button-label',
    '0.75': 'b2 text-green button-label',
    '1': 'b1 text-turquoise button-label'
  };

  return map[value.toString()];
}

const mapButtonValue = value => {
  const map = {
    '0': '5',
    '0.25': '4',
    '0.33': '4',
    '0.5': '3',
    '0.66': '2',
    '0.75': '2',
    '1': '1'
  };

  return map[value.toString()];
}

const mapButtonValueToImage = value => {
  const map = {
    '0': '000',
    '0.25': '025',
    '0.33': '025',
    '0.5': '050',
    '0.66': '075',
    '0.75': '075',
    '1': '100'
  };

  return `dist/images/faces/${map[value.toString()]}.png`;
}


let ButtonIcon = props => {
  const { index,  label } = props;
  const key = `${repeat('0', 3 - (props.value * 100).toString().length)}${(props.value * 100).toString()}`;
  const buttonStyle = get(props, 'buttonStyle') || {plain: false, animated: false}
  const classes = className(mapButtonValueToClass(props.value), 'face-container', 'cursor-pointer', buttonStyle);

  let button;

  const textFillOptions = { maxFontPixels: props.decorators.PLUGIN || props.decorators.MOBILE ? 10 : 20};

  const onButtonImageLoad = index => () => {
    zepto(button).addClass(`fade-in stagger stagger-${index}`);
  }

  /*
  let image = "dist/images/faces/placeholder.png";
  image = zepto("body.ipad-native").length > 0 ? image : "/" + image;
  */
  
  let image = getImageSrcFromCache('https://survey.feedbackly.com/dist/images/faces/placeholder.png')

  const ext = buttonStyle.animated ? 'gif' : 'png';
  const dir = buttonStyle.plain ? 'plain' : 'default';
  const bStyle = buttonStyle.plain ? 'b' : 'a';

  const imageUrl = `https://survey.feedbackly.com/dist/images/faces/${dir}/${mapButtonValue(props.value)}${bStyle}.${ext}`;
  const faceImage =  getImageSrcFromCache(imageUrl)

  return (
    <div className={classes} {...onTap(props.onTap, { applyActiveClass: true })} >
      <div className={`tapable scale-on-active face-visual`} ref={node => { button = node }}>
        <div className={`face-image-wrapper button-${props.value}`}>
          <div style={{backgroundImage: `url(${faceImage})`}}>
            <img src={image} className="face-vector face-image" onLoad={onButtonImageLoad(props.index)} />
          </div>
        </div>
      </div>


      <div className="face-label">
        <div>{label}</div>
      </div>
    </div>
  );
}

export default ButtonIcon;
