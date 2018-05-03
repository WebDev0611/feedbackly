import React, { Component } from 'react';
import TextInput from '../TextInput';
import _ from 'lodash';
import style from './style.scss';
import LogicButton from '../../containers/LogicButton';
import { Popover, Menu, MenuItem, RaisedButton } from 'material-ui';
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import DnDWrapper from '../../utils/DnDWrapper';
import classNames from 'classnames';
import { getFallbackText } from '../../utils';
import tr from '../../utils/translate';
import AddButton from '../AddButton';
class Row extends Component {
  render() {
    const { id, text, onChange, type, inputId, onRemove, isDragging, placeholder, upsell } = this.props;

    let deleteButton = upsell ? null : <FAB mini className={style.delete} backgroundColor="#fe767c" onClick={() => onRemove()}>
      <FontIcon className="material-icons">delete</FontIcon>
    </FAB>;

    let rowStyle = { opacity : isDragging ? 0.2 : 1 };

    let renderTextField = (id, text, onChange, onRemove) => {
      return <div className={classNames(style.contactRow, style.textfieldrow, style.input)} style={rowStyle}>
        <TextInput id={inputId} value={text} onChange={onChange}
          editClass={style.inputEdit}
          viewClass={style.inputView}
          placeholder={placeholder}
        />
        { deleteButton }
      </div>
    }
    let renderCheckBox = (id, text, onChange, onRemove) => {
      return <div key={id} className={style.contactRow} style={rowStyle}>
        <table className={style.table}><tbody><tr>
          <td className={style.parent}>
            <div className={style.box} />
          </td>
          <td>
            <TextInput id={inputId} value={text} onChange={onChange}
              editClass={style.inputEditCheckbox}
              viewClass={style.inputViewCheckbox}
          placeholder={placeholder}
          align="left"
        />
        </td>
        </tr></tbody></table>
        { deleteButton }
      </div>
    }
    if (type === 'boolean') return renderCheckBox(id, text, onChange, onRemove);
    else return renderTextField(id, text, onChange);
  }
}
let DNDRow = DnDWrapper(Row, 'Row');
let StaticRow = Row;

export default class ContactQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleAdd = (ev) => {
    ev.preventDefault();
    this.setState({
      open: true,
      anchorEl: ev.currentTarget,
    })
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }



  render() {
    const { question, addBooleanQuestion, addTextQuestion, addEmailQuestion, addPhoneQuestion, activeLanguage,
      changeRow, moveRow, removeRow, clear, languages, upsell } = this.props;
    let menuClick = (type) => () => {
      this.handleRequestClose();
      if(type=='boolean') addBooleanQuestion(question.questionId)
      if(type=='string') addTextQuestion(question.questionId)
      if(type=='email') addEmailQuestion(question.questionId)
      if(type=='phone') addPhoneQuestion(question.questionId)
    };

    const addButton = upsell ? null : ( <div>
      <AddButton text={tr('Add')} onClick={this.handleAdd}/>
      <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={this.handleRequestClose}>

        <Menu>
          <MenuItem primaryText={tr('Text field')} onTouchTap={menuClick("string")} />
          <MenuItem primaryText={tr('Email field')} onTouchTap={menuClick("email")} />
          <MenuItem primaryText={tr('Phone number field')} onTouchTap={menuClick("phone")} />
          <MenuItem primaryText={tr('Check box')} onTouchTap={menuClick("boolean")} />
        </Menu>

      </Popover>
      <br />
    </div>);
      let Elem = upsell ? StaticRow : DNDRow;
    let choices = question.choices;
    return (
      <div>
        {
          choices.map(c => <Elem key={c.id} type={c.type}
            inputId={question.questionId + '-' + c.id} id={c.id} text={c.text[activeLanguage] || ''}
            placeholder = {getFallbackText(c.text, languages)}
            onChange={(val) => changeRow(question.questionId, c.id, activeLanguage, val)} clear={clear}
            moveItem={(dragId, targetId) => (_.isUndefined(targetId) || moveRow(question.questionId, dragId, targetId))}
            dragTitle={c.text[activeLanguage] || ''}
            onRemove={() => removeRow(question.questionId, c.id)}

            upsell={upsell}
                           />)
        }

        <div className={style.center}>

          { addButton }

          <div className={style.submit}>

            <LogicButton
              className={style.logic}
              questionId={question.questionId}
              id="submit" />
          </div>
        </div>

      </div>
    )

  }
}
