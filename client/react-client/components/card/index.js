import React from 'react';
import zepto from 'npm-zepto';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { TRANSITION_TIME } from 'constants/cards';

class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ReactCSSTransitionGroup transitionName="flying-card" transitionEnterTimeout={TRANSITION_TIME} transitionLeaveTimeout={TRANSITION_TIME} component="div">
        <div className="card" key={this.props.id}>
          <div className="container">
            <div className="container-centered-content">
              {this.props.children}
            </div>
          </div>
        </div>
      </ReactCSSTransitionGroup>
    )
  }
}

export default Card;
