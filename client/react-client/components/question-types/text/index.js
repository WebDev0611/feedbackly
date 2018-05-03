import React from 'react';
import zepto from 'npm-zepto';
import {get} from 'lodash'
import { onTap } from 'utils/events';
import NextButton from 'components/next-button';
import * as pluginClient from 'utils/plugin-client';

let TextQuestion = (props) => {
  let textArea;

  const onSubmit = () => {
    const id = props.question._id;
    if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){

      const content = textArea.value;

      if(content.replace(/ /g, '').length > 0) {
        props.onFbevent({ data: [content.replace(/<(?:.|\n)*?>/gm, '')] });
      }

      props.onNext();
    }
  }

  const { udid, language, question } = props;

  const onBlur = () => {
    zepto(window).scrollTop(0);
    pluginClient.postMessage({action: 'focusEnd', meta: {udid}})
  }

  const onFocus = () => {
    pluginClient.postMessage({action: 'focusStart', meta: {udid}})
  }

  const onTouchStart = (e) => {
    e.preventDefault()
    if(document.activeElement.type !== 'textarea'){
      zepto(textArea).focus();
    }
  }
  return (
    <div className="text-question-wrapper">
      <div className="section">
        <textarea
          ref={node => {
            textArea = node;
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchStart}
          onChange={props.onInteract}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={get(question, `placeholder["${language}"]`)}
        >
        </textarea>
      </div>
      <div className="section">
        <NextButton {...onTap(onSubmit)}/>
      </div>
    </div>
  );
}

export default TextQuestion;
