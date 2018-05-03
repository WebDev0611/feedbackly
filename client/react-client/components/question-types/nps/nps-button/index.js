import React from 'react';
import zepto from 'npm-zepto';

import { onTap } from 'utils/events';

export default class NpsButton extends React.Component {
  constructor(props) {
    super(props);

    this._resize = this._resize.bind(this);
  }

  _resize() {
    const elem = zepto(this.refs.button);
    const classes = `fade-in stagger stagger-${this.props.index}`;
    const width = elem.width();
    elem
      .addClass(classes);

    elem
      .css({
        'height': `${width}px`,
        'line-height': `${width}px`
      });

  }


  componentDidMount() {
    this._resize();

    zepto(window).on('resize', this._resize);
  }

  componentWillUnmount() {
    zepto(window).off('resize', this._resize);
  }

  render() {
    return (
      <div className="nps-button scale-on-active tapable cursor-pointer" ref="button" {...onTap(e => this.props.onTap(e), { applyActiveClass: true })}>
        {this.props.children}
      </div>
    );
  }
}
