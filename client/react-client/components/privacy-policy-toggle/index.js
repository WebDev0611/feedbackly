import React from 'react';
import { connect } from 'react-redux';

import { togglePrivacyPolicy } from 'state/privacy-policy';
import { getPrivacyPolicyTranslation } from 'utils/translate';

import { onTap } from 'utils/events';

import Translate from 'components/translate';

const PRIVACY_POLICY_URL = 'https://www.feedbackly.com/privacy-policy';

let PrivacyPolicyToggle = ({ onToggle, channelId, decorators }) => {
  return !decorators.PLUGIN ?
  (
    <button {...onTap(onToggle)} className="btn-no-style cursor-pointer privacy-policy-toggle">
      <Translate getText={language => getPrivacyPolicyTranslation(language)}/>
    </button>
  ) : (
    <a href={`${PRIVACY_POLICY_URL}?ref=${channelId}`} target="_blank" className="btn-no-style cursor-pointer privacy-policy-toggle">
      <Translate getText={language => getPrivacyPolicyTranslation(language)}/>
    </a>
  )

}

const mapDispatchToProps = dispatch => {
  return {
    onToggle: () => dispatch(togglePrivacyPolicy())
  }
}

const mapStateToProps = state => {
  return {
    channelId: state.channel._id
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyPolicyToggle);
