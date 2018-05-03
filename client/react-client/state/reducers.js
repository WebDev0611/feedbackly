import { combineReducers } from 'redux';

import language from './language';
import survey from './survey';
import activeCard from './active-card';
import fbevents from './fbevents';
import defaultLanguage from './default-language';
import organization from './organization';
import view from './view';
import channel from './channel';
import timer from './timer';
import privacyPolicy from './privacy-policy';
import ping from './ping';
import languageMenu from './language-menu';
import circleAnimation from './circle-animation';
import ipadSignup from './ipad-signup';
import wordSelected from './questions';

const nopReducer = initialState => (state = initialState, action) => state;

export default combineReducers({
  language,
  survey,
  fbevents,
  activeCard,
  organization,
  defaultLanguage,
  channel,
  view,
  timer,
  privacyPolicy,
  ping,
  languageMenu,
  circleAnimation,
  ipadSignup,
  wordSelected,
  build: nopReducer('0'),
});
