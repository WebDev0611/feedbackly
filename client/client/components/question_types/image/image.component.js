var TitleResizer = require("../../titleResizer")
var LockQ = require('./../../../app/utils/check_locked_input');
var LABEL_ROOM = 50;
var Bindings = require('./../../../app/utils/bindings');

var pubSubTokens = [];

var self = {
  init: function(){
    Bindings.setBindings(".image-container", _.throttle(self._buttonPressed, 1000))

    $(".ipad .question-type-image, .web .question-type-image").each(function(){
     var $images = $(this).find('.image');
    })

    pubSubTokens.push(PubSub.subscribe('NEXT_QUESTION', function(){
      setTimeout(function(){
          $('.ipad .image-container-label').textfill({minFontPixels: 8, maxFontPixels: 22, changeLineHeight: true})
        }, 400)
      setTimeout(function(){
          $('.mobile .image-container-label').textfill({minFontPixels: 8, maxFontPixels: 15, changeLineHeight: true})
      }, 400)
    }));
  },

  _destroy: function(){
    Bindings.clearBindings(".image-container");
    _forEach(pubSubTokens, function(token) {
      PubSub.unsubscribe(token);
    })
  },

  _buttonPressed: function(){
    var $this = $(this)
    LockQ.trigger(()=>{
      $this.addClass("press")
      PubSub.publish('NEXT_QUESTION', $this.attr("logic"));
      self._saveAnswer($this);
    })
  },

  _saveAnswer: function($this){
    var value = $this.attr("value");
    PubSub.publish('SAVE_FEEDBACK', {data: [value], type: "Image", targetObj: $this.closest('.input')})
  }
}

module.exports = self;
