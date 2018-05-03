var CircleAnimation = require('../../circleAnimation');
var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');

var self = {

  _buttonPressed: function(e) {
    LockQ.trigger(() =>{ //triggers only if not locked
      var $this = $(this);
      self._animate(e, $this);
      self._saveAnswer($this);
    })
  },

  init: function() {
    console.log(Bindings.setBindings)
    Bindings.setBindings(".faces .face-vector", _.throttle(self._buttonPressed, 1000))
  },

  destroy: function() {
    Bindings.clearBindings(".faces .face-vector", _.throttle(self._buttonPressed, 1000))
  },

  _saveAnswer: function(targetObj) {
    var value = parseFloat(targetObj.closest('.cont').attr("feedback-value")) || 0;
    PubSub.publish('SAVE_FEEDBACK', {data: [value], type: "Button", targetObj: targetObj})
  },

  _animate: function(e, targetObj) {
    var logic = targetObj.closest('.cont').attr("logic");
    CircleAnimation(e, targetObj, targetObj.parent().parent().find('.text').css("color"), logic)
    setTimeout(function() {
        PubSub.publish('NEXT_QUESTION', logic);
    }, 100)
  }
}

module.exports = self;
