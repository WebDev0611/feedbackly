import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Collapse from 'react-collapse';
import { FloatingActionButton, Slider, FontIcon } from 'material-ui';
import * as uiActions from '../modules/ui';
import EditableList from '../components/EditableList';
import TextQuestion from '../components/TextQuestion';
import ButtonQuestion from '../components/ButtonQuestion';
import WordQuestion from '../components/WordQuestion';
import SliderQuestion from '../components/SliderQuestion';
import NPSQuestion from '../components/NPSQuestion';
import ContactQuestion from '../components/ContactQuestion';
import ImageQuestion from '../components/ImageQuestion';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionHeader from '../components/QuestionHeader';
import questionTypeModules from '../modules/questiontypes';
import * as questionActions from '../modules/question';
import tr from '../utils/translate';
import style from './styles/QuestionContainer.scss';
import ToggleList from '../components/ToggleList';
import { getFallbackText } from '../utils';
@connect(
  // available under state.question
  state => ({
    focusedInput: state.ui.focusedInput,
    activeLanguage: state.ui.activeLanguage,
    selectedLogic: state.ui.selectedLogic,
    languages: state.languages,
    logic: state.logic,
    imageDialog: state.ui.imageDialog,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.merge({}, ...questionTypeModules.map(t => t.actions)),
        ...questionActions,
        ...uiActions,
      },
      dispatch,
    ),
)
export default class QuestionContainer extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    changeTitle: PropTypes.func.isRequired,
    changeSubtitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { deletePrompt: null, showAdvancedOptions: false };
  }

  toggleAdvancedSettings() {
    this.setState({ showAdvancedOptions: !this.state.showAdvancedOptions });
  }

  renderContent() {
    const {
      question,
      activeLanguage,
      clear,
      moveChoice,
      changeChoice,
      removeChoice,
      addChoice,
      languages,
    } = this.props;

    const commonProps = { question, activeLanguage, languages, clear };

    const confirmRemove = (questionId, choiceId) => {
      if (_.find(question.choices, { id: choiceId }).has_feedback) {
        this.setState({ deletePrompt: choiceId });
      } else removeChoice(questionId, choiceId);
    };

    switch (question.type) {
      case 'Word': {
        return (
          <WordQuestion
            addWord={addChoice}
            removeWord={confirmRemove}
            moveWord={moveChoice}
            changeWord={changeChoice}
            {...commonProps}
          />
        );
      }
      case 'Text': {
        const { setPlaceholder } = this.props;
        return <TextQuestion setPlaceholder={setPlaceholder} {...commonProps} />;
      }

      case 'Button': {
        const { setButtonCount } = this.props;
        return (
          <ButtonQuestion
            {...commonProps}
            setButtonCount={setButtonCount}
            changeButton={changeChoice}
          />
        );
      }

      case 'NPS':
        return <NPSQuestion question={question} {...commonProps} />;
      case 'Slider':
        return (
          <SliderQuestion
            {...commonProps}
            addSlider={addChoice}
            moveSlider={moveChoice}
            removeSlider={confirmRemove}
            changeSlider={changeChoice}
          />
        );
      case 'Contact':
      case 'Upsell': {
        const { addTextQuestion, addBooleanQuestion, addEmailQuestion, addPhoneQuestion } = this.props;
        return (
          <ContactQuestion
            addTextQuestion={addTextQuestion}
            addBooleanQuestion={addBooleanQuestion}
            addEmailQuestion={addEmailQuestion}
            addPhoneQuestion={addPhoneQuestion}
            moveRow={moveChoice}
            removeRow={confirmRemove}
            changeRow={changeChoice}
            upsell={question.type === 'Upsell'}
            {...commonProps}
          />
        );
      }

      case 'Image': {
        const { showImageDialog, closeImageDialog, imageDialog } = this.props;
        return (
          <ImageQuestion
            showImageDialog={showImageDialog}
            closeImageDialog={closeImageDialog}
            imageDialog={imageDialog}
            addImage={addChoice}
            removeImage={confirmRemove}
            moveImage={moveChoice}
            changeImage={changeChoice}
            {...commonProps}
          />
        );
      }

      default:
        return <div>Select a thing</div>;
    }
  }

  renderOptions = () => {
    const { question, setButtonCount, setOpt, setWordQuestionType } = this.props;
    let toggles;
    switch (question.type) {
      case 'Button':
        toggles = [
          {
            onLabel: `5 ${tr('emoticons')}`,
            offLabel: `4 ${tr('emoticons')}`,
            toggled: question.choices.length !== 4,
            onToggle: flag => setButtonCount(question.questionId, flag ? 5 : 4),
          },
          {
            label: tr('Emoticon style'),
            toggled: !_.get(question, 'opts.buttonStyle.plain'),
            onToggle: flag => setOpt(question.questionId, 'buttonStyle.plain', !flag),
          },
          /*  {
          label: tr('Animated emoticons'),
          toggled: _.get(question, 'opts.buttonStyle.animated') ? true : false,
          onToggle: (flag) => setOpt(question.questionId, 'buttonStyle.animated', flag ? true : false)
        }, */
        ];
        break;
      case 'Word':
        toggles = [
          {
            label: tr('Allow multiple choices'),
            toggled: !!_.get(question, 'opts.isMultipleChoice'),
            onToggle: flag => setOpt(question.questionId, 'isMultipleChoice', !!flag),
          },
        ];
        break;
      case 'Image':
        toggles = [
          {
            label: tr('Show image labels'),
            toggled: !!_.get(question, 'opts.show_labels'),
            onToggle: flag => setOpt(question.questionId, 'show_labels', !!flag),
          },
        ];
        break;
      default: 
        break;
    }
    if (!toggles) return null;
    return <ToggleList toggles={toggles} />;
  };
  render() {
    const {
      question,
      changeTitle,
      changeSubtitle,
      activeLanguage,
      focusedInput,
      focusInput,
      unfocusInput,
      removeChoice,
      languages,
      setProbability,
    } = this.props;
    const { deletePrompt, showAdvancedOptions } = this.state; 

    let del;
    if (deletePrompt) {
      del = (
        <ConfirmDialog
          text={tr(
            'There are feedbacks for this choice. Deleting this choice will also delete the associated feedbacks.',
          )}
          onSuccess={() => {
            this.setState({ deletePrompt: null });
            removeChoice(question.questionId, deletePrompt);
          }}
          onCancel={() => {
            this.setState({ deletePrompt: null });
          }}
        />
      );
    }
    const rangeCSS = {
      margin: '0 15px 0 0',
      display: 'inline-block',
      boxSizing: 'border-box',
      position: 'relative',
    };

    const probabilitySlider = (
      <div className="inputRange" style={rangeCSS}>
        <div>
          <Slider
            sliderStyle={{ margin: '0', position: 'relative' }}
            style={{
              width: '110px',
              margin: '0 15px',
              display: 'inline-block',
            }}
            onChange={(e, value) => {
              setProbability(question.questionId, activeLanguage, value);
            }}
            min={0}
            max={1}
            id="inputRange"
            value={question.displayProbability}
          />
          <label htmlFor="inputRange" style={{ position: 'relative', bottom: '3px' }}>
            { parseInt(question.displayProbability * 100, 10) } % { tr('Sampling') }
          </label>
        </div>
        
      </div>
    )
    
    return (
      <div className={style.main}>
        {del}

        <div style={{minHeight: '44px', padding: '10px'}}>
          <span style={{display: showAdvancedOptions ? '' : 'none' }}>
            { this.renderOptions() }
            { probabilitySlider }
          </span>
          <div role="button" className={style.advancedbutton} onClick={() => this.toggleAdvancedSettings()}>
            <FontIcon className={showAdvancedOptions ? `material-icons ${style.activeicon}` : `material-icons ${style.inactiveicon}`}>
              settings
            </FontIcon>
            {tr('Advanced settings')}
          </div>
        </div>
        
        <QuestionHeader
          activeLanguage={activeLanguage}
          questionId={question.questionId}
          heading={question.heading[activeLanguage] || ''}
          headingPlaceholder={getFallbackText(question.heading, languages) || ''}
          subtitle={question.subtitle[activeLanguage] || ''}
          subtitlePlaceholder={getFallbackText(question.subtitle, languages)}
          onChangeTitle={text => changeTitle(question.questionId, activeLanguage, text)}
          onChangeSubtitle={text => changeSubtitle(question.questionId, activeLanguage, text)}
        />
        {this.renderContent()}
      </div>
    );
  }
}
