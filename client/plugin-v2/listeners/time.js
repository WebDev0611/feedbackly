import {getUnixTime} from '../utils'
import store from '../store'
import {CURRENT_PAGE_LOADED_KEY, PLUGIN_FIRST_INITIALIZED_KEY} from '../constants'

export default function timeCounter(settings, callback){
  let interval;
  const clearFunction = function(){ clearInterval(interval) }

  const {showAfterSecondsOnSite, showAfterSecondsOnPage, udid} = settings

  // set time when landed on site if not specified

  const landedOnSiteInUnix = store.get(PLUGIN_FIRST_INITIALIZED_KEY+udid)

  interval = setInterval(() => {
    const landedOnPageInUnix = store.get(CURRENT_PAGE_LOADED_KEY+udid)
    const now = getUnixTime()
    let timeOnSite, timeOnPage

    if(showAfterSecondsOnSite) timeOnSite = now-landedOnSiteInUnix >= showAfterSecondsOnSite
    if(showAfterSecondsOnPage) timeOnPage = now-landedOnPageInUnix >= showAfterSecondsOnPage

    if(timeOnSite || timeOnPage){
        callback({enoughTimeOnSite: timeOnSite, enoughTimeOnPage: timeOnPage})

        /* Stop counting if rule evaluation is done */
        if(timeOnSite == undefined && (timeOnPage != undefined && timeOnPage)) clearFunction()
        if(timeOnPage == undefined && (timeOnSite != undefined && timeOnSite)) clearFunction()
        if(timeOnPage && timeOnSite) clearFunction()
    }

  }, 1000)

  // return unsubscibing function
  return clearFunction

}
