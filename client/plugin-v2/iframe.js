/*eslint-disable*/
import htmlToElement from 'html-to-element';
import closeButton from './assets/close_button'
import {CLOSE_BUTTON_ID, MAIN_CONTAINER_PREFIX} from './constants'
import keys from 'lodash.keys'
import get from 'lodash.get'
import {markSurveyAsClosed} from './utils'


export function createIframe(instance){
  const isIOS = get(instance, '_agentDetails.os.name') === 'iOS'
  const id = instance._id;
  const previousElement = document.getElementById(MAIN_CONTAINER_PREFIX+id);
  if(previousElement) previousElement.remove()
  const {display, placement, udid} = instance._settings;
  const metaData = instance._metaData;
  const previewSurveyId = instance._previewSurveyId;
  const forceType = instance._forceType;
  let element, container;


  const metaDataString = metaData ? "&_="+keys(metaData).map(key => `${key}:${metaData[key]}`).join(";") : ''

  if(forceType){
    if(forceType == 'popup') element = htmlToElement(getCornerWindow(id, '', 'bottom-right', null,isIOS,previewSurveyId))
    if(forceType == 'modal') element = htmlToElement(getModal(id, '', metaDataString, previewSurveyId))
    if(forceType == 'embedded') {
      container= document.getElementsByClassName(`feedback-plugin-container-preview`)[0]
      element = htmlToElement(getEmbeddedElement(id, '', container, metaDataString, previewSurveyId));
    }
  } else {

  if(display == 'popup') element = htmlToElement(getCornerWindow(id, udid, placement, metaDataString, isIOS, previewSurveyId))
  if(display == 'modal') element = htmlToElement(getModal(id, udid, metaDataString, previewSurveyId))
  if(display == 'embedded'){
    try{
      container= document.getElementsByClassName(`feedback-plugin-container-${udid}`)[0]
      element = htmlToElement(getEmbeddedElement(id, udid, container, metaDataString, previewSurveyId));
    }catch(e){
      console.log(e)
      return false
    }
  }
  }

  if(element){
    if(container) { container.appendChild(element) }
    else { 
      if(display !== 'embedded'){
        document.body.appendChild(element); 
      } else {
        return false;
      }
    }
    const closeBtn = document.getElementById(CLOSE_BUTTON_ID+id)
    const closeBtnHandler = () => { instance.close(); markSurveyAsClosed(udid); }

    var eventName;
    if (window.navigator.pointerEnabled) {
      eventName = 'pointerdown'
    } else if (window.navigator.msPointerEnabled) {
      eventName = 'MSPointerDown'
    } else {
      eventName = 'touchstart'
    }
    closeBtn.addEventListener(eventName, closeBtnHandler)
    closeBtn.addEventListener('click', closeBtnHandler)

    instance._listeners.closeButtonListener = function(){
      closeBtn.removeEventListener(eventName, closeBtnHandler)
      closeBtn.removeEventListener('click', closeBtnHandler)
    }
  }

  return element
}

function generateGeneralContainer(id, url, parentStyle, childStyle, iFrameStyle, closeBtnStyle){
  const html = `
  <div style="position:absolute; display:none; z-index: 99999; ${parentStyle}" id="${MAIN_CONTAINER_PREFIX}${id}">
    <div style="box-shadow: 0 0 5px rgba(0,0,0,0.2);position: relative; ${childStyle}">
      <iframe name="if-${id}" style="border: none; min-height: 240px; min-width: 320px; max-width: 100%; height: 100%; ${iFrameStyle}" src="${url}"></iframe>
      <img id="${CLOSE_BUTTON_ID}${id}" style="position: absolute; cursor: pointer; ${closeBtnStyle}" src="${closeButton}" />
    </div>
  </div>
  `
  return html
}


export function getModal(id,udid,metaDataString, previewSurveyId){
  const baseURL = previewSurveyId ? `${process.env.CLIENT_URL}/previews/${previewSurveyId}?preview=true`:`${process.env.CLIENT_URL}/surveys/${udid}?p`
  const URL = `${baseURL}&decorators=plugin,modal&w=${window.innerWidth}&h=${window.innerHeight}${metaDataString}`
  const parentStyle ="top: 1em; width: 100%;"
  const childStyle = `
    width: ${window.innerWidth}px;
    max-width: 700px;
    height: ${window.innerHeight}px;
    max-height: 600px;
    margin: 0 ${window.innerWidth < 700 ? '-8px' : 'auto'};
  `
  const closeBtnStyle = "top: 9px; right: 4px; width: 25px; height: 25px;"
  const iFrameStyle = "width: 100%;"
  const html = generateGeneralContainer(id, URL, parentStyle, childStyle, iFrameStyle, closeBtnStyle)

  return html
}

export function getCornerWindow(id, udid,placement,metaDataString, isIOS, previewSurveyId){
  const baseURL = previewSurveyId ? `${process.env.CLIENT_URL}/previews/${previewSurveyId}?preview=true` : `${process.env.CLIENT_URL}/surveys/${udid}?p`
  const URL = `${baseURL}&decorators=plugin,popup&w=${window.innerWidth}&h=${window.innerHeight}${metaDataString}`

  const top = placement.indexOf('top') > -1;
  const right = placement.indexOf('right') > -1;
  const parentStyle = `${top ? 'top' : 'bottom'}: 5px; ${right ? 'right' : 'left'}: 5px; max-height: 270px; width: 380px; max-width: 100%; position: ${isIOS ? '' : 'fixed'};`
  const closeBtnStyle = "top: 4px; right: 5px; width: 22px; height: 22px;"
  const iFrameStyle = "width: 380px;"

  const container = generateGeneralContainer(id, URL, parentStyle, '', iFrameStyle, closeBtnStyle)
  return container
}


export function getEmbeddedElement(id, udid, container, metaDataString, previewSurveyId){
  const baseURL = previewSurveyId ? `${process.env.CLIENT_URL}/previews/${previewSurveyId}?preview=true` : `${process.env.CLIENT_URL}/surveys/${udid}?p`
  const URL = `${baseURL}&decorators=plugin,embedded&w=${(container || {offsetWidth: 1024}).offsetWidth}${metaDataString}`

  const parentStyle = 'position: relative;'
  const closeBtnStyle = 'display:none;'
  const iFrameStyle = "width: 100%; min-height: 450px;"
  return generateGeneralContainer(id, URL, parentStyle, '', iFrameStyle, closeBtnStyle)

}
