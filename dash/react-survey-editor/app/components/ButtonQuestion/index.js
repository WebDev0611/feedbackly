import React from 'react';
import _ from 'lodash';
import TextInput from '../TextInput';
import LogicButton from '../../containers/LogicButton';
import style from './style.scss';
import placeholder from './faces/placeholder.png';
import { getFallbackText } from '../../utils';

const ButtonQuestion = (props) => {
  const { question, activeLanguage, changeButton, languages } = props;
  const toggleState = question.choices.length === 5;
  const buttonStyles = _.get(question, 'opts.buttonStyle');
  const classes = [];
  _.forEach(buttonStyles, (val, key) => {
    if (key && val) classes.push(key);
  });
  const imageStyle = _.camelCase(classes.sort().join(' '));
  const amountClass = toggleState ? 'five' : 'four';

  return (
    <div className={style.main}>
      <div className={style.faceContainer}>
        {_.reverse(
          question.choices.map((c, num) =>
            (<div className={style.button} key={c.id}>
              <LogicButton className={style.logic} questionId={question.questionId} id={c.id} />
              <div className={style[`i${imageStyle}${num}${amountClass}`]}>
                <img src={placeholder} className={style.placeholder} alt={placeholder} />
              </div>

              <div className={style[`label${num}${amountClass}`]}>
                <TextInput
                  editClass={style.labelEdit}
                  id={`${question.questionId}-${c.id}`}
                  placeholder={getFallbackText(c.text, languages)}
                  value={c.text[activeLanguage] || ''}
                  onChange={val => changeButton(question.questionId, c.id, activeLanguage, val)}
                />
              </div>
            </div>),
          ),
        )}
      </div>
    </div>
  );
};

export default ButtonQuestion;
