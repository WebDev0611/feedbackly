import get from 'lodash.get'
import throttle from 'lodash.throttle'

import {getUnixTime} from '../utils'


const getDocumentHeight = () => Math.max(
        get(document, 'body.scrollHeight'),   get(document, 'documentElement.scrollHeight'),
        get(document, 'body.offsetHeight'),   get(document, 'documentElement.offsetHeight'),
        get(document, 'body.clientHeight'),   get(document, 'documentElement.clientHeight')
    )

function makeScrollFunction(percentageRule, callback, instance){

  return function(){
    const fullContentHeight = window.innerHeight ||
                              (document.documentElement || document.body).clientHeight
    const documentHeight = getDocumentHeight()
    const scrollTop = window.pageYOffset ||
                      (document.documentElement || document.body.parentNode || document.body).scrollTop
    const trackLength = documentHeight - fullContentHeight
    const percentScrolled = Math.floor(scrollTop / trackLength * 100)

    if(instance._isOpen && instance._placementChangeOnScroll){
      if(instance._settings.display === 'modal'){
        instance._element.style.top=scrollTop + 20 + "px"
      }

      if(instance._settings.display === 'popup' &&
        (get(instance, '_agentDetails.os.name') == 'iOS' || get(instance, '_agentDetails.os.name') == 'Android' )
      ){
        if(instance._settings.placement.indexOf('bottom') > -1)
        instance._element.style.bottom=-scrollTop + "px"
      }
    }


    if (percentScrolled >= percentageRule) {
        callback({scrollOverPercentageLast: getUnixTime()})
    }
  }
}

export default function scrollListener(percentageRule, callback, instance){
  const scrollFunction = throttle(makeScrollFunction(percentageRule, callback, instance), 20);
  window.addEventListener('scroll', scrollFunction)

  return function(){
    window.removeEventListener('scroll', scrollFunction)
  }
}
