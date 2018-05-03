import { get, isFunction } from 'lodash';
import PubSub from 'pubsub-js';

const postWith = message => post => {
  post(message);

  return true;
}

export function postMessage(message, format) {
  const messageInJSON = format && format == 'PLAIN' ? message : JSON.stringify(message);
  PubSub.publish("FEEDBACKLY_MESSAGE", message);

  if(isFunction(get(window, 'webkit.messageHandlers.callbackHandler.postMessage'))) {
    return postWith(messageInJSON)(message => window.webkit.messageHandlers.callbackHandler.postMessage(message));
  } else if(isFunction(get(window, 'androidAppProxy.showMessage'))){
    return postWith(messageInJSON)(message => window.androidAppProxy.showMessage(message));
  } else {
    if(process.env.NODE_ENV === 'development') {
      console.log('[KIOSK CLIENT]', message);
    }

    return false;
  }
}
