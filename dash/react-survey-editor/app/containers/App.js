import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import QuestionsContainer from './QuestionsContainer'
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import LanguageBar from './LanguageBar';
import PendingQuestionPopup from './PendingQuestionPopup';
import Properties from './Properties';
import SaveButton from './SaveButton';
import * as uiActions from '../modules/ui';
import style from './styles/App.scss';
import MuiTheme from './styles/MuiTheme';
import classNames from 'classnames';

@DragDropContext(HTML5Backend)
@connect(
  state => ({
    ui: state.ui,
  }),
  dispatch => bindActionCreators({
    ...uiActions
  }, dispatch)
)
export default class App extends Component {
  render() {
    const { onSave } = this.props;
    return <MuiThemeProvider muiTheme={getMuiTheme(MuiTheme)}>

      <div className='row'>


        <div className='col l10 offset-l1 s12 '>
          <PendingQuestionPopup />
          <div className={classNames('valign-wrapper', style.topbar)}>
            <LanguageBar />
            <div style={{position: 'absolute', right: '10px'}}>
              <Properties />
              <SaveButton onSave={onSave} />
            </div>
          </div>
          <QuestionsContainer />
        </div>
      </div>
    </MuiThemeProvider>
  }
}
