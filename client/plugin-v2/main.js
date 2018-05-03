import exitListener from './listeners/exit'
import urlListener from './listeners/url'
import scrollListener from './listeners/scroll'
import timeCounter from './listeners/time'
import {getUnixTime, addClientBridge} from 'utils'
import {storageTest, surveyClosedOrCompleted, markSurveyAsClosed} from './utils'
import store from './store'
import {CURRENT_PAGE_LOADED_KEY, PLUGIN_FIRST_INITIALIZED_KEY} from './constants'
import get from 'lodash.get'

function fitsInSample(sample){
  return Math.random() < sample
}


function triggerEvaluationCallback(pluginInstance){
  return function(newTriggers){
    pluginInstance._triggers = {...pluginInstance._triggers, ...newTriggers}
    if(pluginShouldOpen(pluginInstance._settings, pluginInstance._triggers)){
      pluginInstance.open()
    }
  }
}


export function initPluginWithSettings(pluginInstance) {
    const settings = pluginInstance._settings;
    if(!settings) return;
    // TODO check that the settings are correct
    
    // check sampling and pause execution if it does not fit sample
    if(!fitsInSample(settings.sampleRatio)) return;
    
    // check that storage works, otherwise cancel
    if(!storageTest()) return console.error('Feedbackly: localStorage / cookieStorage / sessionStorage do not work. Canceling.')
    
    // check if survey has been closed or completed, if yes then cancel
    if(surveyClosedOrCompleted(settings)) return;

    const now = getUnixTime()
    store.set(CURRENT_PAGE_LOADED_KEY+settings.udid, now)
    const siteLoadedUnix = store.get(PLUGIN_FIRST_INITIALIZED_KEY+settings.udid)
    if(!siteLoadedUnix || now-siteLoadedUnix > 12*60*60) store.set(PLUGIN_FIRST_INITIALIZED_KEY+settings.udid, now)

    // make evaluation function to be passed as callback to listeners
    const evaluation = triggerEvaluationCallback(pluginInstance);

    // add Listeners for different settings
    if(settings.showAfterSecondsOnSite || settings.showAfterSecondsOnPage) pluginInstance._listeners.timeCounter = timeCounter(settings, evaluation)
    if(settings.exitTrigger) pluginInstance._listeners.exitListener = exitListener(evaluation)
    if(get(settings, 'urlPatterns.rules.length') > 0 || get(settings, 'excludeUrls.length') > 0 || settings.showAfterVisitedPages || settings.showAfterSecondsOnPage) pluginInstance._listeners.urlListener = urlListener(settings, evaluation)
    if(pluginInstance._placementChangeOnScroll) pluginInstance._listeners.scrollListener = scrollListener(settings.afterPercentage, evaluation, pluginInstance)

    

    if (settings.exitTrigger) {
      pluginInstance._addMeta("__url", window.location.href )      
      pluginInstance.preLoad()
    };
  
  
    
    if(pluginShouldOpen(pluginInstance._settings, pluginInstance._triggers)){
      pluginInstance.open()
    }
}


function pluginShouldOpen(settings, triggers){
  const now = getUnixTime()
  let pluginShouldBeOpened = []

  // TIME

  if(settings.showAfterSecondsOnPage) pluginShouldBeOpened.push(triggers.enoughTimeOnPage ? 1 : 0);
  if(settings.showAfterSecondsOnSite) pluginShouldBeOpened.push(triggers.enoughTimeOnSite ? 1 : 0);

  // URLS
  if(settings.showAfterVisitedPages) pluginShouldBeOpened.push(triggers.enoughPagesVisited ? 1 : 0);
  if(settings.urlPatterns.rules.length > 0){
    if(settings.urlPatterns.mode == 'single') pluginShouldBeOpened.push(triggers.latestAddressMatch ? 1 : 0);
    if(settings.urlPatterns.mode == 'all') pluginShouldBeOpened.push(triggers.historyMatchesAllRules ? 1 : 0);
    if(settings.urlPatterns.mode == 'allInOrder') pluginShouldBeOpened.push(triggers.historyMatchesAllRulesInOrder ? 1 : 0);
  }
  if(settings.excludeUrls && settings.excludeUrls.length > 0) pluginShouldBeOpened.push(triggers.isCurrentUrlInExcludeUrls ? 0 : 1)
  // SCROLL
  if(settings.afterPercentage) pluginShouldBeOpened.push(now-(triggers.scrollOverPercentageLast || 0) < 10 ? 1 : 0);

  // EXIT
  if(settings.exitTrigger) pluginShouldBeOpened.push(now-(triggers.exitedLast || 0) < 2 ? 1 : 0);

  let open = Math.min(...pluginShouldBeOpened) == 1 /// basically the && operator
  if(settings.anyMatchedRuleWillTriggerPlugin) open = Math.max(...pluginShouldBeOpened) == 1 /// basically the || operator

  if(pluginShouldBeOpened.length == 0) open = true; // no rules defined, let's open
  return open;
}
