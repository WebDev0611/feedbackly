import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as uiActions from '../modules/ui';
import { CircularProgress } from 'material-ui';
import { missingTranslations } from '../modules/selectors';
import Toaster from '../utils/Toaster';
@connect(
  state => ({
    ui: state.ui,
    missingTranslations: missingTranslations(state),
    languages: state.languages
  }),
  dispatch => bindActionCreators({
    ...uiActions
  }, dispatch)
)
export default class SaveButton extends PureComponent {

  render() {
    const { save, onSave, ui: { modified, saving }, missingTranslations, showMissing, languages } = this.props;
    if(modified) {
      window.onbeforeunload = () => 'Are you sure? Your unsaved changes will be lost.';
    } else {
      window.onbeforeunload = null;
    }
    const canSave = _.isEmpty(missingTranslations.languages);

    const disabled = !modified || saving;
    const icon = saving ? <CircularProgress /> : <FontIcon className="material-icons">save</FontIcon>;
    return <FAB onClick={() => {
      if (canSave) {
        save();
        onSave();
      } else {
        console.log(missingTranslations);
        if(languages[0] in missingTranslations.languages) Toaster().danger('Some texts are missing');
        else Toaster().danger('Some translations are missing');

        showMissing();
      }
    }} disabled={disabled}> {icon}</FAB>
  }
}
