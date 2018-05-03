var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');


var self = {
  init: function(){
    Bindings.setBindings(".question-type-text button.submit", _.throttle(self._submit, 1000))
  },

  destroy: function(){
    Bindings.clearBindings(".question-type-text button.submit");
  },

  _submit: function(){
    LockQ.trigger(()=>{
      $(this).addClass("press")
      PubSub.publish('NEXT_QUESTION', $(this).attr("logic"))

      var data = ""
      var $input = $(this).closest('.input')

      $input.find('.textarea, textarea').each(function(){
        data+= $(this).attr("data") || $(this).val()
      });

      if(data.length > 0) PubSub.publish('SAVE_FEEDBACK', {data: [data], type: "Text", targetObj: $input})
    })
  }
}

module.exports = self;
