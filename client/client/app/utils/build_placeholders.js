var self = function(){
  $(".input-box").each(function(){
    var $text = $(this).find('.text');

    var text = $text.html() || "&nbsp;"
    var width = $text.css("width") ||  $(this).width()-20;
    if(width == "0px") width = $(this).width()-20  + "px";
    var hasText = $(this).attr("data").length > 0 ? "has-text" : ""
    $(this).removeClass("has-text").addClass(hasText)
    $text.css("width", width)
    $text.html(text);
  })
}

module.exports = self;
