import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import axiosMiddleware from 'redux-axios-middleware';
import createLogger from 'redux-logger';

import reducer from './reducers';

import axiosClient from 'utils/axios-client';

import { transitionLock } from 'middlewares/transition-lock';
import { delayer } from 'middlewares/delayer';
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  reducer,
  window._STATE_FROM_SERVER,
  composeEnhancers(
    applyMiddleware(thunk, axiosMiddleware(axiosClient), transitionLock, delayer )
  )
);
