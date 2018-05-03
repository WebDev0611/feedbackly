import React from 'react';
import TextInput from './TextInput';
import style from './styles/QuestionHeader.scss';
import tr from '../utils/translate';

// moved from class to pure function
const QuestionHeader = ({
  questionId,
  heading,
  subtitle,
  headingPlaceholder,
  subtitlePlaceholder,
  onChangeTitle,
  onChangeSubtitle,
}) =>
  (<div className={style.main}>
    <TextInput
      id={`${questionId}_TITLE`}
      value={heading}
      placeholder={headingPlaceholder || tr('Heading')}
      onChange={e => onChangeTitle(e)}
      editClass={style.heading_edit}
      viewClass={style.heading_view}
    />

    <hr className={style.hr} />
    <TextInput
      id={`${questionId}_SUBTITLE`}
      value={subtitle}
      placeholder={subtitlePlaceholder || tr('Subtitle')}
      onChange={e => onChangeSubtitle(e)}
      editClass={style.subtitle_edit}
      viewClass={style.subtitle_view}
    />
  </div>);

export default QuestionHeader;
