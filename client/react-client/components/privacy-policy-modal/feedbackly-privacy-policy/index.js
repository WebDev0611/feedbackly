import React from 'react';
import { connect } from 'react-redux';

import FeedbacklyPrivacyPolicyFi from './feedbackly-privacy-policy-fi';
import FeedbacklyPrivacyPolicyEn from './feedbackly-privacy-policy-en';

let FeedbacklyPrivacyPolicy = ({ language }) => {
  let display = language === 'fi'
    ? <FeedbacklyPrivacyPolicyFi/>
    : <FeedbacklyPrivacyPolicyEn/>

  return display;
}

const mapStateToProps = state => {
  let { language } = state;

  return {
    language
  }
}

export default connect(
  mapStateToProps
)
(FeedbacklyPrivacyPolicy);
