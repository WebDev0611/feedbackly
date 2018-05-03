var TitleResizer = require("../../titleResizer")
var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');

var self = {
  init: function () {

    Bindings.setBindings(".word", _.throttle(self._buttonPressed, 1000))

    PubSub.subscribe('WINDOW_RESIZE', self.resize);
    PubSub.subscribe('CHANGE_LANGUAGE', self.resize);
  },
  destroy: function(){
    Bindings.clearBindings(".word");
  },

  resize: function(){
    TitleResizer.wordResize('.question-type-word')
  },

  _buttonPressed: function(e){
    var $this = $(this)
    LockQ.trigger(()=>{
      $this.addClass("press")
      PubSub.publish('NEXT_QUESTION', $this.attr("logic"));
      var value = $this.attr("field-id");
      PubSub.publish('SAVE_FEEDBACK', {data: [value], type: "Word", targetObj: $this.closest('.input')})
    })
  }
}

module.exports = self;
