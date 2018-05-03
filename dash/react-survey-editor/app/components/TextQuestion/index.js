import React, { PureComponent } from 'react';
import TextInput from '../TextInput';
import style from './style.scss';
import LogicButton from '../../containers/LogicButton';
import { RaisedButton } from 'material-ui';
import { getFallbackText } from '../../utils';
import tr from '../../utils/translate';
export default class TextQuestion extends PureComponent {

  render() {
    const { question, activeLanguage, setPlaceholder, languages } = this.props;

    return (
      <div className={style.main}>
        <div className={style.textarea}>
          <TextInput id={question.questionId + '-open'} value={question.placeholder[activeLanguage] || ''}
            onChange={(val) => setPlaceholder(question.questionId, activeLanguage, val)}
            viewClass={style.input}
            editClass={style.inputEdit}
            placeholder={getFallbackText(question.placeholder, languages)}
          />
        </div>
        <div className={style.submit}>
          <LogicButton
            className={style.logic}
            questionId={question.questionId}
            id="submit" />
        </div>
      </div>
    )

  }
}
