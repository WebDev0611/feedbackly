import LocationBar from 'location-bar'
import throttle from 'lodash.throttle'
import store from '../store'
import {getUnixTime} from '../utils'
import {VISITED_ADDRESSES_KEY, CURRENT_PAGE_LOADED_KEY} from '../constants'


function addUrlToHistory(visitedUrls, udid){
  const href = window.location.href;
  if(href != visitedUrls.urls[visitedUrls.urls.length-1]){
    visitedUrls.urls.push(href)
    visitedUrls.lastUpdated = getUnixTime();
    store.set(VISITED_ADDRESSES_KEY + udid, visitedUrls)
  }
}

function historyMatchesRulesCheck(rules, urls){

  let matches = rules.map(rule => {
    let match = false;
    var i=0;
    urls.forEach(url => {
      let oneMatch = urlMatch(url, [rule]);
      if(oneMatch) match = {i}
      i++;
    })
    return match
  })

  let lastMatchedIndex = -1;
  let notInOrderMatches = []
  let matchesInOrder = 0;
  matches.forEach(i => {
    notInOrderMatches.push(i ? 1 : 0)
    if(i){
      if(i.i > lastMatchedIndex) matchesInOrder++;
      else matchesInOrder=0;
      lastMatchedIndex = i.i;
    } else { lastMatchedIndex = -1; matchesInOrder = 0 }
  })

  return {
    matchesAllRules: Math.min(...notInOrderMatches) == 1,
    matchesAllRulesInOrder: matchesInOrder == rules.length
  }

}

function urlMatch(url, rules){
  let match = false;

  if(url && url.length > 0){
    rules.forEach(rule => {
      if(url.indexOf(rule) > -1) match = true;
    })
  }

  return match;
}

function checkVisitedUrlsWithRules(settings, urls){

  const {urlPatterns, showAfterVisitedPages, excludeUrls } = settings;
  // check if any rules match the latest address
  const latestAddressMatch = urlMatch(urls[urls.length-1], urlPatterns.rules || [])
  const isCurrentUrlInExcludeUrls = urlMatch(urls[urls.length-1], excludeUrls || [])
  // check if history matches with all rules

  const historyMatches = historyMatchesRulesCheck(urlPatterns.rules || [], urls)

  const enoughPagesVisited = urls.length >= showAfterVisitedPages

  const returnable = {
    latestAddressMatch,
    historyMatchesAllRules: historyMatches.matchesAllRules,
    historyMatchesAllRulesInOrder: historyMatches.matchesAllRulesInOrder,
    enoughPagesVisited,
    anyMatches: latestAddressMatch || historyMatches.matchesAllRules || historyMatches.matchesAllRulesInOrder || enoughPagesVisited,
    isCurrentUrlInExcludeUrls
  }
  return returnable
}


export default function urlListener(settings, callback){
  const {udid} = settings;
  const unixNow = getUnixTime()

  // fill addresses from storage
  let visitedUrls = {urls: []}
  const visitedUrlsFromStore = store.get(VISITED_ADDRESSES_KEY + udid)
  if(visitedUrlsFromStore && unixNow - visitedUrlsFromStore.lastUpdated <= 12*60*60){
    // history is usable if it's less than than 12 hours old
    visitedUrls = visitedUrlsFromStore;
  }

  const locationBar = new LocationBar();
  locationBar.start({pushState: false})

  addUrlToHistory(visitedUrls,udid);
  const checkedRules = checkVisitedUrlsWithRules(settings, visitedUrls.urls)
  if(checkedRules.anyMatches) callback(checkedRules)

  locationBar.onChange(throttle(() => {
    addUrlToHistory(visitedUrls, udid)
    const checkedRules = checkVisitedUrlsWithRules(settings, visitedUrls.urls)
    store.set(CURRENT_PAGE_LOADED_KEY+udid, getUnixTime())
    if(checkedRules.anyMatches) callback(checkedRules)
  }), 1000)

  return function(){
    locationBar.stop()
  }
}
