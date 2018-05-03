import React from 'react';
import zepto from 'npm-zepto';
import { connect } from 'react-redux';

class CircleAnimation extends React.Component {
  render() {
    let windowElem = zepto(window);
    const windowWidth = windowElem.width();
    const windowHeight = windowElem.height();

    const diameter = Math.sqrt(Math.pow(windowWidth, 2) + Math.pow(windowHeight, 2));

    const cx = this.props.x - diameter / 2;
    const cy = this.props.y - diameter / 2;

    let display = this.props.show === true
      ? (
        <div
          className="circle-animation"
          style={{
            width: `${diameter}px`,
            height: `${diameter}px`,
            left: `${cx}px`,
            top: `${cy}px`,
            backgroundColor: this.props.color
          }}>
        </div>
      )
      : null;

    return display;
  }
}

const mapStateToProps = state => {
  const { circleAnimation } = state;

  return circleAnimation;
}

export default connect(
  mapStateToProps
)(CircleAnimation);
