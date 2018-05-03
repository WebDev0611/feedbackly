var CircleAnimation = require('../../circleAnimation');
var TitleResizer = require("../../titleResizer")
var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');


var self = {
  init: function(){

    $(".nps-button").each(function(){
      var height = $(this).width();
      $(this).height(height);
      $(this).css("line-height", height + "px");
    })

    PubSub.subscribe('WINDOW_RESIZE', function(){
      $(".nps-button").each(function(){
        var height = $(this).width();
        $(this).height(height);
        $(this).css("line-height", height + "px");
      })
    });

    Bindings.setBindings(".nps-button", _.throttle(self._buttonPressed, 1000))
    PubSub.subscribe('NEXT_QUESTION', self._initAnimate);
  },

  _buttonPressed: function(e){
    var $this = $(this)
    LockQ.trigger(()=>{
      CircleAnimation(e, $this.closest('.input'), 'rgb(131, 133, 155)')
      setTimeout(function() {
          PubSub.publish('NEXT_QUESTION', $this.attr("logic"));
      }, 100)
      self._saveAnswer($this);
    })
  },

  _initAnimate: function(){
    $(".current-question .nps-button").removeClass('scale-in');
    var i=0;
    setTimeout(function(){
      var t = setInterval(function(){
        $(".current-question .nps-button").eq(i).addClass("scale-in");
        i++;
        if(i==$(".current-question .nps-button").length) clearInterval(t);
      }, 40)
    }, 200)
  },

  _saveAnswer: function($this){
    var value = parseFloat($this.attr("value"));
    PubSub.publish('SAVE_FEEDBACK', {data: [value], type: "NPS", targetObj: $this.closest('.input')})
  }
}

module.exports = self;
