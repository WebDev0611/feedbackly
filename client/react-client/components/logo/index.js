import React from 'react';

import { getImageSrcFromCache } from 'utils/images';

let Logo = props => {
  const imgSrc = getImageSrcFromCache('https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-placeholder.png');

  return (
    <img src={imgSrc} {...props}/>
  );
}

export default Logo;
