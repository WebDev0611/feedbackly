import 'babel-polyfill';
import 'utils/text-fill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { get, filter } from 'lodash';
import zepto from './npm-zepto';
import './styles/index.scss';
import App from './components/app/index';
import flexIE from './modernizr-flex';

/// apply edits to the state before it's synced with Redux
import changeInitialState from './utils/change-initial-state';
window._STATE_FROM_SERVER = changeInitialState(window._STATE_FROM_SERVER);

import store from './state/store';

import { loadImages, toImageCache, getImageSrc } from 'utils/images';
import { setGetTranslations } from 'utils/translate';

import { showQuestionById, goBackToBeginning } from 'state/active-card';
import {
  setViewResolution,
  setViewBackground,
  addInteraction,
  addDecorator,
  removeDecorator,
  setTextFillEnabled,
} from './state/view';
import { PING_INTERVAL } from './constants/pings';
import { MOBILE_BREAKPOINT, MOBILE_DECORATOR } from './constants/views';
import syncTimerWithStore from './utils/sync-timer-with-store';
import syncPrefilledSurveyWithStore from './utils/sync-prefilled-survey-with-store';
import syncPingerWithStore from './utils/sync-pinger-with-store';
import syncChannelBootstrapperWithStore from './utils/sync-channel-bootstrapper-with-store';
import * as kioskClient from './utils/kiosk-client';
import { clearFbeventBuffer } from './state/fbevents';

import imageCss from "./styles/image-css"

try{ flexIE() } catch(e){}

window.initFromClient = function () {
  store.dispatch(goBackToBeginning());
};

/* ACTIONS */

window.initReactApp = function () {
  setGetTranslations(() => get(store.getState(), 'survey.properties'));

  syncTimerWithStore(store);
  const { view } = store.getState();

  const windowElem = zepto(window);

  setInterval(() => {
    store.dispatch(clearFbeventBuffer());
  }, 5 * 60 * 1000); // clear buffer every 5 minutes

  if (view.decorators.IPAD) {
    zepto('body').css('overflow-y', 'hidden');
    syncPingerWithStore(store);

    windowElem.on('touchmove', e => {
      
      // windowElem.scrollTop(0);
      // zepto('input[type=text], textarea').blur();

      const isScrollable = zepto(e.target).closest('.scrollable').length > 0;

      if (!isScrollable) {
        e.preventDefault();
      }
    });
  }

  if(view.decorators.PLUGIN){
    zepto("body").addClass("plugin-view");
    if(window.parentHeight && window.parentWidth){
      zepto("#root").css("max-height", parseInt(window.parentHeight));
      zepto("#root").css("max-width", parseInt(window.parentWidth));
    }
  }

  if(view.decorators.IPAD){
    store.dispatch(setTextFillEnabled(true));
  } else {
    store.dispatch(setTextFillEnabled(false));
  }

  windowElem.on('touchend', () => store.dispatch(addInteraction()));

  windowElem.on('resize', () => {
    const windowHeight = windowElem.height();
    const windowWidth = windowElem.width();

    const isLandscape = windowWidth > windowHeight;
    const isMobile = windowWidth <= MOBILE_BREAKPOINT;

    if (isMobile) {
      store.dispatch(addDecorator(MOBILE_DECORATOR));
    } else {
      store.dispatch(removeDecorator(MOBILE_DECORATOR));
    }

    store.dispatch(setViewResolution({ isLandscape }));
  });

  if (window.IS_IPAD_CLIENT) {
    window._IMAGE_SOURCES = window._IMAGE_SOURCES.map((url) => {
      if (url.substring(0, 1) === '/') return url.substring(1, 9999 * 999);
      return url;
    });
  
    // ***
    // THIS FOLLOWING HACK CAN BE REMOVED WHEN ALL DEVICES ARE RUNNING VERSION 2.6.7+
    if(!window.iPadBuild || window.iPadBuild < 268){
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      var host = process.env.CLIENT_URL;
      link.href = host + "/dist/react-client.min.css?i=" + Date.now()
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    // ***

    // ***
    // THIS FOLLOWING IS LOOKING FOR KEYBOARD BUGS
    try{
      let keyboardFocusStart, lastFocus = Date.now()-5000, keyboardFocuses = 0;    
      keyboardFocuses = (JSON.parse(localStorage.getItem("focuses")) || {keyboardFocuses: 0}).keyboardFocuses;
      keyboardFocusStart = (JSON.parse(localStorage.getItem("focuses")) || {keyboardFocusStart: Date.now()}).keyboardFocusStart;

    zepto(document).on("focus", "textarea, input[type=text]", () => {
      console.log(keyboardFocuses, keyboardFocusStart)
      if(keyboardFocuses === 0) {
        keyboardFocusStart = Date.now()
        lastFocus = Date.now()
        keyboardFocuses++;
      } else if(Date.now() - lastFocus > 5000){
        keyboardFocuses++;
        lastFocus = Date.now()
      }
      localStorage.setItem("focuses", JSON.stringify({keyboardFocuses, keyboardFocusStart}))
    })

    zepto(document).on("keypress", () => {
      console.log('keypress')
      keyboardFocuses = 0;
      localStorage.removeItem("focuses")
    })
  } catch(e){}
  
    // ***
 } 

  loadImages(window._IMAGE_SOURCES.map(source => getImageSrc(source))).then((images) => {
    window._IMAGE_CACHE = toImageCache(images);

    document.getElementById('spinner-loader').style.display = 'none';

    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root'),
    );

    windowElem.trigger('resize');

    document.getElementById('root').className = 'ready';

    syncChannelBootstrapperWithStore(store);
    syncPrefilledSurveyWithStore(store);
  });

  kioskClient.postMessage({ action: 'surveyLoaded' });
  const s = document.createElement('style');
  s.innerHTML = window._STATE_FROM_SERVER.view.cssString;
  document.getElementsByTagName('head')[0].appendChild(s);

  // add these manually:

  const s2 = document.createElement('style');
  s2.innerHTML = imageCss;
  document.getElementsByTagName('head')[0].appendChild(s2);
};


initReactApp();