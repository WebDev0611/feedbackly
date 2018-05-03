import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as questionOrderActions from '../modules/questionorder';
import * as questionActions from '../modules/questions';
import _ from 'lodash';
import ConfirmDialog from '../components/ConfirmDialog';
import tr from '../utils/translate';
@connect(
  state => ({
    ui: state.ui,
  }),
  dispatch => bindActionCreators({
    ...questionOrderActions,
    ...questionActions,
  }, dispatch)
)
export default class PendingQuestionPopup extends Component {

  render() {
    const { ui: { pendingQuestionMoveConfirm }, pendingQuestionMoveConfirmed, removePendingQuestionMove } = this.props;
    if (!pendingQuestionMoveConfirm) return null;
    return <ConfirmDialog
      text={tr('Logic related to the moved question will change. Do you want to proceed?')}
      onCancel={() => removePendingQuestionMove()}
      onSuccess={() => pendingQuestionMoveConfirmed()}
        />;
  }
}
