import {getUnixTime} from '../utils'
import get from 'lodash.get'

function createMouseListenerFunction(callback){

  return function (e) {
    const event = e ? e : window.event

    // If this is an autocomplete element.
    if ((get(event, 'target.tagName') || '').toLowerCase() === 'input') {
      return false
    }

  // Reliable, works on mouse exiting window and
  // user switching active program
    const from = event.relatedTarget || event.toElement

    if (!from) {
      return callback({exitedLast: getUnixTime()}) // gives the unix time so we can determine if this was fired now or earlier
    }

    if(event.pageY <= 5){
      return callback({exitedLast: getUnixTime()}) // gives the unix time so we can determine if this was fired now or earlier
    }

    return false
  }
}


export default function exitListener(callback){

  const mouseListener = createMouseListenerFunction(callback)

  document.addEventListener('mouseout', mouseListener)
  document.addEventListener('mousemove', mouseListener)


  return function(){
    document.removeEventListener('mouseout', mouseListener)
    document.removeEventListener('mousemove', mouseListener)
  }
}
