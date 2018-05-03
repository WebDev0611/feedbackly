import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { delay } from 'lodash';

import { onTap, getTapEventName } from 'utils/events';

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this._onHide = this._onHide.bind(this);
  }

  _onHide(e) {
    const container = ReactDOM.findDOMNode(this.refs.modalContainer);

    if(e.target === container || container.contains(e.target)) {
      return;
    }

    this.props.onHide();
  }

  _addEvents() {
    delay(() => {
      document.addEventListener(getTapEventName(), this._onHide);
    }, 500);
  }

  _removeEvents() {
    document.removeEventListener(getTapEventName(), this._onHide);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.show === true) {
      this._addEvents();
    } else {
      this._removeEvents();
    }
  }

  render() {
    const { show, onHide, children, heading, content } = this.props;

    let display = null;

    if(show === true) {
      display = (
        <div className="modal-wrapper" key={'modal'}>
            <div className="modal-container-wrapper">
              <div className="modal-container" ref="modalContainer">
                <div className="modal-heading">
                  {heading()}
                  <button className="btn-no-style cursor-pointer modal-close" {...onTap(onHide)}>
                    <i className="material-icons">&#xE5CD;</i>
                  </button>
                </div>

                <div className="modal-content scrollable">
                  <div className="modal-content-wrapper">
                    {content()}
                  </div>
                </div>
              </div>
            </div>

          <div className="modal-layer"></div>
        </div>
      );
    }

    return (
      <ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
       {display}
      </ReactCSSTransitionGroup>
    );
  }
}

export default Modal;
