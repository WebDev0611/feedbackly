import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as languageActions from '../modules/languages';
import * as uiActions from '../modules/ui';
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import _ from 'lodash';
import { Dialog, FlatButton, DropDownMenu, MenuItem, TextField, Badge } from 'material-ui'
import { filterLanguages } from '../utils/Languages';
import { missingTranslations } from '../modules/selectors';
import update from 'immutability-helper';
import style from './styles/LanguageBar.scss';
import FlagButton from '../components/FlagButton';
import tr from '../utils/translate';
const initialState = {
  newLanguage: 0,
}

@connect(
  state => ({
    languages: state.languages,
    activeLanguage: state.ui.activeLanguage,
    languageDialog: state.ui.languageDialog,
    missingTranslations: missingTranslations(state),

  }),
  dispatch => bindActionCreators({
    ...languageActions,
    ...uiActions,
  }, dispatch)
)
export default class LanguageBar extends Component {



  constructor() {
    super();
    this.state = initialState;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.languageDialog && !this.props.languageDialog) this.setState(initialState);
  }

  renderDialog() {
    const { activeLanguage, selectLanguage, languages, languageDialog,
      openLanguageDialog, closeLanguageDialog, addLanguage } = this.props;
    const { newLanguage } = this.state;

    let dialogOpen = !!languageDialog;
    let filteredLanguages = filterLanguages(languages);
    let cancelButton = <FlatButton
      label={tr('Cancel')}
      primary
      onTouchTap={closeLanguageDialog}
      />;
    let okButton = <FlatButton
      label={tr('OK')}
      primary
      onTouchTap={() => {
        addLanguage(filteredLanguages[newLanguage].language)
        closeLanguageDialog();
      } }
      />

    let actions = [cancelButton, okButton];


    return <Dialog
      title={tr('Add a language')}
      modal={false}
      open
      actions={actions}
      >
      <DropDownMenu value={newLanguage} onChange={(e, val) => { this.setState({ newLanguage: val }) } } >
        {filteredLanguages.map((o, id) => {
          let text = <span><FlagButton lang={o.language} small />{o.languageName}</span>
          return <MenuItem key={id} value={id} primaryText={text} />
        })}
      </DropDownMenu>
    </Dialog>

  }

  render() {
    const { activeLanguage, selectLanguage, languages, languageDialog,
      openLanguageDialog, closeLanguageDialog, removeLanguage, missingTranslations } = this.props;
    let dialogOpen = !!languageDialog;

    let order = _.without(languages, activeLanguage);

    return <div className='valign-wrapper'>

      <FlagButton key={activeLanguage} lang={activeLanguage} alert={missingTranslations.languages[activeLanguage]}
        onClick={() => selectLanguage(activeLanguage)} />
      {languages.length > 1 &&
        <FAB mini onClick={() => {
          selectLanguage(order[0]);
          removeLanguage(activeLanguage);
        }} >
          <FontIcon className="material-icons">delete</FontIcon>
        </FAB>
      }
      <div className={style.languagelist}>
        {order.map(lang => <FlagButton key={lang} lang={lang} alert={missingTranslations.languages[lang]}
          onClick={() => selectLanguage(lang)} small />)}
      </div>

      <FAB mini onClick={() => openLanguageDialog('NEW_LANG')}>
        <FontIcon className="material-icons">add</FontIcon>
      </FAB>
      {dialogOpen && this.renderDialog()}

    </div>
    /*

        </div>
    */
  }

}
