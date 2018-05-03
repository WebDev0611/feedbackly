import Promise from 'promise-polyfill';
require('es6-symbol/implement');

if (!window.Promise) { window.Promise = Promise }

import {getSettings, addClientBridge, safeMeta} from 'utils'
import {initPluginWithSettings} from './main'
import {createIframe} from 'iframe'
import keys from 'lodash.keys'
import get from 'lodash.get'
import UserAgent from 'user-agent-parser';
let agentDetails;
try{ 
   agentDetails = new UserAgent(window.navigator.userAgent).getResult();
} catch(e){
   agentDetails = {}
}

class Fbly{
  constructor(udid, instanceId, previewSurveyId=false){
    this._init(udid, instanceId, previewSurveyId)
  }

  _init(udid, instanceId, previewSurveyId){
  this._previewSurveyId = previewSurveyId || false;
  this._agentDetails = agentDetails;
  this._isOpen = false;
  this._listeners = {}
  this._triggers = {}
  this._udid = udid;
  this._id = instanceId || `${udid}-${Math.round(Math.random()*10000)}${(+new Date)}`

  getSettings(udid)
    .then(settings => {
      this._settings = settings
      this._udid = settings.udid
      this._placementChangeOnScroll = (settings.display === 'popup' && get(this,'_agentDetails.os.name') == 'iOS') || settings.display == 'modal'
      if(udid != 'preview') initPluginWithSettings(this)
    })
    //.catch(err =>console.error('Failed to fetch Feedbackly settings. Make sure your provided id is correct.'))
  }

  open(type){
    this._forceType = type;
    this._addMeta("__url", window.location.href )

    if(!this._element) this.preLoad()
    setTimeout(() => {
      if(this._element){
        this._element.style.display="block"
        this._isOpen = true;
      }
    }, 1000)


  }

  close(){
    if(this._element) {
      try{
      this._element.parentNode.removeChild(this._element)
      this._element = undefined;
    } catch(e){}
    }
    this._isOpen = false;
    keys(this._listeners).forEach(key => {
      this._listeners[key]() // calls each listener function to unregister them
    })
  }

  _addMeta(key, val){
    let validMeta;
    try{
      if(key.toString().length > 0 && val.toString().length > 0) validMeta = true
    }catch(e){console.error('Meta is not valid')}

    if(validMeta){
      const safeKey = safeMeta(key.toString())
      const safeVal = safeMeta(val.toString())
      this._metaData = {...{}, ...(this._metaData || {}), ...{[safeKey]: safeVal}}
    }
  }

  addMeta(key, val){
    this._addMeta(key, val);
    this.preLoad(true)
  }

  clearMeta(){
    delete this._metaData
    this.preLoad(true)
  }

  removeMeta(key){
    const safeKey = safeMeta(key)
    if(this._metaData && this._metaData[safeKey]){

     delete this._metaData[safeKey]
     this.preLoad(true)
   }

  }

  preLoad(forcePreload){
    if(this._preLoadTimeout && this._preLoadTimeout.on == true) clearTimeout(this._preLoadTimeout.token)

    this._preLoadTimeout = {on: true, token: setTimeout(() => {
      this._preLoadTimeout.on=false;
      if(this._listeners.bridge) this._listeners.bridge()
      this._listeners.bridge = addClientBridge(this)
      if(forcePreload) this._element = createIframe(this)
      else if(!this._element) this._element = createIframe(this)// preload with updated metadata params, and don't do this more often than 1,5sec
      if(this._isOpen) this.open()
    }, 900) }

  }

}

window.Fbly = Fbly;

const methods = ['_init', 'open', 'close', '_addMeta','clearMeta','removeMeta', 'preLoad']

// Replaces the shallow Fbly instances with proper ones. Executes all methods that were called on the shallow ones in order.
function convertFbly(oldObject) {

  const queue = oldObject.queue

  for (var i=0; i < methods.length; i++) {
    var method = methods[i];
    oldObject[method] = Fbly.prototype[method].bind(oldObject)
  }
  for (var i=0; i<queue.length; i++) {
    var q = queue[i]
    Fbly.prototype[q[0]].apply(oldObject, q[1])
  }

  oldObject._init(oldObject.udid)
  delete oldObject.queue;
}

// As _FblyInst is a map from device id to Fbly instance, we can load all the shallow instances from the map.
if(!window._fbly_mappingDone){
  if(window._FblyInst){
    for (var id in _FblyInst) {
      convertFbly(_FblyInst[id])
    }
}
  window._fbly_mappingDone = true;
}
