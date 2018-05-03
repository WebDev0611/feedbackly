module.exports = {
  init: function(){
    if($("body").hasClass('ipad')){
      $(document).on("touchstart", function(e){
        var $target = $(e.target);
        if($target.closest('#privacy-policy-modal').length == 0){
            e.preventDefault()
        }
      })
    }
  },
  destroy: function(){
    $(document).off("touchmove")
  }
}
