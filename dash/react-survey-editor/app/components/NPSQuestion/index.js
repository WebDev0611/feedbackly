import React, { Component } from 'react';
import TextInput from '../TextInput';
import _ from 'lodash';
import style from './style.scss';
import LogicButton from '../../containers/LogicButton';
export default class NPSQuestion extends Component {
  render() {
    const { question } = this.props;
    let b = _.range(0, 11);
    return (
      <div className={style.main}>
        {b.map(z => {
          return <div className={style.button} key={z}>
            <div className={style.circle}>{z}</div>
            <LogicButton questionId={question.questionId} id={z} className={style.logicPosition} />
          </div>

        })}

      </div>
    )

  }
}
