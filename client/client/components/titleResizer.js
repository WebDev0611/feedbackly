module.exports =  {
    titleResize: function(targetQuestion) {
      var windowHeight = $(window).height() - $(".header").height()
      var contentHeight = $(targetQuestion).find('.input').height()
      var availableHeightForTitle = windowHeight-contentHeight;
      if(!$("body").hasClass("web") && availableHeightForTitle < 300){
        $(targetQuestion).find('.subtitle, hr').css("margin-bottom", "10px")
      }
      $(targetQuestion).find(".title").css("max-height", availableHeightForTitle-110 + "px")
      $(targetQuestion).find(".title").textfill({maxFontPixels: 100000, minFontPixels: 25, changeLineHeight: true})
      var fontSize = $(targetQuestion).find(".title").find("span").css("font-size");
      $(targetQuestion).find(".title").css("line-height", fontSize)

    },
    resizeElement: function(element){
      $(element).textfill({maxFontPixels: 2000, minFontPixels: 10})
    },
    wordResize: function(targetQuestion) {
        $(targetQuestion).find(".word").each(function() {
          var spanHeight = $(this).find("span").height();
          $(this).textfill({maxFontPixels: 16, changeLineHeight: true})
        })
    }
}
