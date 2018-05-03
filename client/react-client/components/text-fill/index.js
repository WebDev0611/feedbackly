import React from 'react';
import { connect } from 'react-redux';

import { delay } from 'lodash';
import zepto from 'npm-zepto';
import { get } from 'lodash';

import { updateTextFillOnElements } from 'utils/text-fill-utils';

let callCount = 0;

class TextFill extends React.Component {
  constructor(props) {
    super(props);

    this._updateTextFill = this._updateTextFill.bind(this);
    this._cache = {};
  }

  _updateTextFill() {
    if(this.props.children === undefined || this.props.textFillEnabled === false) {
      return;
    }

    const elem = zepto(this.refs.textfillSpan);
    const width = elem.width();

    if(this.props.id && this._cache[this.props.id.toString()] === width) {
      return;
    }

    updateTextFillOnElements(elem, this.props.options)

    if(this.props.id) {
      this._cache[this.props.id.toString()] = width;
    }
  }

  componentDidUpdate() {
    this._updateTextFill();
  }

  componentDidMount() {
    if(this.props.onlyOnUpdate !== true) {
      this._updateTextFill();
    }

    zepto(window).on('resize', this._updateTextFill);
  }

  componentWillUnmount() {
    zepto(window).off('resize', this._updateTextFill);
  }

  render() {
    return this.props.children === undefined
      ? null
      : (
        <span ref="textfillSpan" className="text-fill-span">
          {this.props.children}
        </span>
      );
  }
}

TextFill.propTypes = {
  onlyOnUpdate: React.PropTypes.bool,
  options: React.PropTypes.object
}

TextFill.defaultProps = {
  onlyOnUpdate: false,
  options: {}
}

const mapStateToProps = (state, props) => {
  return {
    textFillEnabled: state.view.textFillEnabled
  }
}

export default connect(
  mapStateToProps
)(TextFill);
