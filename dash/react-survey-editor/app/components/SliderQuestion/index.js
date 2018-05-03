import React, { PureComponent } from 'react';
import TextInput from '../TextInput';
import { Toggle } from 'material-ui';
import DnDWrapper from '../../utils/DnDWrapper';
import LogicButton from '../../containers/LogicButton';
import _ from 'lodash';
import style from './style.scss';
import { RaisedButton, FontIcon } from 'material-ui';
import FAB from 'material-ui/FloatingActionButton';
import classNames from 'classnames';
import { getFallbackText } from '../../utils';
import tr from '../../utils/translate';
import AddButton from '../AddButton';

class Slider extends PureComponent {
  render() {
    const { question, choice, activeLanguage, changeSlider, isDragging, onRemove, languages } = this.props;
    const opacity = { opacity: isDragging ? 0.1 : 1 }
    let deleteButton = <FAB mini className={style.delete} backgroundColor="#fe767c" onClick={() => onRemove(question.questionId, choice.id)}>
      <FontIcon className="material-icons">delete</FontIcon>
    </FAB>;

    let className = classNames(style.slider, 'col l3 m6 s12 center-align');

    return (<div className={className} key={choice.id} style={opacity}>
      <div>
        <div className={style.preview} >
          { deleteButton }
        </div>
        <TextInput
          id={question.questionId + '-' + choice.id}
          value={choice.text[activeLanguage] || ''}
          placeholder={getFallbackText(choice.text, languages) || '...'}
          onChange={(val) => changeSlider (question.questionId, choice.id, activeLanguage, val)} />

      </div>
    </div>
    )

  }

}

let DNDSlider = DnDWrapper(Slider, 'Slider');
export default class SliderQuestion extends PureComponent {
  render() {
    const { question, activeLanguage, addSlider, removeSlider, moveSlider, changeSlider, clear, languages } = this.props;
    const canAdd = question.choices.length < 4;

    const addButton = canAdd && <AddButton text={tr('Add slider')} onClick={() => addSlider(question.questionId)}/>
    return (
      <div className={style.main}>
        <div className="row">
          {
            question.choices.map((c, num) => <DNDSlider
              id={c.id}
              key={c.id}
              question={question}
              choice={c}
              activeLanguage={activeLanguage}
              languages={languages}
              changeSlider={changeSlider}
              onRemove={removeSlider}
              clear={clear}
              moveItem={(dragId, targetId) =>
                { _.isUndefined(targetId) || moveSlider(question.questionId, dragId, targetId)}}
              dragTitle={c.text[activeLanguage] || ''}
                                             />)
          }

        </div>
        <div className="center-align">
          <div>
            { addButton }
          </div>
          <div className={style.submit}>

            <LogicButton
              className={style.submitlogic}
              questionId={question.questionId}
              id="submit" />
          </div>
        </div>

      </div>
    )

  }
}
