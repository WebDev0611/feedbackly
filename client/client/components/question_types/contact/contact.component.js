var preventExtraFiring = false;
var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');


var self = {
  init: function(){
    $(document).on("touchstart", ".question-type-contact .arrow.next", function(e){e.stopPropagation(); self._pressArrow($(this), 1)})
    $(document).on("touchstart", ".question-type-contact .arrow.previous", function(e){e.stopPropagation(); self._pressArrow($(this), 0)})
    $(document).on("touchstart", ".question-type-contact .input-box", self._pressBox)
    $(document).on("touchstart", ".ipad .question-type-contact button.skip", _.throttle(self._skip, 1000))
    Bindings.setBindings(".question-type-contact button.submit",  _.throttle(self._submit, 1000))
    Bindings.setBindings(".checkbox", self._checkBox);
  },
  destroy: function() {
    $(document).off("touchstart", ".question-type-contact .arrow.next");
    $(document).off("touchstart", ".question-type-contact .arrow.previous");
    Bindings.clearBindings(".question-type-contact button.submit");
    Bindings.clearBindings(".checkbox");
    $(".question-type-contact .input-text").attr("data", "");
  },
  _pressArrow: function($this, direction){
      var container = $this.closest('.pad');
      var index = $this.closest('.input-text').index() + direction
      if(index == -1) index = 0;
      preventExtraFiring = true;
      setTimeout(function(){
        preventExtraFiring = false;
      }, 100)

      $(".input-box").eq(index+1).trigger("touchstart")
      self._activateBoxAtIndex(container, index)
  },

  _pressBox: function(){
    if(preventExtraFiring == false){
      var $this = $(this)
      $this.addClass('pressed')
      var i=0, thisIndex;
      $('.current-question .input-box').each(function(){
        if($(this).hasClass('pressed')) thisIndex = i;
        i++;
      })
      $this.removeClass('pressed')
      var container = $this.closest('.pad');
      console.log(thisIndex)
      self._activateBoxAtIndex(container, thisIndex)
    }
  },

  _activateBoxAtIndex: function(padContainer, index){
    padContainer.addClass("animate");
    var translateX = parseInt(padContainer.attr("translate-x"))

    var newTranslateX = 280-index*500;
    padContainer.css("transform", "translateX("+ newTranslateX + "px)")
    padContainer.find('.arrow').removeClass('previous').addClass('next');
    _.forEach(new Array(index), function(v,i){
      var arrow = padContainer.closest('.question-type-contact').find('.arrow').eq(i);
      arrow.removeClass('next').addClass('previous')
    })

    if(index == 0) padContainer.find('.arrow').removeClass('previous').addClass('next')

  },

  _submit: function(){
    var $input = $(this).closest('.input')

    LockQ.trigger(()=>{
      var data = []

      $input.find('.input-box, input[type=text], .check-group').each(function(){
        var d = {
          id: $(this).attr('field-id'),
          data: $(this).attr("data") || $(this).val()
        }
        if(d.data.length > 0) data.push(d);
      })

      $(this).addClass("press")
      PubSub.publish('NEXT_QUESTION', $(this).attr("logic"))

      if(data.length == 1 && ["true", "false"].indexOf(data[0].data) > -1) return;

      PubSub.publish('SAVE_FEEDBACK', {data: data, type: "Contact", targetObj: $input})
    })
  },

  _skip: function() {
    LockQ.trigger(() =>{
      PubSub.publish('NEXT_QUESTION')
    })
  },

  _checkBox: function(){
    var $this = $(this);
    var $checkGroup = $this.closest('.check-group')
    if($checkGroup.attr("data") == 'false'){
      $this.find('.checkbox-check').show()
      $checkGroup.attr('data', "true")
    } else {
      $this.find('.checkbox-check').hide()
      $checkGroup.attr('data', "false")
    }
  }
}

module.exports = self;
