import React from 'react';
import ReactDOM from 'react-dom';
import zepto from 'npm-zepto';
import className from 'classnames';
import { delay } from 'lodash';

import { onTap, hideKeyboard } from 'utils/events';

class HorizontalFormItem extends React.Component {
  constructor(props) {
    super(props);

    this._onInputFocus = this._onInputFocus.bind(this);
    this._onInputBlur = this._onInputBlur.bind(this);

    this.state = {
      showPlaceHolder: false,
      tutorialIsActive: true,
    }
  }

  _onInputFocus() {
    this.setState({
      showPlaceHolder: true,
      tutorialIsActive: false
    });
  }

  _onInputBlur() {
    this.setState({
      showPlaceHolder: false,
      tutorialIsActive: true
    });
  }

  _addBinginds() {
    const container = zepto(ReactDOM.findDOMNode(this));

    const inputs = container.find('input');

    inputs.on('focus', this._onInputFocus);
    inputs.on('blur', this._onInputBlur);
  }

  _removeBindings() {
    const container = zepto(ReactDOM.findDOMNode(this));

    const inputs = container.find('input');

    inputs.off('focus', this._onInputFocus);
    inputs.off('blur', this._onInputBlur);
  }


  _onNext() {
    if(!this.props.nextIsDisabled) {
      this.props.onNext();
    }
  }

  _onPrevious() {
    if(!this.props.previousIsDisabled) {
      this.props.onPrevious();
    }
  }

  componentDidMount() {
    this._addBinginds();
  }

  componentWillUnmount() {
    this._removeBindings();
  }

  _renderNextButton() {
    const classes = className('horizontal-form-item-direction', 'horizontal-form-item-direction-next');

    return this.props.showNext === true
      ? (
        <button className={classes} {...onTap(this._onNext.bind(this))}>
          <i className="material-icons">&#xE5C8;</i>
        </button>
      )
      : null;
  }

  _renderPreviousButton() {
    const classes = className('horizontal-form-item-direction', 'horizontal-form-item-direction-previous');

    return this.props.showPrevious === true
      ? (
        <button className={classes} {...onTap(this._onPrevious.bind(this))}>
          <i className="material-icons">&#xE5C4;</i>
        </button>
      )
      : null;
  }

  _renderPlaceholder() {
    return this.state.showPlaceHolder === true && this.props.placeholder !== undefined
      ? (
        <div className="horizontal-form-item-placeholder">
          {this.props.placeholder}
        </div>
      )
      : null;
  }

  _renderLayer() {
    return this.props.active === true
      ? null
      : <div className="horizontal-form-item-layer"></div>;
  }

  _renderTutorial() {
    return this.props.showTutorial === true && this.state.tutorialIsActive === true && this.props.active === true
      ? (
        <div className="horizontal-form-item-tutorial">
          <i className="material-icons">&#xE913;</i>
        </div>
      )
      : null;
  }

  render() {
    const { children, active, onNext, onPrevious, showNext, showPrevious } = this.props;

    const classes = className({ 'active': active, 'has-next': showNext, 'has-previous': showPrevious }, 'horizontal-form-item');

    return (
      <div className={classes} ref="container" style={{ width: `${this.props.width}px` }}>
        {this._renderTutorial()}
        {this._renderPlaceholder()}
        {this._renderLayer()}
        {this._renderPreviousButton()}
        {children}
        {this._renderNextButton()}
      </div>
    );
  }
}

HorizontalFormItem.propTypes = {
  showTutorial: React.PropTypes.bool
}

HorizontalFormItem.defaultProps = {
  showTutorial: false,
  nextIsDisabled: false,
  previousIsDisabled: false
}

export default HorizontalFormItem;
