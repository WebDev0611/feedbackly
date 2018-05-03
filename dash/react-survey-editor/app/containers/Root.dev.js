import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import App from './App';
export default class Root extends Component {
  render() {
    const { store, onSave } = this.props;
    return (
      <Provider store={store}>
        <div>
          <App onSave={onSave} />
        </div>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
};
