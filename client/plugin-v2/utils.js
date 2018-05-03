import jsonp from 'jsonp'
import store from './store'
import {SURVEY_CLOSED_KEY_NAME, SURVEY_COMPLETED_KEY_NAME} from './constants'

export function getSettings(udid){
  return new Promise((resolve, reject) => {
    if(udid == 'preview') return resolve({})
    jsonp(`${process.env.CLIENT_URL}/plugin/${udid}/settings.js`,null, (err, response) => {
      if(err) return reject(err);
      return resolve(response)
    })
  })
}

export function getUnixTime(){
  return Math.round((new Date()).getTime() / 1000);
}

export function storageTest(){
  var testValue = Math.random()
  var key = Math.random().toString()
  store.set(key, testValue);
  var value = store.get(key);
  store.remove(key)
  return testValue === value
}

export function markSurveyAsClosed(udid){
  const currentTimeInUnix = getUnixTime()
  store.set(SURVEY_CLOSED_KEY_NAME + udid, currentTimeInUnix)
}

export function markSurveyAsCompleted(udid){
  const currentTimeInUnix = getUnixTime()
  store.set(SURVEY_COMPLETED_KEY_NAME + udid, currentTimeInUnix)
}

export function surveyClosedOrCompleted(settings){
  const {udid, hiddenAfterClosedForHours, hiddenAfterFeedbackForHours} = settings;
  const closedInUnix = store.get(SURVEY_CLOSED_KEY_NAME + udid);
  const completedInUnix = store.get(SURVEY_COMPLETED_KEY_NAME + udid);
  const currentTimeInUnix = getUnixTime();

  let surveyIsClosed = closedInUnix && ((closedInUnix + hiddenAfterClosedForHours*60*60) >= currentTimeInUnix)
  let surveyIsCompleted = completedInUnix && (completedInUnix + (hiddenAfterFeedbackForHours*60*60) >= currentTimeInUnix)

  return surveyIsClosed || surveyIsCompleted
}

function addBridgeListener(instance){
  const udid = instance._udid

  return event => {
   const origin = event.origin || event.originalEvent.origin;
  try{
  if(origin === process.env.CLIENT_URL || origin.indexOf('.feedbackly.com') > -1){
     if(event.data.indexOf('{') == 0){
       const data = JSON.parse(event.data)
       if(data.meta.udid == udid){
         // actions
         if(data.action === 'surveyFinished') { instance.close(); markSurveyAsCompleted(udid) }
         if(data.action === 'focusStart') { instance._placementChangeOnScroll = false;}
         if(data.action === 'focusEnd') { instance._placementChangeOnScroll = false; setTimeout(() => instance._placementChangeOnScroll = true, 1000)}
       }
     }
   }
  } catch(e){}
  }
}

export function addClientBridge(instance){

  const eventMethod = window.addEventListener ? {add: 'addEventListener', remove: 'removeEventListener'} : {add: 'attachEvent', remove: 'detachEvent'};
  const addListener = window[eventMethod.add];
  const messageEventName = eventMethod.add == 'attachEvent' ? 'onmessage' : 'message';

  const listenerFunction = addBridgeListener(instance)
  addListener(messageEventName, listenerFunction)

  return function(){
    window[eventMethod.remove](messageEventName, listenerFunction)
  }

}

export function safeMeta(string){
  return string.split(";").join("").split(":").join("")
}
