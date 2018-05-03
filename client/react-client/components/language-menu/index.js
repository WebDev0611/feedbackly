import React from 'react';
import ReactDOM from 'react-dom';
import zepto from 'npm-zepto';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { get } from 'lodash';
import className from 'classnames';

import { setLanguage } from 'state/language';
import { startAndsetTimerToQuestionTimeout } from 'state/timer';
import { hideLanguageMenu } from 'state/language-menu';
import { onTap, getTapEventName } from 'utils/events';

import { activeCardSelector } from 'selectors/active-card';
import { getCountryCodeFromLanguage } from 'utils/flags'

const mapLanguageToFlagClass = language => {
  return `flag-icon flag-icon-${getCountryCodeFromLanguage(language)} flag-icon-squared cursor-pointer`;
}

class LanguageMenu extends React.Component {
  constructor(props) {
    super(props);

    this._onHide = this._onHide.bind(this);
  }

  _onLanguageButtonClick(language) {
    this.props.onChooseLanguage(language);
  }

  _onHide(e) {
    const container = ReactDOM.findDOMNode(this.refs.flagContainer);

    if(e.target === container || container.contains(e.target)) {
      return;
    }

    this.props.onHide();
  }

  _removeEvents() {
    zepto(document).off(getTapEventName(), this._onHide)
  }

  _addEvents() {
    let timeout = setTimeout(() => {
      clearTimeout(timeout);

      zepto(document).on(getTapEventName(), this._onHide)
    }, 500);
  }

  _renderLanguageButtons() {
    const { surveyLanguages, activeLanguage } = this.props;

    return surveyLanguages.map((language, index) => {
      let classes = className(mapLanguageToFlagClass(language), { 'active': language === activeLanguage }, 'scale-in', 'stagger', `stagger-${index}`);

      return (
        <span {...onTap(() => this._onLanguageButtonClick(language))} className={classes} key={language}></span>
      );
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isOpen === true) {
      this._addEvents();
    } else {
      this._removeEvents();
    }
  }

  render() {
    const { isOpen } = this.props;

    let display = isOpen === true
      ? (
        <div className="language-menu" key={'languageMenu'}>
          <div className="flag-container" ref="flagContainer">
            {this._renderLanguageButtons()}
          </div>
        </div>
      )
      : null;

    return (
      <ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
        {display}
      </ReactCSSTransitionGroup>
    );
  }
}

LanguageMenu.propTypes = {
  onChooseLanguage: React.PropTypes.func.isRequired,
  onHide: React.PropTypes.func.isRequired,
  surveyLanguages: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  activeLanguage: React.PropTypes.string,
  isOpen: React.PropTypes.bool
}

const mapDispatchToProps = dispatch => {
  return {
    onChooseLanguage: language => {
      dispatch(setLanguage(language));
      dispatch(hideLanguageMenu());
      dispatch(startAndsetTimerToQuestionTimeout());
    },
    onHide: () => {
      dispatch(hideLanguageMenu());
    }
  }
}

const mapStateToProps = state => {
  const isOpen = state.languageMenu.isOpen;

  return {
    surveyLanguages: state.survey.languages,
    activeLanguage: state.language,
    isOpen
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguageMenu);
