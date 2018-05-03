import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as uiActions from '../modules/ui';
import EditableList from '../components/EditableList';
import { bindActionCreators } from 'redux';
import questionTypeModules from '../modules/questiontypes';
import * as questionActions from '../modules/question';
import * as logicActions from '../modules/logic';
import { Menu, MenuItem, Popover, Badge } from 'material-ui';
import _ from 'lodash';
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import style from './styles/LogicButton.scss';
import tr from '../utils/translate';
import Tooltip from "rc-tooltip";
import { RaisedButton } from 'material-ui';

@connect(
  state => ({
    activeLanguage: state.ui.activeLanguage,
    selectedQuestion: state.ui.selectedQuestion,
    selectedLogic: state.ui.selectedLogic,
    questions: state.questions,
    logic: state.logic,
    canUseLogic: !!state.user.canUseLogic,
    organizationAdmin: !!state.user.organizationAdmin
  }),
  dispatch => bindActionCreators({
    ...uiActions,
    ...logicActions,
  }, dispatch)
)
export default class LogicButton extends Component {

  constructor(props) {
    super(props);
  }

  openUpgrade(){
    window.open("/v-app/#/organization/settings", "_blank");
  }

  getLogicButtonId() {

    const { questionId, id } = this.props;
    return '_' + questionId + '_' + id + '_logic';
  }

  handleClickOutside() {
    const { selectLogic, selectedLogic, id } = this.props;
    if (selectedLogic === id) selectLogic(null);
  }

  renderPopover(anchor) {
    if (!anchor) return null;
    const { questions, questionId, id, selectedQuestion, selectedLogic, selectLogic,
      activeLanguage, logic, setLogic } = this.props;
    if (questionId !== selectedQuestion || id !== selectedLogic) return;

    const index = _.findIndex(questions, {questionId});
    const questionsAfter = questions.slice(index + 1);

    let selected = null;
    if (logic[selectedQuestion] && logic[selectedQuestion][id]) {
      selected = logic[selectedQuestion][id];
    }

    return <Popover
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      targetOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorEl={anchor}
      onRequestClose={ () => this.handleClickOutside() }
      open
           >
      <Menu onChange={(event, value) => { setLogic(selectedQuestion, id, value); selectLogic(null);} }>
        <MenuItem value={null} disabled>{tr('Skip to question:')}</MenuItem>
        <MenuItem value={null} checked={selected === null}>{tr('Next')}</MenuItem>
        {questionsAfter.map((q, i) =>
          <MenuItem key={q.questionId} value={q.questionId} checked={selected === q.questionId}>
            {i + index + 2}. {q.heading[activeLanguage] || '-'}
          </MenuItem>
        )}
        <MenuItem value="end" checked={selected === 'end'}>{tr('End')}</MenuItem>
      </Menu>
    </Popover>
  }

  render() {
    const { selectLogic, logic, questionId, questions, id, selectedLogic, fontColorIsWhite, canUseLogic, organizationAdmin } = this.props;
    
      const className = this.props.className || '';
      let questionNumbers = _.reduce(questions.map((v, k) => ({ [v.questionId]: k + 1 })), _.extend);
      let selected = id === selectedLogic;
      let logicValue = false;
      if (logic[questionId] && logic[questionId][id]) {
        logicValue = logic[questionId][id];
      }
      if (logicValue in questionNumbers) logicValue = questionNumbers[logicValue];
      if(logicValue == 'end') logicValue = "X";
      if(logicValue) logicValue = <div className={style.logicLabel}>{logicValue}</div>;
      if(fontColorIsWhite) var iconStyle = style.iconWhite;

      const iconContent = (
        <div>
            <i className={"material-icons "+(iconStyle || style.icon)}>low_priority</i>
            { logicValue || '\u00A0'}
          </div>
      )

      if (canUseLogic) {
        return <div className={className}>
            <div className={style.main} onClick={event => {
                this.anchor = event.currentTarget;
                selectLogic(selected ? null : id);
              }}>
              {iconContent}
            </div>

            {this.renderPopover(this.anchor)}
          </div>;
      } else {
        return <Tooltip placement="left" trigger={["click"]} overlay={<div style={{ maxWidth: "230px" }}>
                <h5>Skipping Logic</h5>
                <p className={style.teaserSubtitle}>Available in the Growth Plan</p>
                <p>
                  Each question and response option has a button where you can decide which questions
                  are triggered by which responses. Meaning that the next question in your survey can
                  change depending on the response given to the previous question.
                </p>
                <p style={{textAlign: "center"}}>
                {organizationAdmin ? 
                
                  <RaisedButton primary style={{ color: "#fff" }} onClick={this.openUpgrade}>
                    <div style={{padding: "0 1em"}}>Upgrade plan to use skipping logic</div>
                  </RaisedButton> : ""}
                  </p>
              </div>}>
            <div className={className}>
              <div className={style.main}>{iconContent}</div>
            </div>
          </Tooltip>;
      }
  }



}
