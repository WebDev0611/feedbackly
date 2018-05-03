import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../modules/reducer';

export default function configureStore(initialState) {

  const middleware = window.__REDUX_DEVTOOLS_EXTENSION__ ?
   compose(applyMiddleware(thunk), window.__REDUX_DEVTOOLS_EXTENSION__()) :
   applyMiddleware(thunk);
  const store = createStore(
        rootReducer,
        initialState,
        middleware
    );

  return store;
}
