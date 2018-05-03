import React, { Component, PropTypes } from 'react';
import update from 'immutability-helper';
import { FontIcon } from 'material-ui';
import classNames from 'classnames';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as questionActions from '../modules/questions';
import * as uiActions from '../modules/ui';
import EditableList from '../components/EditableList';
import AddQuestion from './AddQuestion';
import * as pendingQuestionMoveActions from '../modules/questionorder';
import QuestionContainer from './QuestionContainer';
import tr from '../utils/translate';
import * as propertiesActions from '../modules/properties';
import TextInput from '../components/TextInput';
import ConfirmDialog from '../components/ConfirmDialog';
import style from './styles/QuestionsContainer.scss';
import headerStyle from '../components/styles/QuestionHeader.scss';
import { getFallbackText } from '../utils';
import { missingTranslations } from '../modules/selectors';
import { dict as QUESTIONS } from '../constants/questions';
import { deleteQuestionPointerInLogic } from '../modules/logic'
import sanitizeHtml from 'sanitize-html';

import ReactQuill from 'react-quill'; // ES6
import './styles/quill.snow.scss'; // ES6

@connect(
  state => ({ questions: state.questions, ui: state.ui, properties: state.properties, languages: state.languages,
    missingTranslations: missingTranslations(state)
   }),
  dispatch => bindActionCreators({ ...questionActions, ...uiActions,
          ...pendingQuestionMoveActions, ...propertiesActions, deleteQuestionPointerInLogic }, dispatch)
)
export default class QuestionsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { deletePrompt: null };
  }

  onAdd(type) {
    const { createQuestion } = this.props;
    createQuestion(type);
  }

  onMove(q) {
    const { moveQuestion } = this.props;
    moveQuestion(q, 0);
  }

  renderQuestionHeaderRow(question, index) {
    const { ui: { activeLanguage }, missingTranslations } = this.props;
    const missing = activeLanguage in missingTranslations.questions[question.questionId];
    return (
      <div className="row" style={{ margin: '0px' }}>
        <div className="col s11">
          <div className={style.badgewrapper}>
            <FontIcon className={classNames('material-icons', style.rowIcon)}>
              {QUESTIONS[question.type].icon}
            </FontIcon>
            {missing && <div className={style.badge}>!</div>}
          </div>

          <b>
            {index + 1}.{' '}
            {question.heading[activeLanguage] ||
              <span style={{ color: 'gray' }}>
                {tr('Question title is blank')}
              </span>}
          </b>
        </div>
        <div className="col s1">
          <FontIcon
            className={classNames('material-icons', 'grey-text', style.rowIcon, 'right')}
            onClick={(e) => {
              e.stopPropagation();
              this.setState({ deletePrompt: question.questionId });
            }}
          >
            delete
          </FontIcon>
        </div>
      </div>
    );
  }

  renderEndHeaderRow() {
    const {
      questions,
      ui: { activeLanguage },
      properties: { end_screen_text },
      languages,
      missingTranslations,
    } = this.props;
    const missing = activeLanguage in missingTranslations.questions.end;
    return (
      <div style={{ paddingLeft: '.75rem' }}>
        <div className={style.badgewrapper}>
          <FontIcon className={classNames('material-icons', style.rowIcon)}>flag</FontIcon>
          {missing && <div className={style.badge}>!</div>}
        </div>

      <b>{tr('End of survey')}: {sanitizeHtml(end_screen_text[activeLanguage] || '', {allowedTags: []})}</b>
    </div>)
  }

  renderEndContent() {
    const {
      properties: { end_screen_text },
      ui: { activeLanguage },
      setEndScreen,
      languages,
    } = this.props;

return ( <div className={style.endContainer}>
      <ReactQuill
      modules={{toolbar: ['link']}}
      value={end_screen_text[activeLanguage]}
      onChange={e => {
        const oldValue = sanitizeHtml(end_screen_text[activeLanguage], {allowedTags:[]});
        const newValue = sanitizeHtml(e, {allowedTags: []})
        if(end_screen_text[activeLanguage] === undefined) return setEndScreen(activeLanguage, e)
        if(e === "<p><br></p>") return;
        if(oldValue.indexOf(newValue) > -1 || newValue.indexOf(oldValue) > -1){
          setEndScreen(activeLanguage, e)
        }
      }} />
    
     
      </div>
)
  }

  renderDelete() {
    const { deleteQuestion, questions, deleteQuestionPointerInLogic } = this.props;
    const { deletePrompt } = this.state;
    const question = _.find(questions, { questionId: deletePrompt });
    const text = question.has_feedback ?
      tr('Are you sure you want to delete this question? The question has received responses that you won\'t be able to see anymore if you delete it.') :
      tr('Are you sure?');
    return (<ConfirmDialog
      text={text}
      onCancel={() => this.setState({ deletePrompt: null })}
      onSuccess={() => { 
        deleteQuestionPointerInLogic(deletePrompt)
        this.setState({ deletePrompt: null });
        deleteQuestion(deletePrompt);
      }}
    />);
  }

  render() {
    const {
      ui: { selectedQuestion, activeLanguage, pendingQuestionOrder: order },
      selectQuestion,
      pendingQuestionMove,
      deleteQuestion,
      pendingQuestionMoveDrop,
      clear,
      languages,
      children,
    } = this.props;
    const { deletePrompt } = this.state;

    let del = null;
    if (deletePrompt) {
      del = this.renderDelete();
    }

    let { questions } = this.props;
    if (order) {
      questions = order.map(id => _.find(questions, { questionId: id }));
    }

    const elems = questions.map((q, index) => ({
      key: q.questionId,
      header: this.renderQuestionHeaderRow(q, index),
      content: <QuestionContainer question={q} />,
    }));

    elems.push({ key: 'end', header: this.renderEndHeaderRow(), content: this.renderEndContent() });

    return (
      <div>
        {del}
        <EditableList
          selectedKey={selectedQuestion}
          elements={elems}
          onSelect={selectQuestion}
          onMove={pendingQuestionMove}
          onMoveEnd={pendingQuestionMoveDrop}
          clear={clear}
        >
          {children}
        </EditableList>
        <div className="center-align">
          {' '}<AddQuestion />{' '}
        </div>
      </div>
    );
  }
}
