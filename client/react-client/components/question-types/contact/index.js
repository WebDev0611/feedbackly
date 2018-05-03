import React from 'react';
import zepto from 'npm-zepto';
import { connect } from 'react-redux';
import * as pluginClient from 'utils/plugin-client';
import {get} from 'lodash';
import { onTap } from 'utils/events';

import { setNextButtonDisabledStatus } from 'state/view';

import NextButton from 'components/next-button';
import Checkbox from 'components/checkbox';
import HorizontalForm from 'components/horizontal-form';
import HorizontalFormItem from 'components/horizontal-form/horizontal-form-item';
var fieldValues = {};


class ContactQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.textfieldRefs = {};
  }

  componentWillUnmount() {
    for(let id in this.textfieldRefs) {
      this.textfieldRefs[id].blur();
    }
  }

  render () {
    const props = this.props;
    const { question, language, udid } = this.props;

    const onSubmit = () => {
      const id = props.question._id;
      if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){
        const fieldsWithData = Object.keys(fieldValues);
        if(fieldsWithData.length > 0) {
          props.onFbevent({ data: fieldsWithData.map(field => { 
            const subType = get(question.choices.filter(choice => choice.id === field), '[0].subtype')
            return { 
              id: field, data: fieldValues[field], subType
            } 
          }) });
        }
        fieldValues = {};
        props.onNext();
      }
    }


    const onFieldChange = (id, value) => {
      props.onInteract();

      let content = value;
      const hasContent = typeof content === 'boolean' || (typeof content === 'string' && content.replace(/ /g, '').length > 0);

      if(hasContent) {
        fieldValues[id] = value;
      } else {
        delete fieldValues[id];
      }
    }

    const onFocus = index => () => {
      if(props.isHorizontal && index !== question.choices.length - 1) {
        props.onHideNextButton();
      }
      pluginClient.postMessage({action: 'focusEnd', meta: {udid}})

    }

    const onBlur = index => () => {
      if(props.isHorizontal) {
        props.onShowNextButton();

        zepto(window).scrollTop(0);
      }
      pluginClient.postMessage({action: 'focusEnd', meta: {udid}})

    }

    const onHorizontalFormIndexChange = index => {
      if(index === question.choices.length - 1) {
        props.onShowNextButton();
      }
    }

    const withHorizontalFormItem = props => content => {
      return (
        <HorizontalFormItem {...props}>
          {content}
        </HorizontalFormItem>
      );
    }

    const getContactField = (field, index) => {
      if(field.hidden === true) return;
      let fieldContent;
      let horizontalFormItemProps = { key: field.id };

      if(field.type === 'boolean') {
        fieldContent = (
          <div className="form-group" key={field.id}>
            <Checkbox onChange={value => onFieldChange(field.id, value)}>
              {field.text[language]}
            </Checkbox>
          </div>
        );
      } else {
        const type = field.subtype ? field.subtype : 'text'
        fieldContent = (
          <div className="form-group" key={field.id}>
            <input type={type} ref = { node => { if(node) this.textfieldRefs[field.id] = node; } }
              onChange={e => onFieldChange(field.id, e.target.value)} placeholder={field.text[language].toUpperCase()} onBlur={onBlur(index)} onFocus={onFocus(index)}/>
          </div>
        );

        horizontalFormItemProps = Object.assign({}, horizontalFormItemProps, { placeholder: field.text[language], showTutorial: true });
      }

      return props.isHorizontal
      ? withHorizontalFormItem(horizontalFormItemProps)(fieldContent)
      : fieldContent;
    }

    const contactFields = question.choices
    .map(getContactField);

    const contactContainer = props.isHorizontal
    ? (
      <HorizontalForm onIndexChange={onHorizontalFormIndexChange} onInteract={props.onInteract}>
        {contactFields}
      </HorizontalForm>
    )
    : contactFields;

    const nextButton = props.showNextButton
    ? <NextButton {...onTap(onSubmit)}/>
    : null;

    return (
      <div className="contact-question-wrapper">
        {contactContainer}
        {nextButton}
      </div>
    );
  }
}


const mapStateToProps = state => {
  const { view } = state;

  return {
    isHorizontal: view.decorators.IPAD,
    showNextButton: !view.nextButtonIsDisabled
  }
}

const mapDispatchToProps = dispatch => ({
  onHideNextButton: () => dispatch(setNextButtonDisabledStatus(true)),
  onShowNextButton: () => dispatch(setNextButtonDisabledStatus(false))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactQuestion);
