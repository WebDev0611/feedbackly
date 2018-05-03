import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import DnDWrapper from '../../utils/DnDWrapper';
import WWord from './Word';
import './style.scss';
import tr from '../../utils/translate';
import { getFallbackText } from '../../utils';
import AddButton from '../AddButton';

const Word = DnDWrapper(WWord, 'word'); // , style === 'oneColumn' ? 'center' : 'inline');

export default class WordQuestion extends Component {
  static propTypes = {
    question: PropTypes.shape.isRequired,
    activeLanguage: PropTypes.string.isRequired,
  };

  onChange = (wordId, text) => {
    const { question, changeWord, activeLanguage } = this.props;
    changeWord(question.questionId, wordId, activeLanguage, text);
  };
  onRemove = (wordId) => {
    const { question, removeWord } = this.props;
    removeWord(question.questionId, wordId);
  };

  render() {
    const { question, addWord, moveWord, activeLanguage, clear, languages } = this.props;

    const amount = question.choices.length;
    let style = 'col l8 offset-l2 s12';
    if (amount > 6) style = 'col l6 s12';
    if (amount > 12) style = 'col l4 s12';
    if (amount > 32) style = 'col l3 s12';

    const canAdd = amount < 32;
    const addButton =
      canAdd && <AddButton text={tr('Add choice')} onClick={() => addWord(question.questionId)} />;

    return (
      <div>
        <div className={'row'}>
          {question.choices.map(w =>
            (<div className={style} key={w.id}>
              {' '}<Word
                id={w.id}
                inputId={question.questionId + w.id}
                value={w.text[activeLanguage] || ''}
                placeholder={getFallbackText(w.text, languages)}
                dragTitle={w.text[activeLanguage] || ''}
                onChange={this.onChange}
                onRemove={this.onRemove}
                questionId={question.questionId}
                clear={clear}
                moveItem={(dragId, targetId) => {
                  if (!_.isUndefined(targetId)) moveWord(question.questionId, dragId, targetId);
                }}
              />
            </div>),
          )}
        </div>
        {
          <div className="center-align">
            {addButton}
          </div>
        }
      </div>
    );
  }
}
