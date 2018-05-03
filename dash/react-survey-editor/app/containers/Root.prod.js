import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import configureStore from '../store/configureStore';


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
