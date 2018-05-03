import React from 'react';
import zepto from 'npm-zepto';
import { connect } from 'react-redux';
import * as pluginClient from 'utils/plugin-client';

import { onTap } from 'utils/events';

import { setNextButtonDisabledStatus } from 'state/view';

import NextButton from 'components/next-button';
import Checkbox from 'components/checkbox';
import HorizontalForm from 'components/horizontal-form';
import HorizontalFormItem from 'components/horizontal-form/horizontal-form-item';
var fieldValues = {};


class UpsellQuestion extends React.Component {
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
    const { question, language, udid } = this.props;
    const props = this.props;
    const onSubmit = () => {
      const id = props.question._id;
      if(props.feedbacksMap === undefined || props.feedbacksMap[id] === undefined){
        const fieldsWithData = Object.keys(fieldValues);
        if(fieldsWithData.length > 0) {
          props.onFbevent({ data: fieldsWithData.map(field => { return { id: field, data: fieldValues[field] } }) });
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
        fieldContent = (
          <div className="form-group" key={field.id}>
            <input type="text" ref = { node => { if(node) this.textfieldRefs[field.id] = node; } }
              onChange={e => onFieldChange(field.id, e.target.value)} placeholder={field.text[language].toUpperCase()} onBlur={onBlur(index)} onFocus={onFocus(index)}/>
          </div>
        );

        horizontalFormItemProps = Object.assign({}, horizontalFormItemProps, { placeholder: field.data, showTutorial: true });
      }

      return fieldContent;
    }

    const contactFields = question.choices
    .map(getContactField);

    const contactContainer = contactFields;

    const nextButton = props.showNextButton
    ? <NextButton {...onTap(onSubmit)}/>
    : null;

    return (
      <div className="contact-question-wrapper upsell">
        {contactContainer}
        {nextButton}
      </div>
    );
  }
}


const mapStateToProps = state => {
  const { view } = state;

  return {
    isHorizontal: false,
    showNextButton: true
  }
}

const mapDispatchToProps = dispatch => ({
  onHideNextButton: () => dispatch(setNextButtonDisabledStatus(true)),
  onShowNextButton: () => dispatch(setNextButtonDisabledStatus(false))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpsellQuestion);
