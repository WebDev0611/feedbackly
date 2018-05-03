import './styles.scss';

window.messageClient = function(messageInJSON){
	window.messages ? window.messages.push(messageInJSON) : window.messages = [messageInJSON];

	try{
		webkit.messageHandlers.callbackHandler.postMessage(JSON.stringify(messageInJSON))
	} catch(e){
		try {
			androidAppProxy.showMessage(JSON.stringify(messageInJSON))
		} catch(ee){
			try{
				window.parent.postMessage(JSON.stringify(messageInJSON), "*")
			} catch(eee){
			console.log(messageInJSON)
			}
		}
	}
}
if(window._CHANNEL_FROM_UDID_REQUEST.passcode !== undefined && window._CHANNEL_FROM_UDID_REQUEST.udid !== undefined) {
	window.messageClient({
		udid: window._CHANNEL_FROM_UDID_REQUEST.udid
	});

	window.messageClient({
		passcode: window._CHANNEL_FROM_UDID_REQUEST.passcode
	});

	window.messageClient({
		reload: 'true'
	});
}

function fillAuthCode(code){
  $("#udid").val(code);
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


$("#saveUdid").on("touchstart", saveUdid);
$("#cancel").on("touchstart", ()=>{
  messageClient({"reload": "true"})
});

$("#clear").on("touchstart", e=>{
  e.preventDefault();
  $(".confirm").show()
  setTimeout(()=>{
    $(".confirm").addClass('show');
  }, 20)
})

$("#clear-device").on("touchstart", ()=>{
  $(".confirm").removeClass("show")
  $(".spinner").show();
  messageClient({"action": "clear"})
})

$("#cancel-clear").on("touchstart", ()=>{
  $(".confirm").removeClass("show");
  setTimeout(()=>{
    $(".confirm").hide();
  }, 200)
})

function saveUdid(){
  $(".spinner").show();
  var udid = $('#udid').val();
  $('#error').addClass('hide');

	$.post('/ipad/verify-udid', {udid: udid})
  .done(function(data){
		console.log(data)
    messageClient({udid: data.udid, passcode: data.passcode, version: data.v4 ? "V4" : "V3" })
    messageClient({"reload": "true"})
  })
  .fail(function(){
    $(".spinner").hide();
    $('#error').removeClass('hide');
  })
}



messageClient({"deviceReporting": "true"})

$(document).ready(function(){
	$(".spinner").hide();

	setTimeout(function(){
		$(document).on("touchstart", "#go-to-settings", function(e){
			e.preventDefault();
			$(".spinner").show();
			messageClient({goToSettings: "goToSettings"})
		});
	}, 1000)

})

$('#signup-submit').on('touchstart', function() {
	var email = $('#email-field').val();
	var url = process.env.DASH_URL+'/api/v2/sign-up/ipad';
	$(".spinner").show();

	$.post(url, {email}).done(function(response) {
		var msg = { action: 'REGISTRATION_DONE', udid: response.udid, passcode: response.passcode }
		messageClient(msg);

	}).fail(function(response) {
			$(".spinner").hide();
			var error = response.responseJSON.error;
			$(".error").text(error)
			console.log('failed')
	})
})
