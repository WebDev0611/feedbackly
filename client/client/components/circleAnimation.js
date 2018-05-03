var faded = false;

function reset(){
   if(faded == true)  { $("body").removeClass('reverse-colors').css("background-color", "");
   faded = false;
   setTimeout(()=>{
     $("body").removeClass('no-bg-image')
   }, 600)
 }
}

PubSub.subscribe('NEXT_QUESTION', reset)
PubSub.subscribe('BACK_TO_BEGINNING', reset)


var self = function (e, targetObj, color, logic) {
  var cx = e.clientX || e.originalEvent.touches[0].pageX
  var cy = e.clientY || e.originalEvent.touches[0].pageY

  var $width = $(".circle-animation-container-new").width();
  cx = cx-$width/2;
  cy = cy-$width/2;

  $(".circle-animation-container-new").css("left", cx + "px").css("top", cy + "px").css("background-color", color);
  $(".circle-animation-container-new").addClass("scale");
  if(logic){
    $("body").addClass('no-bg-image reverse-colors').css("background-color", color);
  }

  var firstDuration = $("body").hasClass("mobile") ? 150 : 200;

  setTimeout(()=>{
    $(".circle-animation-container-new").addClass('transparent');
    faded = logic ? true : false;
  }, firstDuration)

  setTimeout(()=>{
    $(".circle-animation-container-new").removeClass("scale transparent").css("background-color", "").css("top", "").css("left", "");
  }, 500)

}
module.exports = self;
