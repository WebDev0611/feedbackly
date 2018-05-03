import React from 'react';
import { connect } from 'react-redux';

import { hidePrivacyPolicy } from 'state/privacy-policy';
import { getPrivacyPolicyTranslation } from 'utils/translate';

import {get} from 'lodash';
import Translate from 'components/translate';
import FeedbacklyPrivacyPolicy from './feedbackly-privacy-policy';
import Modal from 'components/modal';

let PrivacyPolicyModal = ({ show, customPrivacyPolicy, onHide }) => {
  let customPrivacyPolicyDisplay = customPrivacyPolicy !== undefined
    ? (
      <div>
        {customPrivacyPolicy}
        <div className="divider"></div>
      </div>
    )
    : null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      content={() => {
        return (
          <div className="privacy-policy">
            {customPrivacyPolicyDisplay}
            <FeedbacklyPrivacyPolicy/>
          </div>
        );
      }}
      heading={() => {
        return (<Translate getText={language => getPrivacyPolicyTranslation(language)}/>);
      }}/>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    onHide: () => dispatch(hidePrivacyPolicy())
  }
}

const mapStateToProps = state => {
  const { privacyPolicy, survey } = state;

  return {
    show: privacyPolicy.isOpen,
    customPrivacyPolicy: get(survey, 'properties.custom_privacy_policy') || ''
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyPolicyModal);
