import 'babel-polyfill';
import React from 'react';
import ReactDOM, { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore from './store/configureStore';
import Root from './containers/Root';
import './styles/main.scss';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { surveyToState, stateToSurvey } from './store/state';
import { saveSuccess, saveFail, showMissing } from './modules/ui';
import { setTranslate } from './utils/translate';
import { setToaster } from './utils/Toaster';

injectTapEventPlugin();
if (process.env.NODE_ENV !== 'production') {
  const store = configureStore();
  const mockSave = () => {
    setTimeout(() => {
      if (Math.random() < 0.5) store.dispatch(saveSuccess());
      else {
        console.log('Save fail');
        store.dispatch(saveFail());
      }
    }, 1000);
  };
  render(
    <AppContainer>
      <Root store={store} onSave={mockSave} />
    </AppContainer>,
    document.getElementById('root'),
  );
  const alertF = type => text => alert(`${type}: ${text}`);
  setToaster({
    danger: alertF('danger'),
    neutral: alertF('neutral'),
    success: alertF('success'),
  });
  if (module.hot) {
    module.hot.accept('./containers/Root', () => {
      const NewRoot = require('./containers/Root').default;
      render(
        <AppContainer>
          <NewRoot store={store} onSave={mockSave} />
        </AppContainer>,
        document.getElementById('root'),
      );
    });
  }
} else {
  window.React = React;
  window.ReactSurveyEditor = (props) => {
    const { initialSurvey, callbacks: { onSave }, translate, toaster, availableFeatures, featureConstants, organizationAdmin } = props;
    const rights = {
      canUseLogic: availableFeatures.indexOf(featureConstants.SURVEY_LOGIC) > -1,
      canUseUpsell: availableFeatures.indexOf(featureConstants.UPSELL_MODULE) > -1,
      organizationAdmin
    }

    setTranslate(translate);
    setToaster(toaster);
    const store = configureStore(surveyToState(initialSurvey, rights));
    props.methods.onSaveSuccess = () => store.dispatch(saveSuccess());
    props.methods.onSaveFail = () => store.dispatch(saveFail());
    props.methods.getSurvey = () => {
      const result = stateToSurvey(store.getState());
      if (result.error) store.dispatch(showMissing());
      return result;
    };
    return <Root store={store} onSave={() => onSave(stateToSurvey(store.getState()))} />;
  };
  window.ReactDOM = ReactDOM;
}
