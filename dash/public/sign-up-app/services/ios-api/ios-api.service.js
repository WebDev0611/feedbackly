(function() {

  class IOSApi {
    constructor() { }

    sendMessage(message) {
      console.log(message);
      try{
        webkit.messageHandlers.callbackHandler.postMessage(JSON.stringify(message))
      } catch(e){
      		try {
      			androidAppProxy.showMessage(JSON.stringify(messageInJSON))
      		} catch(ee){
      			console.log(messageInJSON)
      		}
        }
    }
  }

  angular.module('signUpApp.services')
    .service('IOSApi', IOSApi);

})();
