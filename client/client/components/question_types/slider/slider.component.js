var PIXISlider = require('./radial/radial');
var titleResizer = require('./../../titleResizer');
var LockQ = require('./../../../app/utils/check_locked_input');
var Bindings = require('./../../../app/utils/bindings');


var sliders = [];
var pubSubs = [];
var preventScroll = false;

var self = {
  init: function(){

    self.destroy();
    $(".slider").each(function() {
      var slider = PIXISlider($(this), {});
      slider.init()
      sliders.push(slider)
      var h = $(this).find('canvas').height();
      $(this).find('.center-content').height(h);
    })

    titleResizer.resizeElement(".slider-title");


    PubSub.subscribe('WINDOW_RESIZE', function(){
      $(".slider").each(function() {
        var h = $(this).find('canvas').height();
        $(this).find('.center-content').height(h);
      })

      titleResizer.resizeElement(".slider-title");
    })

    Bindings.setBindings(".question-type-slider button", _.throttle(self._saveResponse, 1000))

    pubSubs.push(PubSub.subscribe('SLIDER_DRAGMOVE_START', self._sliderDragMoveStart));
    pubSubs.push(PubSub.subscribe('SLIDER_DRAGMOVE_END', self._sliderDragMoveEnd));

    $(document).on("touchmove", function(e){
      if(preventScroll) e.preventDefault();
    })

  },

  destroy: function(){
    _.forEach(sliders, function(slider) {
      slider.destroy();
      $(".slider").each(function() {
        $(this).find('canvas').remove();
      })

    })

    _.forEach(pubSubs, function(token){
      PubSub.unsubscribe(token);
    })

    $(document).off('touchmove');
    Bindings.clearBindings(".question-type-slider button");
  },

  _saveResponse: function(){
    LockQ.trigger(()=> {
      $(this).addClass("press")
      PubSub.publish('NEXT_QUESTION', $(this).attr("logic"));
      var input = $(this).closest('.input');
      var data = []

      input.find('.slider').each(function(){
        var d = $(this).find('.number').attr('data');

        if(d){
          data.push({data: parseInt($(this).find('.number').attr("data"))/100, id: $(this).attr('slider-id')})
        }
      })
      if (data.length > 0) PubSub.publish('SAVE_FEEDBACK', {data: data, type: "Slider", targetObj: input})
    })
  },

  _sliderDragMoveStart: function(){
    preventScroll = true;
  },

  _sliderDragMoveEnd: function(){
    preventScroll = false;
  }
}

module.exports = self;
