import React from 'react';
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import classNames from 'classnames';
import TextInput from '../TextInput';
import LogicButton from '../../containers/LogicButton';
import style from './style.scss';

export default class Word extends React.PureComponent {
  render() {
    const {
      id,
      questionId,
      inputId,
      onChange,
      onRemove,
      value,
      isDragging,
      className,
      placeholder,
    } = this.props;
    const opacity = {
      opacity: isDragging ? 0.1 : 1,
      position: 'relative',
      width: '100%',
      padding: '0 0.8em',
    };
    return (
      <div style={opacity}>
        <div className={classNames(style.inner, className)}>
          <TextInput
            id={inputId}
            value={value}
            placeholder={placeholder}
            onChange={text => onChange(id, text)}
            viewClass={style.viewInput}
            editClass={style.editInput}
          />
          <FAB mini className={style.delete} backgroundColor="#fe767c" onClick={() => onRemove(id)}>
            <FontIcon className="material-icons">delete</FontIcon>
          </FAB>
          <LogicButton
            className={style.logic}
            fontColorIsWhite
            questionId={questionId}
            id={id}
          />
        </div>
      </div>
    );
  }
}
