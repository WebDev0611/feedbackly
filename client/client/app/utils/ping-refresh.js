var counter;
var CLIENT_HANDLES_REFRESH = true;
var PING_INTERVAL = 5*60*1000; // 5 mins

var pingFn = function(){
  if(window.IS_PREVIEW || window.NO_PING) return;

  $.get('/ping/' + device_id + '/' + LATEST_REFRESH)
  .done(function(result){
    if(result.refresh) self._refresh();
    else messageClient({"deviceReporting": "true"})
  })
  .fail(function(){
    // do something
  })
}

var self = {
    init: function(){
        self._destroy();

        pingFn()
        counter = setInterval(pingFn, PING_INTERVAL)
    },

    _refresh: function(){
      if(CLIENT_HANDLES_REFRESH){
          messageClient({"reload": "true"})
      } else window.location.reload();
    },

    _destroy: function(){
        clearInterval(counter);
    }
}

module.exports = self;
