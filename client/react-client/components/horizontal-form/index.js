import React from 'react';
import ReactDOM from 'react-dom';
import zepto from 'npm-zepto';

import HorizontalFormItem from './horizontal-form-item';

import { hideKeyboard } from 'utils/events';

const MAX_ITEM_WIDTH = 500;

export default class HorizontalForm extends React.Component {
  constructor(props) {
    super(props);

    const windowWidth = zepto(window).width();

    this.state = {
      itemWidth: Math.min(windowWidth * 0.6, MAX_ITEM_WIDTH),
      activeIndex: props.index
    }
  }

  _resetKeyboard() {
    this._hideKeyboard()
      .then(() => this._disableNonActiveInput());
  }

  _hideKeyboard() {
    const container = zepto(ReactDOM.findDOMNode(this.refs.container));

    const textInputs = container.find('input');

    return hideKeyboard(textInputs);
  }

  _onNext() {
    const numberOfItems = React.Children.count(this.props.children);

    this._resetKeyboard();

    if(this.state.activeIndex === numberOfItems - 1) {
      return;
    }

    const nextIndex = this.state.activeIndex + 1;

    this.setState({
      activeIndex: nextIndex
    });

    this.props.onInteract();
    this.props.onIndexChange(nextIndex);
  }

  _onPrevious() {
    if(this.state.activeIndex === 0) {
      return;
    }

    this._resetKeyboard();

    const nextIndex = this.state.activeIndex - 1;

    this.setState({
      activeIndex: nextIndex
    });

    this.props.onInteract();
    this.props.onIndexChange(nextIndex);
  }

  _setWrapperPosition() {
    const middle = $(this.refs.container).offset().width / 2;
    const left = (middle - this.state.itemWidth / 2) - (this.state.activeIndex * this.state.itemWidth);

    $(this.refs.wrapper).css({
      left: `${left}px`
    });
  }

  _disableNonActiveInput() {
    const container = zepto(ReactDOM.findDOMNode(this));
    const inputs = container.find('.horizontal-form-item input');
    const notActiveInputs = container.find('.horizontal-form-item:not(.active) input');

    inputs.removeAttr('readonly');
    notActiveInputs.attr('readonly', 'true');
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.index !== this.state.activeIndex && nextProps.index !== this.props.index) {
      this.setState({
        activeIndex: nextProps.index
      });
    }

    this._setWrapperPosition();
  }

  _update() {
    this._setWrapperPosition();
    this._disableNonActiveInput();
  }

  componentDidMount() {
    this._update();
  }

  componentDidUpdate() {
    this._update();
  }

  render() {
    const numberOfItems = React.Children.count(this.props.children);
    const width = numberOfItems * this.state.itemWidth;

    let content = React.Children.map(this.props.children, (child, index) => {
      const isLast = index === this.props.children.length - 1;
      const isFirst = index === 0;
      const isActive = index === this.state.activeIndex;

      const item = React.cloneElement(child, {
        active: isActive,
        onNext: this._onNext.bind(this),
        onPrevious: this._onPrevious.bind(this),
        showNext: !isLast && isActive,
        showPrevious: !isFirst && isActive,
        width: this.state.itemWidth
      });

      return item;
    });

    return (
      <div>
        <div className="horizontal-form-progress">
          {this.state.activeIndex + 1}/{numberOfItems}
        </div>

        <div className="horizontal-form-container" ref="container">
          <div className="horizontal-form-container-fade horizontal-form-container-fade-left"></div>

          <div
            className="horizontal-form-wrapper"
            ref="wrapper"
            style={{
              width: `${width}px`
            }}>
            {content}
          </div>

          <div className="horizontal-form-container-fade horizontal-form-container-fade-right"></div>
        </div>
      </div>
    );
  }
}

HorizontalForm.defaultProps = {
  index: 0,
  onIndexChange: () => {},
  onInteract: () => {}
}

HorizontalForm.propTypes = {
  index: React.PropTypes.number,
  onIndexChange: React.PropTypes.func
}
