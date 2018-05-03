window.messageClient = function(messageInJSON){
	try{
		webkit.messageHandlers.callbackHandler.postMessage(JSON.stringify(messageInJSON))
	} catch(e){
		try {
			androidAppProxy.showMessage(JSON.stringify(messageInJSON))
		} catch(ee){
			console.log(messageInJSON)
		}
	}
}
