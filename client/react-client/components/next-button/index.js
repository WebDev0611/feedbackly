import React from 'react';

import { connect } from 'react-redux';
import { getNextTranslation } from 'utils/translate';

import Translate from 'components/translate';

let NextButton = props => {
  return (
    <button {...props} className="btn btn-next">
      <Translate getText={language => getNextTranslation(language)}/>
    </button>
  );
}

export default NextButton;
