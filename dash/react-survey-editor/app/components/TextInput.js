import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import * as uiActions from '../modules/ui';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import style from './styles/TextInput.scss';
import Textarea from 'react-textarea-autosize';
import FlagButton from './FlagButton';
const reg = /\n/g;
@connect(
  state => ({
    focusedInput: state.ui.focusedInput,
  }),
  dispatch => bindActionCreators({
    ...uiActions,
  }, dispatch)
)
export default class TextInput extends Component {
  static propTypes = {
    focusInput: PropTypes.func.isRequired,
    unfocusInput: PropTypes.func.isRequired,
    focusedInput: PropTypes.string.isRequired,

    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    style: PropTypes.object,
  }

  componentDidUpdate() {
    const { focusedInput, id } = this.props;
    if (focusedInput === id) this.input.focus();
  }
  componentDidMount() {
    const { focusedInput, id } = this.props;
    if (focusedInput === id) this.input.focus();
  }

  renderTextarea() {
    const { id, value, onChange, placeholder, unfocusInput, focusInput,
       focusedInput, viewClass, editClass, align } = this.props;

    return <Textarea
      onBlur={ () => unfocusInput(id) }
      minRows={1}
      ref = { (ref) => {this.input = ref;}}
      value={value }
      onChange={(e) => {
        onChange(e.target.value.replace(reg,''))
      }}

      onKeyPress= { (e) => {
        if(e.charCode === 13) e.preventDefault();
      }}

      className={ classNames(editClass, style.edit) }
    />
  }

  renderView() {
    const { id, value, onChange, placeholder, unfocusInput, focusInput,
       focusedInput, viewClass, editClass, align } = this.props;
       let placeholderClass = '';
       if (!value) placeholderClass = style.placeholder;

       if(!value && placeholder) {
         var match;
         if(match = placeholder.match(/^\[(..)\]:\s*(.+)$/)) {
           return <span className={classNames(viewClass, style.view, placeholderClass)}>
             <FlagButton lang={match[1]} extraSmall/>
             <span>{match[2]}</span>
             </span>;

         }
       }

    return <span className={classNames(viewClass, style.view, placeholderClass)}> {value || placeholder || '\u00A0'}</span>;

  }


  render() {
    const { id, value, onChange, placeholder, unfocusInput, focusInput,
       focusedInput, viewClass, editClass, align } = this.props;
    let textAlign;
    if (align && align === 'left'){
      textAlign = style.left;
    } else {
      textAlign = style.center;
    }



    let field = (id === focusedInput ) ? this.renderTextarea() : this.renderView();

    return (
      <div onClick={() => focusInput(id)} className={textAlign}>
        {field}
      </div>
    );

  }

}
