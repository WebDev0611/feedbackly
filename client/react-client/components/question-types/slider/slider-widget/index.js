import React from 'react';
import zepto from 'npm-zepto';
import className from 'classnames';

import { onTap, getEventX, getEventY } from 'utils/events';
import { getSliderHelperTranslation } from 'utils/translate';
import { getTextFillId } from 'utils/text-fill-utils';

import NextButton from 'components/next-button';
import Translate from 'components/translate';

export default class SliderWidget extends React.Component {
  constructor(props) {
    super(props);

    this._mouseMoveUpEvent = this._mouseMoveUpEvent.bind(this);
    this._resizeEvent = this._resizeEvent.bind(this);
    this._moveDialEvent = this._moveDialEvent.bind(this);
  }

  componentWillUnmount() {
    this._destroy();
  }

  componentDidMount() {
    this._container = zepto(this.refs.sliderContainer);
    this._helper = zepto(this.refs.sliderHelper);

    this._containerWidth = 1000;
    this._actualWidth = this._containerWidth * 1.3;

    this._colors = {
      red: [210, 98, 112],
      orange: [228, 146, 78],
      yellow: [240, 204, 91],
      green: [148, 196, 85],
      blue: [101, 165, 163]
    }

    this._scale = 1;
    this.invertedScale = 1;

    this._universalDialStartPoint;
    this._circleCenter = { x: this._actualWidth / 2, y: this._actualWidth / 2 };
    this._circleRadius = this._containerWidth / 2;
    this._mouseUp = true;
    this._knobRadius = this._circleRadius * 0.27;
    this._strokeWidth = 15;
    this._maskLength = 0.2;
    this._dialStartPoint = this._getClosestPointToCircle(this._actualWidth * this._maskLength, this._actualWidth);
    this._dialEndPoint = this._getClosestPointToCircle(this._actualWidth * (1 - this._maskLength), this._actualWidth);
    this._value = 0;
    this._dial;
    this._universalDialStartPoint = Object.assign({}, this._dialStartPoint);

    this._destroy();

    this._container.append(`
      <svg viewBox="0 0 ${this._actualWidth} ${this._actualWidth}">
        <circle cx="${this._circleCenter.x}" cy="${this._circleCenter.y}" r="${this._circleRadius}" stroke="red" fill="none" stroke-width="${this._strokeWidth}" clip-path="url(#cut-off-bottom)"/>

        <defs>
          <clipPath id="cut-off-bottom">
            <polygon points="0,${this._actualWidth} 0,0 ${this._actualWidth},0 ${this._actualWidth},${this._actualWidth} ${this._actualWidth * (1 - this._maskLength)},${this._actualWidth} ${this._circleCenter.x},${this._circleCenter.y} ${this._actualWidth * this._maskLength},${this._actualWidth} 0,${this._actualWidth}"/>
          </clipPath>
        </defs>

        <circle class="dragger" cx="20" cy="20" r="${this._knobRadius}" stroke="black" stroke-width="${this._strokeWidth}" fill="white" />
      </svg>
    `);

    this._resizeEvent();

    this._dial = this._container.find('.dragger');
    this._dial.attr('cx', this._dialStartPoint.x);
    this._dial.attr('cy', this._dialStartPoint.y);
    this._container.find('circle').attr('stroke', this._getColorFromProgress(this._value));

    this._dial.on('touchmove mousedown', this._moveDialEvent);

    zepto('body').on('mousemove mouseup', this._mouseMoveUpEvent);

    $(window).on('resize', this._resizeEvent);

    let dialOffset = this._dial.offset();
    let containerOffset = this._container.offset();
    let helperOffset = this._helper.offset();

    this._helper.css({
      left: `${(dialOffset.left - containerOffset.left) + dialOffset.width + 25}px`,
      top: `${(dialOffset.top - containerOffset.top) + dialOffset.height / 2 - helperOffset.height / 2}px`
    });
  }

  _getClosestPointToCircle(x, y) {
    var newX = this._circleCenter.x + (this._circleRadius * (( x- this._circleCenter.x ) / Math.sqrt(Math.pow(x-this._circleCenter.x, 2) + Math.pow(y-this._circleCenter.y, 2))))
    var newY = this._circleCenter.y + (this._circleRadius * (( y- this._circleCenter.y ) / Math.sqrt(Math.pow(x-this._circleCenter.x, 2) + Math.pow(y-this._circleCenter.y, 2))))

    if(this._dialStartPoint && this._dialEndPoint && this._value > -1){
      if(newX > this._dialStartPoint.x && newY > this._dialStartPoint.y && this._value < 50) return this._dialStartPoint;
      if(newX < this._dialEndPoint.x && newY > this._dialEndPoint.y && this._value > 50) return this._dialEndPoint;
    }

    return { x: Math.floor(newX), y: Math.floor(newY) }
  }

  _moveKnob(e) {
    const { smallScale } = this.props;

    e.preventDefault();

    this._helper.removeClass('slider-helper-showing');

    var touchX = this._scaleCoords(getEventX(e), 'left');
    var touchY = this._scaleCoords(getEventY(e), 'top');

    var newCoords = this._getClosestPointToCircle(touchX, touchY);

    this._value = this._getDialProgress(newCoords)

    this.props.onValueChange(this._value);

    var color = this._getColorFromProgress(this._value);


    this._container
      .find('.number')
      .text((this._value/(smallScale ? 20 : 10)).toFixed(0))
      .attr('data', this._value)
      .css('color', color);

    this._container.find('circle').attr('stroke', color);

    this._dial.attr('cx', newCoords.x);
    this._dial.attr('cy', newCoords.y);
  }

  _scaleCoords(coord, axis) {
    var offset = this._container.find('svg').offset()[axis];

    return (coord - offset) * this._invertedScale;
  }

  _getDialProgress(coords) {
    var yMin = this._dialStartPoint.y
    var yMax = this._circleCenter.y - this._circleRadius;
    var range = yMin - yMax;
    var divider = range / -50;

    if(coords.x <= this._circleCenter.x){
      return Math.ceil((coords.y - yMin) / divider);
    } else {
      return Math.ceil(50 - (coords.y - yMax) / divider);
    }
  }

  _getColorFromProgress(i) {
    var color;

    if (i <= 25) color = this._fadeTwoColors(this._colors.red, this._colors.orange, 0, 25, i)
    else if (i > 25 && i <= 50) color = this._fadeTwoColors(this._colors.orange, this._colors.yellow, 25, 50, i)
    else if (i > 50 && i <= 75) color = this._fadeTwoColors(this._colors.yellow, this._colors.green, 50, 75, i)
    else if (i > 75) color = this._fadeTwoColors(this._colors.green, this._colors.blue, 75, 100, i)

    return color
  }

  _fadeTwoColors(fromArr, toArr, min, max, val) {
    var range = max - min;
    var newVal = val - min

    var rRange = toArr[0] - fromArr[0]
    var rMultiplier = rRange/range
    var rVal = newVal*rMultiplier

    var gRange = toArr[1] - fromArr[1]
    var gMultiplier = gRange/range
    var gVal = newVal * gMultiplier

    var bRange = toArr[2] - fromArr[2]
    var bMultiplier = bRange/range
    var bVal = newVal * bMultiplier

    return `rgba(${Math.floor(fromArr[0] + rVal)},${Math.floor(fromArr[1] + gVal)},${Math.floor(fromArr[2] + bVal)}, 1)`;
  }

  _moveDialEvent(e){
    if(e.type == "mousedown"){
      return this._mouseUp = false;
    }

    this._moveKnob(e);
  }

  _mouseMoveUpEvent(e){
    if(e.type == "mousemove"){
      if(this._mouseUp) return;
    }
    if(e.type == "mouseup"){
      return this._mouseUp = true;
    }

    this._moveKnob(e);
  }

  _resizeEvent() {
    this._scale = this._container.find('svg').width() / this._actualWidth;
    this._invertedScale = 1 / this._scale;
  }

  _destroy() {
    zepto('body').off('mousemove', this._mouseMoveUpEvent);
    zepto('body').off('mouseup', this._mouseMoveUpEvent);

    if(this._dial !== undefined) {
      this._dial.off('touchmove mousedown', this._moveDialEvent);
    }

    zepto(window).off('resize', this._resizeEvent)

    this._container.off('touchmove mousedown', this._moveDialEvent);
    this._container.find('svg').remove();
  }

  render() {
    let helperClasses = className('slider-helper', { 'slider-helper-showing': this.props.showHelper === true })

    return (
      <div className="slider-widget-wrapper">
        <div ref="sliderContainer" className="slider-widget">
          <div className={helperClasses} ref="sliderHelper">
            <Translate getText={language => getSliderHelperTranslation(language)}/>
          </div>

          <div className="slider-number-wrapper">
            <div className="number">0</div>
          </div>
        </div>

        <div className="slider-title">
            {this.props.label}
        </div>
      </div>
    );
  }
}
