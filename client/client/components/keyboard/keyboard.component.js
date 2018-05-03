var buildPlaceholders = require('./../../app/utils/build_placeholders');
var editedField, inputData = [], caretIndex = 0, toggleChars = "regular", shift=0;


var self = {
    init: function() {
        $(document).on("touchstart", ".key", self._touchKey)
        $(document).on("touchend", ".key", self._touchKeyEnd)
        $(document).on("touchstart", ".input-box", self._touchBox)
        $(document).on("touchstart touchmove", ".char", self._dragCaret)
    },

    destroy: function(){
        $(document).off("touchstart", ".key");
        $(document).off("touchstart", ".input-box");
        $(document).off("touchstart touchmove", ".char");
        $("body").removeClass("keyboard-open")
        $(".keyboard").hide()
        console.log('keyboard destroyed')
    },

    hideKeyboard: function() {
        $(".keyboard").removeClass("show").addClass('hide');
        $("body").removeClass("keyboard-open");
        $(".pad").css("transform", "")
        $(".input-box").removeClass("active");
        $(".char.caret").remove();
        editedField = null; inputData = []; caretIndex = 0; toggleChars = "regular"; shift=0;
        buildPlaceholders()
        $('.current-question .question-inner').css("min-height", $(window).height() + "px");

    },
    showKeyboard: function(){
        $(".keyboard").removeClass("hide").addClass("show")
        $("body").addClass("keyboard-open")
        $('.current-question .question-inner').css("min-height", "");
    },

    _formatDisplayText: function(input){
        var ret = [];
        _.forEach(input, function(e, i) {
          var caret = i == caretIndex-1 ? " caret" : ""
          if(e == " ") e = "&nbsp;"
          var html = "<div class='char" + caret + "'>" + e + "</div>"
          ret.push(html)
        })
        if(caretIndex == 0) ret.unshift("<div class='char caret'>&nbsp;</div>")
        return ret;
    },

  _updateFieldHtml: function(){
    var formatted = self._formatDisplayText(inputData)
    var html = formatted.join("")
    if($('.current-question').hasClass('question-type-contact')){
      $("#dummy-field").html(html);
      var fieldWidth = $("#dummy-field").width();
      editedField.find('.text').width(fieldWidth + 10)
      var caretPos = $("#dummy-field").find('.char.caret').position()
    } else {
      var caretPos = editedField.find('.char.caret').position()
    }
    editedField.find('.text').html(html)
    editedField.attr("data", inputData.join(""))

    var caret = editedField.find('.char.caret');
    editedField.scrollTo(caret)
    if(caretPos) editedField.scrollLeft(caretPos.left)

    setTimeout(function(){
      $(".input-box.active").removeClass("active").addClass("active")
    },1)
  },

    _moveCaretByDrag: function(x, y) {
    $('.char').each(function() {
      // check if is inside boundaries
      if (!(
          x <= $(this).offset().left || x >= $(this).offset().left + $(this).outerWidth() ||
          y <= $(this).offset().top  || y >= $(this).offset().top + $(this).outerHeight()
      )) {

        $('.char').removeClass('caret');
        $(this).addClass('caret');
        caretIndex = $(this).index() + 1
      }
    });
  },

  _touchKey: function() {

    var input = $(this).attr("data")
    if(input){
      if(shift > 0) input = input.toUpperCase();
      if(shift == 1) shift=0;
      inputData.splice(caretIndex, 0, input)
      caretIndex++;
    } else {
      var special = $(this).attr("special");
      if(special == "backspace") {
        inputData.splice(caretIndex-1, 1)
        if(caretIndex>0) caretIndex--;
      }
      if(special == "return" && editedField.hasClass('textarea')){
        inputData.splice(caretIndex, 0, "<br>")
        caretIndex++;
      }
      if(special == "shift"){
        if(shift < 2) shift++;
        else if (shift==2) shift=0;
      }
      if(special == "left"){
        if(caretIndex>0) caretIndex--;
      }
      if(special == "right"){
        if(caretIndex<inputData.length) caretIndex++;
      }
      if(special == "chars"){
        toggleChars = toggleChars == "regular" ? "special" : "regular"
        $(".keyboard").removeClass("regular special").addClass(toggleChars);
      }
      if (special == "hideKeyboard") {
        self.hideKeyboard()
      }
    }

    self._updateFieldHtml();
    if(shift > 0) $(".keyboard").addClass("shift")
    else $(".keyboard").removeClass("shift")

    var $div = $(this)
    $(".keyboard .key").removeClass('down')
    $div.addClass("down")

  },

  _touchKeyEnd: function(){
    $(this).removeClass('down')
  },

  _touchBox: function() {
    var $this = $(this);
    if($this.hasClass("active")) return;
    $('.char').removeClass('caret');
    $(".input-box").removeClass("active");
    editedField = $this;
    editedField.addClass("active")
    inputData = editedField.attr("data").split("")
    caretIndex = inputData.length
    self.showKeyboard()
    self._updateFieldHtml();
    buildPlaceholders()
  },

  _dragCaret: function(evt){
    var touch = evt.originalEvent.touches[0]
    self._moveCaretByDrag(touch.clientX, touch.clientY);
  }
}

module.exports = self;
